# Background music design

## Goal

Add an optional atmospheric music layer to the bilingual portfolio. It must enrich the initial evaluation of the work without taking focus from the projects or ever surprising a visitor with audible playback.

## Playback model

- The playlist is `Filtered_Aperture.mp3` followed by `Through_the_Glass.mp3`; after the second track, it repeats from the first.
- Playback starts only after an explicit user action. Its enabled/disabled choice persists for a return visit.
- Track transitions use a 1–2 second crossfade. A failed load or playback rejection leaves the control in its off state and exposes no broken UI.
- `prefers-reduced-motion` disables the equalizer animation, but not the visitor's ability to play or pause music.
- When motion is allowed, the five equalizer bars use smoothed live frequency data from the active audio rather than a decorative loop. Their transform origin is `center bottom`.

## Control contract

- The equalizer itself is one semantic button, rather than a decorative graphic plus a second control.
- It exposes an accessible name and `aria-pressed`; keyboard focus and activation follow the existing site focus treatment.
- The visual state is reinforced by compact copy: `sound off` before playback and `sound on` while playback is active. A tooltip can repeat the action on hover.
- The control has no effect on the rest of the page and no JavaScript dependency for the portfolio content.

## Live variants to compare

All variants preserve the incumbent terminal-inspired visual identity, its palette, monospaced typography, sharp edges, and restrained density. They differ on one primary axis each.

1. **Status signal — hierarchy.** A four- or five-bar equalizer button sits in the status-bar metadata beside the language control. It is the quietest, most systemic option.
2. **Floating tuner — topology.** A compact fixed lower-right module contains only the equalizer button and its `sound on/off` state. It stays visually independent of the header and avoids reshaping it.
3. **Now-playing line — structural decomposition.** A slim terminal-output line between page sections shows the active track and an equalizer aligned to the opposite edge. It makes the soundtrack an intentional page beat at the cost of a little vertical space.

## Scope and verification

- First deliver exactly these three variants for comparison in the live site on desktop and mobile widths. The selected variant alone becomes production markup and styling.
- Add audio assets through the existing build pipeline; do not edit generated `dist/` files.
- Keep English and Russian labels in the string data.
- Verify no sound starts without a click, start/stop works by mouse and keyboard, state persists across a refresh, crossfade cycles correctly, and both locales work at 390px and desktop widths.
