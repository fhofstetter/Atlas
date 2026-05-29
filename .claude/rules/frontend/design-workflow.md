---
paths:
  - "**/*.html"
  - "output/**"
---

# Design Recreation Workflow

Source: getting-started-with-claude

When given a reference image (screenshot/mockup) and optionally CSS classes or style notes:

1. **Generate** a single HTML file using Tailwind CSS (via CDN). Include all
   content inline — no external files unless requested.
2. **Screenshot** the rendered page:
   ```bash
   npx puppeteer screenshot <file>.html --fullpage
   ```
   Or use the chrome-devtools MCP tool if puppeteer is unavailable.
   Capture distinct sections individually if the page is long.
3. **Compare** your screenshot against the reference. Check:
   - Spacing and padding (measure in px)
   - Font sizes, weights, and line heights
   - Colours (exact hex values)
   - Alignment and positioning
   - Border radii, shadows, and effects
   - Responsive behaviour
   - Image/icon sizing and placement
4. **Fix** every mismatch. Edit the HTML.
5. **Re-screenshot and compare** again.
6. **Repeat** steps 3–5 until the result is within ~2–3px everywhere.

Do NOT stop after one pass. Always do at least **2 full comparison rounds**.
Only stop when the user says so or no visible differences remain.
