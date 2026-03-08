# HalfBuilt

## Current State
A dark-mode marketplace landing page for abandoned side projects. Features: Navbar, Hero section, Wall of Failure marquee (glassmorphic X/Reddit-style cards), Project Graveyard grid (empty state with skeleton cards + overlay), How It Works, How the Resurrection Works (trust & escrow), List CTA, Footer, and a Project Submission modal. All in App.tsx as a single-page layout.

## Requested Changes (Diff)

### Add
- **ProjectAutopsyPage component**: A new full-page view for a specific project's "autopsy" detail, accessible by clicking "View Project" on a project card (or navigable via a `?page=autopsy` state toggle in the single-page app).
- **Two-column layout** on the autopsy page:
  - **Left column**: Large "Cause of Death" badge (styled prominently, e.g. "Marketing Fatigue" in red/orange with skull icon), followed by a `<section>` labeled "The Story" containing ~500 words of narrative text about the project's failure (sample content for the demo project "FlowSync").
  - **Right column**: "Vital Signs" box — medical-report style panel with monospace fonts and thin cyan borders showing: Total Users, Tech Stack (pill badges for React/Flask with colored icons), GitHub Stars, and Age of Repo.
- **Revive CTA** at the bottom of the page: Large neon/glow button "Revive This Project for $2,400" (using the project's price).
- **Back navigation**: A "← Back to Graveyard" link at the top of the autopsy page to return to the main landing page.
- **Medical Report aesthetic**: Monospace fonts for all data fields, thin `1px` cyan (`oklch(0.7 0.15 195)`) borders on panels, subtle background scanline/grid texture, "PATIENT REPORT" header stamp, section labels styled like medical form field headers (uppercase mono tracking-widest).

### Modify
- **ProjectCard "View Project" button**: Wire it up to navigate to the autopsy page (pass the project as state; for the demo, clicking any card opens the autopsy view for that project).
- **App root**: Add simple client-side state (`activePage: 'home' | 'autopsy'`) to conditionally render either the landing page or the ProjectAutopsyPage.

### Remove
- Nothing removed from existing sections.

## Implementation Plan
1. Create `src/frontend/src/components/ProjectAutopsyPage.tsx` with:
   - Props: `project: Project`, `onBack: () => void`
   - Medical report header strip: "PATIENT FILE // CASE #HB-001" monospace label + back button
   - "Cause of Death" large badge (reuse getCodColor logic, but much larger — icon + text, prominent border)
   - Two-column grid (lg:grid-cols-[1.4fr_1fr]) wrapping left story column and right vital signs column
   - Left: "THE STORY" section label + long-form sample narrative (~500 words) with monospace font
   - Right: "VITAL SIGNS" card with rows for Total Users, Tech Stack badges, GitHub Stars, Age of Repo — each row has a label + value, thin cyan 1px border on the card
   - Bottom CTA: full-width neon glow button "Revive This Project for $X,XXX"
2. Update `App.tsx`:
   - Add `selectedProject` state (null | Project)
   - Pass `onViewProject` handler down to ProjectCard
   - Conditionally render `<ProjectAutopsyPage>` when `selectedProject` is set
   - Wire "View Project" buttons in ProjectCard and error/sample states
3. Apply all deterministic `data-ocid` markers to interactive surfaces on the autopsy page.
