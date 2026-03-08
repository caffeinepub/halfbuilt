# HalfBuilt

## Current State
Full landing page: Navbar, Hero, WallOfFailureSection (horizontal marquee), ProjectsSection (grid of glassmorphic cards with SAMPLE_PROJECTS fallback data), HowItWorksSection, ListCtaSection, Footer. The ProjectsSection currently shows SAMPLE_PROJECTS when the backend returns 0 projects, hiding the "empty state". The empty state div renders only when `displayProjects.length === 0`, but the fallback to SAMPLE_PROJECTS means it is never reached in practice.

## Requested Changes (Diff)

### Add
- A high-end **Project Graveyard** empty state that activates when there are genuinely 0 real projects (don't use SAMPLE_PROJECTS as fallback for the empty state -- show the Graveyard instead).
- The Graveyard grid shows **3 skeleton placeholder cards** with animated pulse shimmer. Each skeleton card has a 3D isometric visual character: faint isometric grid lines on the card face, placeholder blocks for "Users", "Tech Stack", and a "Potential Score" progress bar (all skeleton-animated).
- Centered over the 3-card grid: a **hero overlay card** -- larger, centered in the grid area -- that says "Be the first to list." with a subline like "The graveyard is quiet. Your project deserves better." and a CTA button: **"Secure Your Founder Badge"** linking to `#list`.
- The overlay card should feel elevated: brighter border, violet glow, slight scale-up relative to the skeleton cards behind it.
- Section heading updated from "Featured Projects" to "Project Graveyard" when in empty state, with a 🪦 eyebrow badge.

### Modify
- `ProjectsSection`: change the empty state logic so that when the backend returns 0 real projects (and we are not loading/errored), render the new `GraveyardEmptyState` instead of the old minimal fallback. SAMPLE_PROJECTS should only be used as fallback for error states or dev purposes -- the true empty path should show the Graveyard.
- Rename the section heading conditionally: "Project Graveyard" (empty) vs "Brilliant projects, waiting to ship." (populated).

### Remove
- The old simple empty state (Package icon + "No projects listed yet. Be the first!") -- replace with the Graveyard.

## Implementation Plan
1. Create `GraveyardSkeletonCard` component: glassmorphic card with isometric-feel (CSS perspective transform or subtle angled grid overlay), animated skeleton rows for Users count, 3–4 tech stack tag skeletons, and a Potential Score bar skeleton.
2. Create `GraveyardEmptyState` component: 3-column grid with 3 `GraveyardSkeletonCard`s, and a centered absolute/overlay card with the "Be the first to list." message and "Secure Your Founder Badge" CTA button.
3. Update `ProjectsSection` to use `GraveyardEmptyState` when real data is empty (backend returns `[]` with no error/loading), keeping SAMPLE_PROJECTS only for error/dev path.
4. Apply `data-ocid="projects.empty_state"` on `GraveyardEmptyState`, `data-ocid="graveyard.primary_button"` on the CTA.
5. Run typecheck + lint + build and fix any errors.
