// Продакшн-сборка статики в dist/.
//   node src/build.mjs
// Делает: SCSS -> dist/styles.css, рендер /index.html (en) и /ru/index.html,
// копирует app.js и резюме, гонит скриншоты через sharp (avif + webp + jpg, полный + thumb).

import { mkdir, rm, writeFile, copyFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import * as sass from 'sass';
import sharp from 'sharp';

import { renderPage } from './template.mjs';
import { audioTracks } from './data/audio.mjs';
import { projects } from './data/projects.mjs';

const root = path.join(import.meta.dirname, '..');
const p = (...s) => path.join(root, ...s);

// Полный кадр отдаём в исходном разрешении (~3000px, без адресной строки браузера),
// только пережимаем. Миниатюра ленты — 1000px по ширине (крупная, чтобы не мылила).
const THUMB_W = 1000;

const WEBP_Q = 90;
const AVIF_Q = 90;
const JPEG_Q = 82; // растровый фолбэк для древних браузеров

// slug -> имя готового скриншота в screenshots/without-url-bar/.
const SHOT_SRC = {
  'glass-decor': 'glass-decor.ru.webp',
  hill8: 'hill8.webp',
  krylatskaya33: 'krylatrskaya33.webp',
  'power-x-time': 'tass-power-x-time.linestest.com.webp',
  'tass-rzhd-bam': 'tass-rzhd-bam.webp',
  'vmeste-ai': 'tass.ru_specialprojects_vmeste-ai.webp',
  'best-cashier': 'best-cashier.food.ru.webp',
  'klassnie-sbory': 'klassnie-sbory.food.ru.webp',
  'sl-soft': 'slsoft.ru.webp',
  'etalon-group': 'etalongroup.com.webp',
  'career-nornickel': 'career.nornickel.ru.webp',
  'astra-drive': 'astradrive.net.webp',
  'rbc-moskvich': 'rbc-moskvich.webp',
  'rbc-tank': 'rbc-tank.webp',
  'katty-pro': 'katty-pro.webp',
  'hals-summer': 'hals-summer.webp',
  dreamriva: 'dreamriva.webp',
};

async function newer(src, dst) {
  if (!existsSync(dst)) return true;
  const [a, b] = await Promise.all([stat(src), stat(dst)]);
  return a.mtimeMs > b.mtimeMs;
}

async function buildCss() {
  const res = sass.compile(p('src/styles/main.scss'), {
    style: 'compressed',
    loadPaths: [p('src/styles')],
  });
  await writeFile(p('dist/styles.css'), res.css);
}

// Инлайнится в <head> (см. renderPage) — держит первый пейнт независимо
// от того, успел ли загрузиться внешний styles.css.
function compileCriticalCss() {
  return sass.compile(p('src/styles/_critical.scss'), {
    style: 'compressed',
    loadPaths: [p('src/styles')],
  }).css;
}

async function buildPages(shots, criticalCss) {
  await writeFile(p('dist/index.html'), renderPage('en', shots, criticalCss));
  await mkdir(p('dist/ru'), { recursive: true });
  await writeFile(p('dist/ru/index.html'), renderPage('ru', shots, criticalCss));
}

async function copyStatic() {
  await copyFile(p('src/scripts/app.js'), p('dist/app.js'));
  await copyFile(p('src/scripts/pjax.js'), p('dist/pjax.js'));
  await copyFile(p('src/scripts/audio-player.js'), p('dist/audio-player.js'));
  await copyFile(p('src/scripts/audio-controls.js'), p('dist/audio-controls.js'));
  await copyFile(p('src/scripts/audio-visualizer.js'), p('dist/audio-visualizer.js'));
  await copyFile(p('src/scripts/grid-animation.js'), p('dist/grid-animation.js'));
  await copyFile(p('src/scripts/preview-slider.js'), p('dist/preview-slider.js'));
  await copyFile(p('src/vendor/lenis.min.js'), p('dist/lenis.min.js'));
  await copyFile(p('src/vendor/gsap.min.js'), p('dist/gsap.min.js'));
  await copyFile(p('src/vendor/Draggable.min.js'), p('dist/Draggable.min.js'));
  await copyFile(p('src/vendor/InertiaPlugin.min.js'), p('dist/InertiaPlugin.min.js'));
  const audioDir = p('dist/assets/audio');
  await mkdir(audioDir, { recursive: true });
  await Promise.all(
    audioTracks.map(({ file }) =>
      copyFile(p('audio', file), path.join(audioDir, file))
    )
  );
  const sourceVideoDir = p('src/assets/video');
  if (existsSync(sourceVideoDir)) {
    const videoDir = p('dist/assets/video');
    const videoFiles = (await readdir(sourceVideoDir)).filter((file) => /\.(mp4|webm)$/i.test(file));
    await mkdir(videoDir, { recursive: true });
    await Promise.all(
      videoFiles.map((file) => copyFile(path.join(sourceVideoDir, file), path.join(videoDir, file)))
    );
  }
  const resume = p('arthur-shakov-resume.pdf');
  if (existsSync(resume)) {
    await copyFile(resume, p('dist/assets/arthur-shakov-resume.pdf'));
  } else {
    console.warn('!  arthur-shakov-resume.pdf не найден — пропускаю');
  }
}

// Возвращает манифест slug -> { shot, thumb }, где значения — 'avif' | 'webp':
// какой из современных форматов вышел легче и попал в сборку (второй удаляется).
// Плюс всегда пишется .jpg как растровый фолбэк.
async function buildImages() {
  const srcDir = p('screenshots/without-url-bar');
  if (!existsSync(srcDir)) {
    console.warn('!  screenshots/without-url-bar/ не найден — пропускаю картинки');
    return {};
  }
  const outDir = p('dist/assets/shots');
  const manifest = {};
  let made = 0;

  // Один вариант кадра (base + ширина): собрать avif и webp, оставить меньший.
  async function variant(src, base, width) {
    const avifPath = path.join(outDir, `${base}.avif`);
    const webpPath = path.join(outDir, `${base}.webp`);
    const jpgPath = path.join(outDir, `${base}.jpg`);
    const resize = (pipe) =>
      width ? pipe.resize({ width, withoutEnlargement: true }) : pipe;

    if (await newer(src, jpgPath)) {
      await resize(sharp(src)).jpeg({ quality: JPEG_Q, mozjpeg: true }).toFile(jpgPath);
      made++;
    }

    // Инкрементально: если выбор прошлой сборки ещё валиден (ровно один из
    // современных файлов на месте и новее исходника) — переиспользуем его.
    const haveAvif = existsSync(avifPath);
    const haveWebp = existsSync(webpPath);
    const stale = (await newer(src, avifPath)) && (await newer(src, webpPath));
    if (!stale && haveAvif !== haveWebp) return haveAvif ? 'avif' : 'webp';

    await Promise.all([
      resize(sharp(src)).avif({ quality: AVIF_Q }).toFile(avifPath),
      resize(sharp(src)).webp({ quality: WEBP_Q }).toFile(webpPath),
    ]);
    made += 2;
    const [a, w] = await Promise.all([stat(avifPath), stat(webpPath)]);
    const winner = a.size <= w.size ? 'avif' : 'webp';
    await rm(winner === 'avif' ? webpPath : avifPath, { force: true });
    return winner;
  }

  for (const { slug } of projects) {
    const srcName = SHOT_SRC[slug];
    const src = srcName && path.join(srcDir, srcName);
    if (!src || !existsSync(src)) {
      console.warn(`!  нет скриншота для ${slug} (${srcName || '—'})`);
      continue;
    }
    manifest[slug] = {
      shot: await variant(src, slug, null),
      thumb: await variant(src, `${slug}-thumb`, THUMB_W),
    };
  }

  await writeFile(path.join(outDir, '_manifest.json'), JSON.stringify(manifest, null, 2));
  if (made) console.log(`   изображений записано: ${made}`);
  return manifest;
}

async function main() {
  const t0 = Date.now();
  // dist чистим, но dist/assets/shots сохраняем как кэш картинок
  if (existsSync(p('dist'))) {
    for (const entry of await readdir(p('dist'))) {
      if (entry === 'assets') continue;
      await rm(p('dist', entry), { recursive: true, force: true });
    }
    if (existsSync(p('dist/assets'))) {
      for (const entry of await readdir(p('dist/assets'))) {
        if (entry === 'shots') continue;
        await rm(p('dist/assets', entry), { recursive: true, force: true });
      }
    }
  }
  await mkdir(p('dist/assets/shots'), { recursive: true });

  const shots = await buildImages();
  const criticalCss = compileCriticalCss();
  await Promise.all([buildCss(), buildPages(shots, criticalCss), copyStatic()]);

  console.log(`✓ build → dist/  (${Date.now() - t0}ms)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
