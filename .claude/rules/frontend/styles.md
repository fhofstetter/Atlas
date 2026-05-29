---
paths:
  - "**/*.html"
  - "**/*.css"
  - "output/**"
---

# Styles

Source: getting-started-with-claude, Tailwind CSS official docs (2025)

## General

- Mobile-first: write base styles for small screens, override upward with `md:`,
  `lg:`, etc.
- CSS custom properties (`--color-*`, `--spacing-*`) for all design tokens.
- Utility classes are preferred; reach for custom CSS only when utilities cannot
  express the intent.

## Tailwind-specific

**Reuse via components, not `@apply`**
- The primary abstraction is a component or template partial.
- Use `@layer components { .btn-primary { ... } }` only for simple,
  framework-agnostic classes shared across a plain HTML project.

**Avoid conflicting utilities**
```html
<!-- bad: both grid and flex present; last one in CSS wins unpredictably -->
<div class="grid flex">

<!-- good: conditional in template logic -->
<div class="{{ layout === 'grid' ? 'grid' : 'flex' }}">
```

**Dynamic values from data**
Use inline styles for values from an API or database — Tailwind cannot generate
them at build time:
```html
<div style="background-color: {{ user.brandColor }}">
```

**Namespace / specificity conflicts**
- Integrating with high-specificity CSS: `@import "tailwindcss" important;`
- Avoiding class collisions with third-party libs: `@import "tailwindcss" prefix(tw);`

## Design defaults (single-file HTML projects)

- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- All colours and spacing as CSS custom properties in `:root`.
- Animations: `IntersectionObserver` + CSS transitions — no scroll event listeners.
- `scroll-margin-top: 64px` on every `section[id]`.
- Responsive breakpoints: `768px` and `1024px`.
