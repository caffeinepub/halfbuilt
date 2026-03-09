# HalfBuilt

## Current State
The project submission form collects name, GitHub URL, abandonment reason, asking price, and visibility toggle. On submit it calls `submitProject` on the backend, which only decrements a founder-spots counter and returns the remaining count. The submitted project is never stored in `projectStore`, so it never appears in the Graveyard Feed. The frontend's `useSubmitProject` hook also does not invalidate the `projects` query after a successful submission.

## Requested Changes (Diff)

### Add
- Nothing new — this is a bug fix to existing wiring.

### Modify
- **Backend `submitProject`**: Persist the submitted project in `projectStore` with a new auto-incremented ID. Derive `potentialScore` (simple heuristic from price), `causeOfDeath` from `abandonmentReason` (short label), `category` from `githubUrl` (default "SaaS"), and `tags` from the project name words. Only store public projects (`isPublic = true`) in the feed; private ones still decrement the counter but are not listed.
- **Frontend `useSubmitProject`**: Invalidate the `["projects"]` query on success so `useListProjects` refetches and the Graveyard Feed updates in real time.

### Remove
- Nothing.

## Implementation Plan
1. Rewrite `submitProject` in `main.mo` to build a `Project` record and call `projectStore.add(...)` before returning.
2. Add a `nextId` counter variable to generate stable IDs.
3. In `useQueries.ts`, add `queryClient.invalidateQueries({ queryKey: ["projects"] })` inside `onSuccess` of `useSubmitProject`.
