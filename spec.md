# HalfBuilt

## Current State
HalfBuilt is a marketplace for abandoned side projects featuring:
- Landing page with hero, Wall of Failure scrolling section, Project Graveyard grid with skeleton/empty state, How the Resurrection Works infographic, and project submission modal
- Project Autopsy detail page (ProjectAutopsyPage.tsx component) with two-column medical report layout
- Navbar with Start Selling CTA
- Deep black + glassmorphic dark aesthetic with violet/indigo accent colors
- Sample project data with 6 projects

## Requested Changes (Diff)

### Add
- `BuilderProfilePage.tsx` component: a full Builder Profile/Reputation dashboard page
  - **Header**: Large user avatar with gradient initials, username, bio/tagline, and a glowing "🔥 12 Day Build Streak" badge floating on the avatar corner
  - **Stats Row**: 4 glassmorphic mini-cards — "Projects Listed", "Projects Revived", "Total XP", "Market Rank" — with animated numeric values and subtle icon
  - **Achievement Section**: Horizontal scrollable row of circular badge icons; some active (neon glow, colored), some locked (greyed out, lock overlay). Each badge has a label beneath it.
  - **Activity Feed**: Vertical timeline with timestamped entries — "Pushed code to TaskForge", "Listed a new project", "Gained 50 XP" — each with an icon, colored dot connector, and relative timestamp
  - Sample/mock data hardcoded for the profile (username, XP, rank, activity items, badges)
- Navigation link "Profile" in the Navbar linking to the Builder Profile view
- Route/state in App.tsx to show BuilderProfilePage when "Profile" is clicked (single-page navigation using state, not a router)

### Modify
- `App.tsx`: Add state to handle view switching between the main landing page and the Builder Profile page; add "Profile" nav link/button to Navbar

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/components/BuilderProfilePage.tsx` with all sections (header, stats, achievements, activity feed)
2. Update `App.tsx` Navbar to include a "Profile" nav item and wire view-switching state
3. Render `<BuilderProfilePage />` when profile view is active, otherwise render the main landing page
4. Apply `data-ocid` deterministic markers to all interactive surfaces and key sections
