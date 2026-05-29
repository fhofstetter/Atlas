---
name: websearch
description: >
  Run a focused web search and return a structured report with cited sources.
  Use when you need current information, documentation, prices, news, or any
  live data from the internet.
argument-hint: "<search query>"
arguments: query
allowed-tools: WebSearch WebFetch Read Write
effort: medium
---

Research the query: **$query**

## Steps

1. If `$query` is empty, ask the user: "What would you like me to search for?"
2. Formulate 2-4 targeted search queries covering different angles of `$query`.
3. Run all queries with `WebSearch`.
4. For the top 3-5 results per query, fetch the full page with `WebFetch`.
5. Synthesise findings into a structured report:

```markdown
## Summary
<3-5 sentences answering the question directly>

## Key Findings
- <finding> — [Source](URL)

## Details
<expanded explanation with subsections>

## Sources
1. [Title](URL)

## Gaps / Uncertainty
<what you could not find or verify>
```

6. Write the report to `output/search_<timestamp>.md`.
7. Show the report inline and confirm the output file path.

## Rules

- Cite every claim. No unsourced assertions.
- If a page is paywalled, note it and move on.
- Do not fabricate URLs.
- Keep the report under 1,500 words unless asked for more.
