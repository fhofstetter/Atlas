---
paths:
  - "**/*.html"
  - "**/*.css"
  - "output/**"
---

# Design Fidelity Rules

Source: getting-started-with-claude

- Do not add features, sections, or content not present in the reference.
- Match the reference exactly — do not "improve" the design unsolicited.
- If the user provides CSS classes or style tokens, use them verbatim.
- Keep code clean but don't over-abstract — inline Tailwind classes are fine.
- When comparing screenshots, be specific about what's wrong:
  - "heading is 32px but reference shows ~24px"
  - "gap between cards is 16px but should be 24px"
  - "background is #1a1a2e but reference shows #0f0f1a"
