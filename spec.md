# HalfBuilt

## Current State
The app is a dark glassmorphic landing page for the HalfBuilt marketplace. It includes:
- Navbar with "Start Selling" CTA
- Hero section with stats
- Wall of Failure horizontal scrolling marquee
- Project Graveyard grid with skeleton empty state and "Secure Your Founder Badge" CTA
- How It Works 3-step section
- How the Resurrection Works / Trust & Escrow 3-column section

There is no project submission form or modal. The "Start Selling", "List Yours Free", and "Secure Your Founder Badge" buttons currently link to `#list` anchor but no section with that ID exists.

## Requested Changes (Diff)

### Add
- A `ProjectSubmissionModal` component triggered by:
  - "Start Selling" button in Navbar
  - "List Yours Free" button in Hero
  - "Secure Your Founder Badge" button in Graveyard empty state
- Modal fields:
  - **Project Name** — text input
  - **GitHub Repository URL** — text input with inline "Verify" button that simulates verification (loading state → success/error)
  - **Reason for Abandonment** — textarea
  - **Asking Price** — number input with `$` prefix
- **Publicity toggle** — two-option segmented control: "List on Graveyard" vs "Private Sale"
- **Submit button** — "Submit for Review" 
- **Footer note** inside modal — "Manual review by the HalfBuilt team for quality assurance"
- A new `#list` section anchor so the nav links scroll correctly

### Modify
- Navbar "Start Selling" button → opens modal
- Hero "List Yours Free" button → opens modal
- Graveyard "Secure Your Founder Badge" button → opens modal
- Remove `href="#list"` from those CTAs since they now open a modal

### Remove
- Nothing removed

## Implementation Plan
1. Create `ProjectSubmissionModal` component in `src/components/`
2. Add open/close state in `App.tsx` using `useState`
3. Wire all three CTA buttons to set modal open = true
4. Form state: projectName, githubUrl, verifyStatus (idle/loading/success/error), abandonReason, askingPrice, publicity (graveyard | private)
5. Simulate GitHub verification: 1.5s loading then random success/error for UX demo
6. On submit: show success toast/state then close modal
7. Add `data-ocid` markers to all form fields, buttons, toggles, and modal container
