# HalfBuilt

## Current State
The app has a footer (`Footer` component in App.tsx, lines 2287-2404) with:
- Brand column (logo + tagline + GitHub/Twitter icons)
- Marketplace column (Browse, List, How It Works, Pricing)
- Company column (About, Blog, Privacy, Terms)
- Bottom bar with copyright

## Requested Changes (Diff)

### Add
- **Live Platform Stats bar** directly above the bottom copyright bar: three monospace stat chips — "Projects Revived: 0", "Total Value Transferred: $0", "Active Builders: 1" — displayed in a single horizontal row with subtle separator dots between them
- **Community column** with links: Discord, X (Twitter), Reddit — replacing the old social icons in the brand column
- **Trust column** with links: Escrow Policy, Code Verification, Privacy
- A small open-source flavour line in the bottom bar: e.g. "Open-source. Transparent by default." in monospace

### Modify
- Replace the **Company** column with the new **Trust** column
- Update the **Marketplace** column to exactly: Browse, Sell, Pricing (simplified, no "How It Works")
- Remove the standalone GitHub/Twitter icon links from the brand column (moved to Community column)
- Brand description stays but becomes slightly more terse and builder-centric
- Grid changes from `md:grid-cols-4` to `md:grid-cols-4` (Brand spans 1, then Marketplace, Trust, Community each span 1)
- Bottom copyright line: keep caffeine.ai attribution, add "Open-source. Transparent by default." note

### Remove
- Old "Company" column (About, Blog, Terms links)
- Standalone social icon row in the brand column

## Implementation Plan
1. Rewrite the `Footer` component in App.tsx only
2. Layout: `grid grid-cols-1 md:grid-cols-4` — brand (col-span-1), Marketplace, Trust, Community
3. Live Platform Stats bar: a `div` above the copyright strip, full-width, with three `span` stat items separated by `·` dots, using `font-mono text-xs` and a faint top border
4. Community column includes Discord (MessageSquare or custom icon), X (Twitter icon), Reddit (icon or text)
5. Trust column: Escrow Policy, Code Verification, Privacy — all `href="#"` placeholders
6. All column headings: `font-mono font-semibold text-xs uppercase tracking-widest text-muted-foreground`
7. Link hover state: `hover:text-foreground` with no underline, matching existing style
8. Add deterministic `data-ocid` markers on footer links and stat elements
