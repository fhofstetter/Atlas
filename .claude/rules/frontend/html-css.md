---
description: HTML/CSS conventions for single-file web projects
paths:
  - "**/*.html"
  - "output/**/*.html"
---

# HTML/CSS Conventions

Source: getting-started-with-claude

- Single-file HTML approach: keep styles in `<style>` and scripts in `<script>`
  inside the HTML file — no separate `.css` or `.js` files unless explicitly requested.
- Use CSS custom properties (`--var`) for all colour and spacing tokens — define
  them in `:root`. No magic numbers.
- Animations via `IntersectionObserver` + CSS transitions — **never** scroll event listeners.
- `scroll-margin-top: 64px` on every `section[id]` to compensate for fixed nav height.
- Responsive breakpoints: `768px` (mobile → tablet), `1024px` (tablet → desktop).
  Write mobile-first — base styles for small screens, override upward with media queries.
- Use `https://placehold.co/WIDTHxHEIGHT` for placeholder images.
