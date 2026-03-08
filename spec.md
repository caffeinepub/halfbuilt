# HalfBuilt

## Current State
Full marketplace app with: landing page (hero, wall of failure, graveyard feed, valuation tool, how it works, resurrection/escrow section), project submission modal, project autopsy detail page, and builder profile dashboard. Navigation has Home, Profile, and Autopsy views via AppView type.

## Requested Changes (Diff)

### Add
- `TransactionStatusPage` component (`src/frontend/src/components/TransactionStatusPage.tsx`)
  - Horizontal 4-stage progress tracker: "Payment in Escrow" → "Repo Transfer" → "Domain Handoff" → "Final Payout"
  - Stage styling: current stage glows neon purple; completed stages solid cyan; future stages grey wireframe
  - Connecting line between stages reflects completion state
  - Right-side chat panel: "Buyer-Seller Coordination" chat interface with message list, input field, and send button
  - Sample transaction data (project name, buyer, seller, amount, transaction ID)
  - Back navigation button
  - Full-page layout consistent with HalfBuilt dark aesthetic

### Modify
- `App.tsx`: Add `transaction` to `AppView` union type; add a "Track Transaction" link/button in navbar; wire navigation to show `TransactionStatusPage`; pass back handler

### Remove
- Nothing

## Implementation Plan
1. Create `TransactionStatusPage.tsx` with:
   - Left/main column: progress tracker with 4 stage nodes, connecting lines, stage status icons, stage descriptions
   - Right column: chat panel with message bubbles, timestamp labels, input + send
   - Sample hardcoded transaction and messages
   - Neon purple glow on active stage, solid cyan on completed, grey outline on future
   - Motion animations on mount
2. Update `App.tsx`:
   - Add `"transaction"` to `AppView`
   - Add "Track" link to navbar
   - Render `TransactionStatusPage` when view === "transaction"
