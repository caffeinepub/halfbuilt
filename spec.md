# HalfBuilt

## Current State
The Repository Audit Dashboard (`RepositoryAuditDashboard.tsx`) exists as a fully-designed UI component with a terminal log animation and a results table. However, all data is completely simulated — `deriveAuditResult()` generates deterministic fake values from a hash of the URL string. No real GitHub API calls are made. The backend has no GitHub integration.

## Requested Changes (Diff)

### Add
- Backend: `auditRepository(url: Text) : async AuditResult` — an update call that uses IC HTTP outcalls to fetch real data from the GitHub REST API (`https://api.github.com/repos/{owner}/{repo}`) and returns a structured result with `lastCommitDate`, `primaryLanguage`, `openIssues`, `stars`, `license`, and `forks`.
- Backend: `AuditResult` type with all returned fields.
- Backend: HTTP outcall using `ExperimentalInternetComputer` to call the GitHub API (public, unauthenticated, rate-limited to 60 req/hr).
- Frontend: Replace `deriveAuditResult()` simulation with a real call to `backend.auditRepository(url)`.
- Frontend: Show an error state if the GitHub API call fails (repo not found, private repo, rate limit hit).
- Frontend: Add a `forks` row to the results table.

### Modify
- Backend `main.mo`: Add `auditRepository` function using HTTP outcalls.
- Frontend `RepositoryAuditDashboard.tsx`: Replace simulated `deriveAuditResult` logic with a backend call; handle loading, success, and error states using the real response.

### Remove
- Frontend: Remove all simulated fake-data helpers (`simpleHash`, `deriveAuditResult`, `COMMIT_DATES`, `LICENSES` arrays).

## Implementation Plan
1. Select `http-outcalls` component.
2. Regenerate Motoko backend with `auditRepository` HTTP outcall to GitHub API, parsing `stargazers_count`, `open_issues_count`, `language`, `license.spdx_id`, `forks_count`, and `pushed_at` from the JSON response.
3. Update `RepositoryAuditDashboard.tsx` to call `backend.auditRepository(url)`, display real results, and show an inline error message for failures (invalid URL, private repo, API error).
4. Validate and deploy.
