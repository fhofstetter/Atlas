---
id: task_20260504_mobile_training
title: Mobile design for training page
status: queued
priority: medium
created: 2026-05-04T00:00:00Z
assigned_to: orchestrator
---

## Goal
Design and implement a mobile-first layout for the Atlas training page (`/training`). The desktop version was built for wide screens and collapses gracefully to ~900px via CSS classes, but below 768px the experience degrades significantly.

## Scope

### Pages affected
- `/training` — primary focus
- `/` (overview) — session summary widget + quick links grid
- `/organizer` — todos/goals tables

### Specialist agents needed
- `web-designer` — mobile layout iteration + screenshot comparison
- `coder` — EJS/CSS changes
- `reviewer` — design review before sign-off

### Key areas to redesign for mobile

1. **Training today section**: Currently 2-col (session card | exercise detail panel). On mobile:
   - Session card spans full width
   - Exercise detail panel appears below as a collapsible bottom sheet or slide-up
   
2. **Week strip**: Currently 7 equal columns. On mobile:
   - Horizontal scroll (already partially wired via `.training-week-strip`)
   - Increase min cell height so touch targets are ≥44px
   
3. **Phase session cards**: Currently 2-col (sessions list | exercise detail). On mobile:
   - Stack: session list → tap exercise → slide-up detail sheet
   
4. **Body muscle diagrams**: Too wide side-by-side. On mobile:
   - Stack front + back vertically
   - Reduce size (currently ~160px tall)

5. **Stats strip**: 4-col → 2×2 grid on mobile (already handled by `.stats-grid`)

6. **Navigation**: Nav links hidden on mobile. Consider a hamburger menu or bottom tab bar.

### Design constraints
- Dark theme — no light mode
- Must work offline (no CDN JS additions)
- Touch targets ≥ 44px
- No horizontal overflow (body overflow-x: hidden is set)
- EJS server-side — no React/Vue, pure HTML/CSS/vanilla JS

## Verification
- [ ] Screenshot at 375px (iPhone SE)
- [ ] Screenshot at 414px (iPhone Pro)
- [ ] Screenshot at 768px (iPad)
- [ ] No horizontal scroll at any breakpoint
- [ ] Exercise detail panel accessible on mobile
- [ ] Week strip navigable by swipe/scroll
