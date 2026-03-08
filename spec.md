# HalfBuilt

## Current State
The app is a marketplace for abandoned side projects. It has multiple views managed via an `AppView` type in `App.tsx`: `"home"`, `"profile"`, and `"transaction"`. Navigation happens through the Navbar which has links for Profile and Track. All sub-pages are separate components in `src/frontend/src/components/`.

## Requested Changes (Diff)

### Add
- New `SecurePayoutsPage` component (`src/frontend/src/components/SecurePayoutsPage.tsx`)
  - **Connect with Stripe** section: prominent CTA button with Stripe branding, connection status indicator
  - **Fee Structure** transparency section: visual breakdown showing 8% Platform Fee, 2.9% Payment Processing, 89.1% Seller Payout — displayed as a segmented bar and a data table
  - **Payout History** table: columns for Date, Project Name, and Status with color-coded badges (Pending = yellow, Cleared = cyan, Transferred = green). Sample rows pre-populated.
  - Design: fintech aesthetic — dark navy background, white/light text, Inter font, clean borders, minimal ornamentation
- New `"payouts"` entry in `AppView` type in `App.tsx`
- "Payouts" nav link in Navbar (desktop + mobile)
- Route handler for the payouts view in `App.tsx`

### Modify
- `App.tsx`: add `"payouts"` to `AppView`, pass `onNavigatePayouts` to Navbar, add payouts view conditional render
- `Navbar`: add a "Payouts" nav link/button that calls `onNavigatePayouts`

### Remove
- Nothing removed

## Implementation Plan
1. Create `SecurePayoutsPage.tsx` with all sections (Stripe connect, fee structure, payout history table)
2. Update `AppView` type in `App.tsx` to include `"payouts"`
3. Add `onNavigatePayouts` prop to Navbar and wire the nav link
4. Add route handler in `App.tsx` for the payouts view
