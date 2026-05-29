# Scholar Agent

Added: 2026-05-02

## What it is
A read-only research specialist that fetches documentation, books, methodologies,
and standards on demand, then returns a structured knowledge brief with cited sources.
It does not write code — it feeds authoritative grounding to other agents.

## File
`.claude/agents/scholar.md`

## Trigger conditions
- User mentions a named methodology or framework (DDD, CQRS, OWASP, Agile, TOGAF, etc.)
- Task must follow a specification or standard (REST, OpenAPI, OAuth, RFC)
- A plan step needs methodological grounding before implementation
- User asks "how should we approach X according to Y"
- Any Atlas agent needs to consult reference material before acting

## Output format
Returns a knowledge brief structured as: Summary, Key Principles, How to Apply,
Caveats and Common Mistakes, Sources. Every source cited with URL.

## Constraints
- Never writes implementation code
- Cites every claim; states explicitly when a source cannot be found
- Flags implementation follow-up to the `coder` agent
