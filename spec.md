# HalfBuilt

## Current State
Full-stack marketplace app with: Hero, Wall of Failure marquee, Project Graveyard grid (with skeleton placeholders and "Be the first to list" overlay), "How the Resurrection Works" infographic, Project Submission modal, Project Autopsy detail page, Builder Profile dashboard, Project Valuation Tool (sliders + gauge), Graveyard Feed with filtering/sorting and Quick Peek hover overlay, and a Transaction Status page with progress tracker + chat.

## Requested Changes (Diff)

### Add
- `ShareableProjectCard` component: a standalone, visually premium "Flex card" designed for social media screenshots
  - Fixed aspect ratio (e.g. 1200×628 or square 1080×1080 feel) — rendered inside a modal/overlay trigger
  - Large bold project name (display font, prominent)
  - Glowing "Potential Score" circular badge (e.g. 88%) with neon Electric Cyan (#00FFFF / cyan-400) glow
  - "Cause of Death" tag pill with appropriate color coding (reuse getCodColor logic)
  - Footer strip: "Resurrect this on HalfBuilt.com" text + QR code placeholder (SVG grid pattern representing a QR code)
  - High-contrast dark theme: near-black background, Electric Cyan (`#00e5ff` / `cyan-400`) border glow and accent
  - Premium trading card aesthetic: subtle gradient sheen, holographic-style inner border, card corner radius
  - "Copy/Share" button or "Download" trigger visible outside the card frame itself
- A "Share" button on each Project Card and/or on the Project Autopsy page that opens the Shareable Project Card in a modal overlay
- The ShareableProjectCard component lives in `src/components/ShareableProjectCard.tsx`

### Modify
- Project Autopsy page: add a "Share / Flex this" button that opens the ShareableProjectCard modal for the current project
- Project cards in the Graveyard feed: optionally surface a share icon/button

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/components/ShareableProjectCard.tsx`:
   - Accepts props: `projectName`, `potentialScore` (number 0-100 or 0-10, normalise to %), `causeOfDeath`, `price` (optional)
   - Renders a fixed-size card (aspect-ratio locked, ~600×340px rendered, scales with CSS) with:
     - Dark background with subtle radial gradient
     - Electric Cyan border with box-shadow glow (`0 0 24px #00e5ff, 0 0 60px #00e5ff44`)
     - HalfBuilt logo/wordmark top-left
     - Large project name center/left
     - Glowing circular Potential Score gauge (cyan stroke, dark fill, number inside)
     - Cause of Death pill tag
     - Bottom strip: "Resurrect this on HalfBuilt.com" + QR placeholder SVG
   - A wrapping Dialog/Modal with the card inside and a "Share" / close button
2. Add `ShareableProjectCardModal` export with open/close state
3. Wire "Share" trigger button into `ProjectAutopsyPage.tsx`
4. Wire share icon into project cards in main `App.tsx` feed
5. Add `data-ocid` markers on all interactive surfaces (share button, modal, close button)
