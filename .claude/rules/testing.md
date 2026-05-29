---
description: JavaScript / Node.js testing best practices
---

# Testing

Source: getting-started-with-claude

## Test structure

- **AAA pattern**: Arrange → Act → Assert. One clear block each.
- **Three-part test names**: what is tested / under what condition / expected result.
  ```
  describe("createMessage", () => {
    it("returns 400 when the prompt is empty", () => { ... })
  })
  ```
- Nest under at least two `describe` levels: unit under test → scenario.

## What to test

- Test public behaviour only, not implementation details.
- Test one logical concept per `it` block.
- Use realistic input data (e.g. `faker`) — placeholder values like `"foo"` miss edge cases.

## Assertions

- Use Jest's `expect` / BDD-style assertions — no raw `if` logic inside tests.
- Assert thrown errors with `expect(fn).toThrow(...)`, not try/catch.
- Validate response shape and mandatory field types, not just status codes.

## Data & isolation

- Each test creates its own records and operates only on those.
- Clean up after *all* tests (afterAll), not after each — supports parallel runners.
- Intercept outgoing HTTP calls with `nock` or `msw`; never hit real external APIs
  in unit/integration tests.

## Test types

| Type | When to use |
|---|---|
| Unit | Pure functions, utilities, business logic |
| Integration | Express routes, DB queries against a real (test) database |
| Contract | API compatibility between services |
| E2E | Critical user journeys only — slow, keep small |

Prefer integration tests over heavy mocking — mock/prod divergence has caused
production failures.

## CI discipline

- Tag tests (`@smoke`, `@slow`) so CI can run fast subsets on PRs and full suites on merge.
- Static analysis (ESLint) runs alongside tests, not instead of them.
