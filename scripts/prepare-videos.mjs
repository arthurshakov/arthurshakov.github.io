import { mkdir, readdir, rename, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const sourceDir = path.join(root, 'video');
const outputDir = path.join(root, 'src/assets/video');

// Source filenames predate the portfolio slugs in a few cases.
const slugBySource = {
  'glass-decor-h264-2': 'glass-decor',
  'klassnye-sbory': 'klassnie-sbory',
  slsoft: 'sl-soft',
  'rbc-gals-transport': 'hals-summer',
};

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function encode(source, slug, extension, args) {
  const destination = path.join(outputDir, `${slug}.${extension}`);
  const temporary = `${destination}.part.${extension}`;
  if (existsSync(destination)) return;
  if (existsSync(temporary)) await unlink(temporary);
  await run('ffmpeg', ['-y', '-i', source, '-map', '0:v:0', '-an', ...args, '-f', extension, temporary]);
  await rename(temporary, destination);
}

await mkdir(outputDir, { recursive: true });
const sources = (await readdir(sourceDir))
  .filter((file) => file.endsWith('.mp4'))
  .sort();

for (const file of sources) {
  const basename = path.basename(file, '.mp4');
  const slug = slugBySource[basename] || basename;
  const source = path.join(sourceDir, file);
  console.log(`\nPreparing ${slug}`);

  await encode(source, slug, 'mp4', [
    '-vf', 'scale=2560:-2',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '25',
    '-movflags', '+faststart',
  ]);
  await encode(source, slug, 'webm', [
    '-vf', 'scale=2560:-2',
    '-c:v', 'libvpx-vp9',
    '-crf', '33',
    '-b:v', '0',
    '-row-mt', '1',
    '-cpu-used', '4',
  ]);
}
