# Background Music Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (\`- [ ]\`) syntax for tracking.

**Goal:** Add an opt-in two-track atmospheric playlist with crossfading and let the author select one of three accessible, minimal equalizer controls in the live portfolio.

**Architecture:** A small browser-only \`audio-player.js\` module owns playlist state, persistence, and audio-element crossfades. A lazy Web Audio analyser connects to audio only after a visitor starts playback and exposes smoothed frequency data to the five equalizer bars. The template supplies localized semantic control markup; \`app.js\` connects it to the player as progressive enhancement. \`build.mjs\` copies the two supplied MP3 files into the production asset tree. Impeccable Live stages three composition variants around the shared control and persists only the author-selected variant.

**Tech Stack:** Node.js ESM, Node test runner, vanilla browser JavaScript, HTML audio elements, Sass, Impeccable Live.

**Spec:** \`docs/superpowers/specs/2026-09-06-background-music-design.md\`

## Global Constraints

- Use \`audio/Filtered_Aperture.mp3\` followed by \`audio/Through_the_Glass.mp3\`; loop the playlist and crossfade each transition for 1–2 seconds.
- Never begin audible playback without an explicit visitor action; retain the visitor's enabled/disabled choice across refreshes.
- Preserve functionality without JavaScript and retain English/Russian localization.
- The control is one keyboard-operable semantic button with an accessible name and \`aria-pressed\` state.
- \`prefers-reduced-motion: reduce\` suppresses equalizer movement, not playback control.
- Equalizer motion uses smoothed live frequency data, grows from \`center bottom\`, and is never initialized before explicit playback.
- Copy source assets through the build pipeline; never edit generated \`dist/\` output.

---

### Task 1: Define and test the isolated playlist controller

**Files:**
- Create: \`src/scripts/audio-player.js\`
- Create: \`test/audio-player.test.mjs\`

**Interfaces:**
- Produces: \`createPlaylistPlayer(options)\`, returning \`{ start(), stop(), toggle(), subscribe(listener), getState(), destroy() }\`.
- Consumes: \`tracks: string[]\`, \`audioFactory(src)\`, \`storage\`, \`crossfadeMs\`, and timer seams.
- Emits: \`{ playing: boolean, trackIndex: number }\` to each subscribed listener.

- [ ] **Step 1: Write the failing controller tests**

\`\`\`js
import assert from 'node:assert/strict';
import test from 'node:test';
import { createPlaylistPlayer } from '../src/scripts/audio-player.js';

test('starts only when requested and persists enabled state', async () => {
  const { player, audios, storage } = makePlayer();
  assert.equal(audios.length, 0);
  await player.start();
  assert.equal(audios[0].playCalls, 1);
  assert.equal(storage.getItem('portfolio:music'), 'on');
});

test('crossfades into the next track and wraps to the first', async () => {
  const { player, audios, timers } = makePlayer({ crossfadeMs: 1000 });
  await player.start();
  audios[0].emit('ended');
  assert.equal(audios[1].playCalls, 1);
  timers.flush();
  assert.equal(audios[0].paused, true);
});

test('returns to off when browser playback is rejected', async () => {
  const { player } = makePlayer({ rejectPlay: true });
  await assert.rejects(player.start());
  assert.deepEqual(player.getState(), { playing: false, trackIndex: 0 });
});
\`\`\`

The fixture's fake audio needs \`play()\`, \`pause()\`, \`volume\`, \`addEventListener()\`, \`removeEventListener()\`, and \`emit('ended')\`; its timer fixture records callbacks and runs them in \`flush()\`.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: \`node --test test/audio-player.test.mjs\`

Expected: FAIL because \`src/scripts/audio-player.js\` does not exist.

- [ ] **Step 3: Implement the minimal controller**

\`\`\`js
export function createPlaylistPlayer({
  tracks,
  audioFactory = (src) => new Audio(src),
  storage = window.localStorage,
  crossfadeMs = 1500,
  setTimer = window.setInterval,
  clearTimer = window.clearInterval,
}) {
  // Keep currentIndex, currentAudio, playing, listeners, and fade timer private.
  // start() creates an audio lazily, awaits play(), persists 'on', and notifies.
  // ended starts the next source at volume 0, fades both volumes for crossfadeMs,
  // then pauses the old source and makes the new source current.
}
\`\`\`

Clamp volume to \`[0, 1]\`, remove stale \`ended\` handlers, and clear scheduled fade work in \`stop()\` and \`destroy()\`. A rejected \`play()\` must leave the controller stopped and rethrow for the UI layer to handle.

- [ ] **Step 4: Run focused and complete tests**

Run: \`node --test test/audio-player.test.mjs && npm test\`

Expected: all existing tests plus the new controller tests PASS.

- [ ] **Step 5: Commit the controller**

\`\`\`bash
git add src/scripts/audio-player.js test/audio-player.test.mjs
git commit -m "Add playlist audio controller"
\`\`\`

### Task 2: Ship the two supplied audio files through the static build

**Files:**
- Modify: \`src/build.mjs:1-86\`
- Create: \`test/build-audio.test.mjs\`

**Interfaces:**
- Produces: \`/assets/audio/filtered-aperture.mp3\` and \`/assets/audio/through-the-glass.mp3\` in \`dist/\`.
- Consumes: the two named MP3 source files in \`audio/\`.

- [ ] **Step 1: Write the failing build assertion**

\`\`\`js
test('copies the selected playlist assets into dist', async () => {
  await buildProject();
  await assert.doesNotReject(access(path.join(dist, 'assets/audio/filtered-aperture.mp3')));
  await assert.doesNotReject(access(path.join(dist, 'assets/audio/through-the-glass.mp3')));
});
\`\`\`

Use a temporary copy of the repository fixture or save/restore \`dist/\` in test setup so the test never changes source assets.

- [ ] **Step 2: Run the test to verify it fails**

Run: \`node --test test/build-audio.test.mjs\`

Expected: FAIL because neither target asset exists.

- [ ] **Step 3: Implement \`copyAudio()\` and include it in \`copyStatic()\`**

\`\`\`js
const audioFiles = {
  'Filtered_Aperture.mp3': 'filtered-aperture.mp3',
  'Through_the_Glass.mp3': 'through-the-glass.mp3',
};

async function copyAudio() {
  const outDir = p('dist/assets/audio');
  await mkdir(outDir, { recursive: true });
  await Promise.all(Object.entries(audioFiles).map(([source, output]) =>
    copyFile(p('audio', source), path.join(outDir, output))
  ));
}
\`\`\`

Call \`copyAudio()\` from \`copyStatic()\` and retain the existing resume fallback.

- [ ] **Step 4: Run the build and tests**

Run: \`node --test test/build-audio.test.mjs && npm run build\`

Expected: PASS; both MP3 files exist below \`dist/assets/audio/\` and the existing page build still completes.

- [ ] **Step 5: Commit the build asset integration**

\`\`\`bash
git add src/build.mjs test/build-audio.test.mjs audio/Filtered_Aperture.mp3 audio/Through_the_Glass.mp3
git commit -m "Ship portfolio music assets"
\`\`\`

### Task 3: Add localized, accessible shared control markup and browser binding

**Files:**
- Modify: \`src/data/strings.mjs\`
- Modify: \`src/template.mjs:34-88\`
- Modify: \`src/scripts/app.js:1-18, after Lenis initialization\`
- Modify: \`src/build.mjs:71-82\`
- Modify: \`src/styles/_statusbar.scss\`
- Create: \`test/audio-control.test.mjs\`

**Interfaces:**
- Consumes: \`createPlaylistPlayer()\` and buttons marked \`[data-audio-toggle]\`.
- Produces: \`data-audio-state="off|on"\`, synchronized \`aria-pressed\`, localized screen-reader text, and a state label marked \`[data-audio-label]\`.

- [ ] **Step 1: Write failing rendered-markup and binding tests**

\`\`\`js
test('renders an off audio button in both locales', () => {
  for (const lang of ['en', 'ru']) {
    const html = renderPage(lang);
    assert.match(html, /<button[^>]*data-audio-toggle[^>]*aria-pressed="false"/);
    assert.match(html, /data-audio-label/);
  }
});

test('clicking the control reflects player state', async () => {
  const { button, player } = mountAudioControl();
  await button.click();
  assert.equal(button.getAttribute('aria-pressed'), 'true');
  assert.equal(player.startCalls, 1);
});
\`\`\`

Use a purpose-built fake element with \`addEventListener\`, \`setAttribute\`, \`dataset\`, and \`textContent\`; do not add a browser-test dependency for this behavior.

- [ ] **Step 2: Run targeted tests to verify failure**

Run: \`node --test test/audio-control.test.mjs\`

Expected: FAIL because the template has no audio control and \`app.js\` has no audio binding.

- [ ] **Step 3: Add shared, localization-driven markup and bind it**

Add \`audio\` copy to both locales: \`on\`, \`off\`, and a screen-reader action label. Add a template helper that outputs one \`<button type="button" class="audio-control" data-audio-toggle aria-pressed="false" data-audio-state="off">\` containing a five-bar \`aria-hidden="true"\` equalizer and a \`[data-audio-label]\` span. In \`app.js\`, import \`createPlaylistPlayer\`, construct it only when an audio toggle exists, then synchronize every matching control from \`subscribe()\`; when \`start()\` rejects, restore off state without throwing from the click handler.

Copy \`src/scripts/audio-player.js\` into \`dist/audio-player.js\` beside \`app.js\`, so its browser import remains \`./audio-player.js\`.

- [ ] **Step 4: Style the shared control contract**

Give \`.audio-control\` a transparent surface, no browser-default border, inherited mono typography, the existing accent focus outline, and a fixed equalizer footprint. Use CSS custom properties or BEM modifiers for on/off state; animate bars only under \`@media (prefers-reduced-motion: no-preference)\`.

- [ ] **Step 5: Verify behavior and build**

Run: \`node --test test/audio-control.test.mjs && npm test && npm run build\`

Expected: PASS; generated EN and RU HTML contains one functional, localized control and \`dist/audio-player.js\` exists.

- [ ] **Step 6: Commit shared UI behavior**

\`\`\`bash
git add src/data/strings.mjs src/template.mjs src/scripts/app.js src/scripts/audio-player.js src/styles/_statusbar.scss src/build.mjs test/audio-control.test.mjs
git commit -m "Add accessible music control"
\`\`\`

### Task 3A: Drive the equalizer from live audio data

**Files:**
- Create: \`src/scripts/audio-visualizer.js\`
- Modify: \`src/scripts/audio-player.js\`, \`src/scripts/audio-controls.js\`, \`src/scripts/app.js\`, and \`src/build.mjs\`
- Create: \`test/audio-visualizer.test.mjs\`

**Interfaces:**
- Produces: \`createAudioVisualizer()\`, returning \`{ attach(audio), resume(), sample(), reset(), destroy() }\`.
- Consumes: lazy \`AudioContext\`, \`MediaElementAudioSourceNode\`, and \`AnalyserNode\` browser APIs; tests inject a graph factory.
- Produces: five normalized bar values in \`[0, 1]\`; the binding writes each one to \`--audio-level\`.

- [ ] **Step 1: Write failing visualizer tests**

\`\`\`js
test('maps analyser data to five normalized levels', () => {
  const visualizer = createAudioVisualizer({ graph: fakeGraph([0, 64, 128, 192, 255]) });
  assert.deepEqual(visualizer.sample(), [0, 0.25, 0.5, 0.75, 1]);
});
\`\`\`

- [ ] **Step 2: Run the test to verify it fails**

Run: \`node --test test/audio-visualizer.test.mjs\`

Expected: FAIL because \`audio-visualizer.js\` does not exist.

- [ ] **Step 3: Implement and connect the analyser**

Create and resume the audio context only in the click-triggered \`start()\` path. Connect every lazily created media element source to one analyser and the destination exactly once. Average five distributed frequency bands, normalize and smooth them, then update the five bar CSS levels from one request-animation-frame loop while playback is on. Reset levels when playback stops and skip the loop when reduced motion is requested. Bar transforms use \`transform-origin: center bottom\`.

- [ ] **Step 4: Verify the response and regression suite**

Run: \`node --test test/audio-visualizer.test.mjs && npm test && npm run build\`

Expected: PASS; the bars react to music while playing and remain static under reduced motion.

- [ ] **Step 5: Commit the audio-reactive equalizer**

\`\`\`bash
git add src/scripts/audio-visualizer.js src/scripts/audio-player.js src/scripts/audio-controls.js src/scripts/app.js src/build.mjs test/audio-visualizer.test.mjs
git commit -m "Animate equalizer from audio data"
\`\`\`


### Task 4: Stage and select three Impeccable Live variants

**Files:**
- Modify temporarily through Impeccable Live: \`src/template.mjs\`, \`src/styles/_statusbar.scss\`, and a new scoped style partial only if a selected layout needs it.
- Create after selection only: \`src/styles/_audio-control.scss\` when shared control styles would otherwise make \`_statusbar.scss\` carry floating and section layouts.

**Interfaces:**
- Consumes: the semantic \`.audio-control\` markup from Task 3.
- Produces: exactly one accepted production placement and no \`data-impeccable-*\` wrappers or scoped preview CSS.

- [ ] **Step 1: Start the dev server and Live helper**

Run: \`npm run dev\`, then \`node .agents/skills/impeccable/scripts/live.mjs --target src/template.mjs\`.

Open \`http://localhost:5173/\`, select the rendered audio control, and request three variants with the confirmed brief: terminal identity; one status-bar signal, one lower-right floating tuner, one between-section now-playing line; keep the equalizer button semantic and all existing palette/type tokens.

- [ ] **Step 2: Deliver three identity-preserving variants**

Use Live's generated source wrapper and create one full replacement per variant:

\`\`\`text
1. Status signal: compact horizontal control in .statusbar-meta__content.
2. Floating tuner: fixed lower-right module with ON AIR and current-track slot.
3. Now-playing line: slim terminal-output row between existing sections.
\`\`\`

Do not alter project copy, colors, fonts, or unrelated components. Reply \`done\` through \`live-poll.mjs\` and keep polling until the author accepts one variant or discards the comparison.

- [ ] **Step 3: Persist the accepted variant and remove live artifacts**

On acceptance, move any accepted CSS into \`_statusbar.scss\` or \`_audio-control.scss\`, keep only the accepted semantic markup in \`template.mjs\`, and remove every Impeccable wrapper, parameter attribute, preview \`<style>\`, and \`data-impeccable-*\` attribute. Preserve the same \`data-audio-toggle\` contract used by \`app.js\`.

- [ ] **Step 4: Test the chosen layout at both breakpoints and locales**

Run: \`npm run build\`, then inspect \`/\` and \`/ru/\` at 390px and 1440px. Confirm the control is visible, does not overlap language controls or content, supports keyboard focus, has no motion when reduced motion is enabled, and starts/stops music with a click.

- [ ] **Step 5: Run the Impeccable detector and commit only the accepted UI**

Run: \`node /Users/simonmoon/.agents/skills/impeccable/scripts/detect.mjs --json src/template.mjs src/styles/_statusbar.scss src/styles/_audio-control.scss\`

Expected: no unresolved mechanical quality finding. Omit \`_audio-control.scss\` from the command if the selected layout does not create it.

\`\`\`bash
git add src/template.mjs src/styles/_statusbar.scss src/styles/_audio-control.scss
git commit -m "Place music equalizer control"
\`\`\`

### Task 5: Verify the finished music experience

**Files:**
- Modify only if verification exposes a concrete defect: the responsible source or test file from Tasks 1–4.

- [ ] **Step 1: Run the complete automated suite and production build**

Run: \`npm test && npm run build\`

Expected: PASS and a successful \`✓ build → dist/\` message.

- [ ] **Step 2: Perform a browser verification matrix**

Verify on \`/\` and \`/ru/\` at 390px and 1440px:

\`\`\`text
Initial load: no audible playback; button says off and aria-pressed=false.
Click/Enter/Space: audio starts; button says on and aria-pressed=true.
Refresh: persisted preference is reflected without violating autoplay policy.
Track end: next track fades in over 1–2 seconds; second track wraps to the first.
Playback rejection or missing media: control returns to off without uncaught errors.
Reduced motion: equalizer bars remain static while the control still works.
\`\`\`

- [ ] **Step 3: Record the result**

If every check passed, report the completed verification matrix. If a check failed,
return to the task that owns the failed interface, add a regression test, apply the
smallest correction, and rerun this task's first two steps before committing that
focused correction.
