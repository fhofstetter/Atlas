---
name: budget
description: Track income, expenses, and savings goals — all data stored locally
argument-hint: "[summary|add expense|add income|savings|account add|account list]"
allowed-tools: Read, Write, Bash
---

Manage budget data in `data/budget/`. ALL DATA LOCAL ONLY — never sent to external APIs.

## Argument Parsing

- No argument or `summary` — show this month's income vs. expenses by category
- `add expense` — log an expense interactively
- `add income` — log income interactively
- `savings` — show savings buckets with fill bars
- `account add` — add a bank account
- `account list` — list accounts with balances

## Schema for a transaction

```json
{
  "id": "txn_YYYYMMDD_NNN",
  "date": "YYYY-MM-DD",
  "amount": 0.0,
  "currency": "CHF",
  "category": "",
  "description": "",
  "account": "",
  "type": "expense|income"
}
```
Note: expense amounts are stored as negative numbers (e.g., -45.00).

## Schema for an account

```json
{
  "id": "acc_NNN",
  "name": "",
  "type": "checking|savings|investment|cash",
  "balance_chf": 0.0,
  "notes": ""
}
```

## Schema for a savings bucket

```json
{
  "id": "save_NNN",
  "name": "",
  "target_chf": 0.0,
  "current_chf": 0.0,
  "monthly_contribution": 0.0,
  "priority": "high|medium|low",
  "target_date": null,
  "notes": ""
}
```

## Expense categories

groceries, dining, transport, housing, utilities, health, clothing, entertainment, travel, savings-transfer, other

## add expense interactive questions

1. "Amount in CHF?"
2. "Category? (groceries/dining/transport/housing/utilities/health/clothing/entertainment/travel/other)"
3. "Description?"
4. "Account? (list available accounts or type new name)"
5. "Date? (Enter for today)"

## summary display format

Show as grouped table by category, then:
- Total income this month
- Total expenses this month
- Net (income - expenses)
- Days remaining in month
- Projected month-end based on daily spend rate

## savings display

For each bucket: name, current/target in CHF, fill bar (████░░░░ style), % filled, monthly contribution, months to target.

## Rules

- ALL DATA LOCAL ONLY — no bank API calls, no external services
- Currency default is CHF
- Income amounts are positive, expense amounts are negative in storage
- Always update `_updated` field on writes
- After every write, validate JSON by reading back
