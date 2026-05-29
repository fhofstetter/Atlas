---
name: create-website
description: >
  Build a complete single-file HTML website from a brief or reference image.
  Spawns the web-designer agent which iterates via screenshot comparison until
  the result matches the reference within ~2-3px.
argument-hint: "[brief or path to reference image]"
allowed-tools: Read Write Bash Agent
effort: high
---

Build a website using the `web-designer` agent.

## Gather Requirements

If `$ARGUMENTS` is empty, ask the user for:
1. **Brief** — what is the website for? (e.g. "landing page for a coffee shop")
2. **Reference image** — optional path to a screenshot or mockup to match
3. **Sections needed** — e.g. hero, features, pricing, FAQ, contact
4. **Colour palette** — hex values or a style description ("dark minimal", "bright SaaS")
5. **Output filename** — defaults to `output/website_<timestamp>.html`

If `$ARGUMENTS` is provided, use it as the brief and skip the questions.

## Execute

1. Generate a task id: `task_<YYYYMMDD>_website_<NNN>`.
2. Write a task file to `tasks/queue/<task-id>.md`:
   - `agent: web-designer`
   - `priority: high`
   - Include the full brief in the `## Notes` section
3. Dispatch the `web-designer` subagent with the full brief and any reference image path.
4. After completion, report: output file path, sections built, iterations taken.
5. Offer to open the file in the browser:
   ```bash
   start output/<filename>.html
   ```
