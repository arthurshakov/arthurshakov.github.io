---
name: Arthur Shakov Portfolio
description: A bilingual terminal-inspired archive of selected frontend work.
colors:
  background: "#0A0C0A"
  panel: "#0B0E0B"
  elevated: "#0E110E"
  line-faint: "#171C17"
  line: "#1C221C"
  line-strong: "#2A322A"
  text: "#C4CFC0"
  text-bright: "#E9EFE4"
  text-secondary: "#93A08F"
  text-tertiary: "#7E8B7B"
  accent: "#A8E05B"
  accent-hover: "#C4EC8A"
typography:
  body:
    fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace"
    fontSize: "12px"
    fontWeight: 500
rounded:
  none: "0"
spacing:
  mobile-gutter: "20px"
  desktop-gutter: "48px"
components:
  active-pill:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.background}"
    rounded: "{rounded.none}"
    padding: "3px 7px"
  passive-pill:
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.none}"
    padding: "3px 7px"
  preview-media:
    aspectRatio: "319 / 180"
    backgroundColor: "{colors.background}"
    border: "1px solid {colors.line-strong}"
    rounded: "{rounded.none}"
    overflow: "hidden"
  music-tuner:
    backgroundColor: "{colors.panel}"
    border: "1px solid {colors.line-strong}"
    textColor: "{colors.text-tertiary}"
    rounded: "{rounded.none}"
    minHeight: "44px"
---

# Design System: Arthur Shakov Portfolio

## Overview

**Creative North Star: "Signal Archive"**

A dark, terminal-inspired portfolio where the work remains primary and the interface reads as a precise working environment. Lime is a rare signal colour, never a broad decorative surface; its job is to show an active choice, a focused action, or a live status.

**Key Characteristics:**

- Flat, monochrome surfaces with hairline structural borders.
- One monospaced voice, tuned for dense project metadata rather than technical costume.
- Sparse lime signals for state, focus, and action.
- A static vertical grid and editorial rail create the page rhythm.

## Colors

Near-black greens establish depth through tonal separation; the lime accent appears only at meaningful interaction and status moments.

### Primary

- **Signal Lime** (#A8E05B): active language pill, prompt, links, focus, selected preview, and live state.
- **Signal Lime Light** (#C4EC8A): hover state for links and accent affordances.

### Neutral

- **Archive Black** (#0A0C0A): page field.
- **Console Panel** (#0B0E0B): status-bar surface.
- **Lifted Console** (#0E110E): preview address surface.
- **Structural Line** (#1C221C): section divisions and editor rail.
- **Strong Line** (#2A322A): image, chip, and table-header outlines.
- **Archive Text** (#C4CFC0): default readable text.
- **Bright Text** (#E9EFE4): names and strong metadata.
- **Quiet Text** (#7E8B7B): terminal prefixes, flags, and secondary structure.

**The Rare Signal Rule.** Lime represents a state or action. It must not become a large decorative fill or a second background.

## Typography

**Display Font:** JetBrains Mono, with ui-monospace and SF Mono fallbacks.

**Character:** One measured mono voice makes project names, terminal language, and small metadata feel like parts of the same archive. Weight, brightness, and spacing create hierarchy; a second display face is unnecessary.

### Hierarchy

- **Body** (400, 13px, 1.55): portfolio description and core metadata.
- **Title** (700, 24px, 1.55): person name and exceptional hierarchy moments.
- **Label** (500, 11–13px): section headers, flags, chips, and status-bar controls.

**The Single Voice Rule.** New interface elements inherit the mono system; hierarchy comes from size, weight, and colour roles, not a new type family.

## Layout

The page is a single scrolling archive, capped at 1440px and frozen at 1920px. Desktop has a 64px editor rail and a horizontal status bar; mobile uses 20px gutters and a two-line status bar. The static vertical grid uses 64px columns on desktop and 52px on mobile. New controls must obey this rhythm and must not disturb project scanning.

## Elevation & Depth

The interface is flat by default. Borders and subtle tonal surface changes create separation; it has no general shadow vocabulary. A floating music-control variant may test a restrained elevation treatment during comparison, but the accepted implementation must earn it through the selected layout rather than introduce it as a default system rule.

## Shapes

Forms are square and structural: 0px radius, 1px borders, and rectangular active fills. Pills are compact language or filter controls, not a general container style. Icons are inline SVG with a consistent 24px coordinate system and 1.7px stroke where outlined.

## Components

### Status Bar

- **Shape:** full-width panel with a bottom 1px structural line.
- **Typography:** prompt is a mixed-brightness terminal string; metadata is subdued.
- **Responsive treatment:** one desktop row; two mobile rows.
- **States:** language pills use lime fill only for the current language.

### Interactive Controls

- **Shape:** transparent at rest, no browser-default button chrome, square edges.
- **Focus:** existing 2px lime focus outline with offset.
- **States:** active state may animate only when motion is allowed; static state must remain equally legible.

### Music Tuner

- **Placement:** a compact fixed control at the lower right, deliberately separate from the status-bar rhythm.
- **Surface:** console-panel fill and a structural 1px border; no shadow, radius, or extra colour treatment.
- **Feedback:** five vertical bars rise from `center bottom` using live audio frequency data only while playback is active. The lime state and concise label make the control legible even when motion is reduced.

### Chips and Preview Thumbnails

- **Shape:** 1px outlined rectangles; selected state is lime fill for chips and 2px lime outline for thumbnails.
- **Hover:** uses the existing accent or structural-line hover treatment; no soft card elevation.

### Preview Media

- **Fallback:** every project preview starts as a static screenshot; it remains visible until its video has a decoded frame.
- **Frame:** the preview container uses the prepared videos’ `319:180` display ratio; the screenshot and video both cover that frame so their transition does not shift or reveal mismatched edges.
- **Playback:** a project may opt into a muted, inline loop with WebM as the preferred source and H.264/MP4 as fallback. Playback begins only when the preview is visible, pauses when it is hidden or another project is selected, and resumes when the video project returns.
- **Motion preference:** `prefers-reduced-motion` deliberately keeps the static screenshot. The still image remains the complete no-JavaScript experience.

## Do's and Don'ts

### Do:

- **Do** use existing CSS colour roles and JetBrains Mono for every new portfolio control.
- **Do** make interaction state explicit through lime, labels, focus rings, and semantic HTML.
- **Do** preserve the status bar's compact information rhythm on both breakpoints.
- **Do** honour reduced-motion preferences by retaining readable static states.
- **Do** keep a static project screenshot visible until optional preview media is ready.

### Don't:

- **Don't** add rounded cards, gradients, glass decoration, or a new colour family.
- **Don't** turn the equalizer into a purely decorative icon; it must remain a clear accessible button.
- **Don't** use lime as a broad surface outside a meaningful active state.
