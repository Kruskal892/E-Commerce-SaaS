## Summary

<!-- One or two sentences: what this does and why. Lead with the outcome. -->

Closes #

**Type:** `feat` · `fix` · `refactor` · `perf` · `chore` <!-- keep one -->
**Affected:** <!-- which app/package, e.g. apps/web, packages/ui -->

## Changes

## <!-- Skimmable bullets. What a reviewer needs to know, not a changelog of every commit. -->

## Screenshots / Recordings

<!-- Before → after for any visual change. Delete the section if none. -->

| Before | After |
| ------ | ----- |
|        |       |

## How to Test

<!-- Exact steps. Include env vars / seed data / feature flags if needed. -->

1.

## Risk & Rollout

<!-- Delete lines that don't apply. -->

- [ ] **Breaking change** — migration/notes:
- [ ] Touches **payments / Stripe** — tested in test mode, webhook verified
- [ ] Touches **Sanity schema** — content migration needed?
- [ ] Env vars added/changed — added to Vercel + `.env.example`
- [ ] Affects shared package — downstream apps checked

## Checklist

- [ ] `pnpm build` + typecheck pass (no TS errors)
- [ ] Lint clean, no stray `console.log`
- [ ] Tests added/updated where it matters
- [ ] No unrelated changes bundled in
- [ ] Self-reviewed the diff
