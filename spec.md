# HalfBuilt

## Current State
New project. No existing backend or frontend code.

## Requested Changes (Diff)

### Add
- Landing page for a marketplace of abandoned side projects
- Hero section with bold headline ("Your unfinished projects deserve a second life" or similar)
- Grid of sample project cards with glassmorphic styling, each showing:
  - Project name and short description
  - "Potential Score" (e.g. 7.4/10)
  - "Cause of Death" tag (e.g. "Lost motivation", "Got a job", "Scope creep")
  - Asking price
  - CTA button to view or buy
- "How It Works" section (3 steps: List, Browse, Transfer)
- Footer with nav links

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: Store sample project listings with fields: id, name, description, potentialScore, causeOfDeath, price, category
2. Backend: Query to list all projects, get single project by id
3. Frontend: Dark-mode landing page with Linear/Vercel-inspired aesthetic
4. Frontend: Hero section with headline, subheadline, CTA buttons
5. Frontend: Project cards grid with glassmorphic cards showing all fields
6. Frontend: How It Works section with 3-step flow
7. Frontend: Footer
