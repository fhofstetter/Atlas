# atlas-trading — TODO

Path: `c:/Data/Projects/code/atlas-trading` _(to be created, absorbs trade-bot)_  
Stack: Python + FastAPI + Docker  
Port: 3458  
See: [ecosystem-architecture.md](../ecosystem-architecture.md) | [status](../status.md)

---

## Phase 1 — Scaffold

- [ ] Create repo at `c:/Data/Projects/code/atlas-trading`
- [ ] Init Python project (pyproject.toml or requirements.txt, FastAPI, uvicorn)
- [ ] Internal layout: `src/crypto/`, `src/stocks/`, `src/news/`, `src/api/`
- [ ] Dockerfile + docker-compose entry (atlas-core stack)
- [ ] Basic health endpoint `GET /api/health`
- [ ] Absorb `trade-bot/src/` — move Binance bootstrap into `src/crypto/`

## Phase 2 — Crypto

- [ ] Decide: stay on Binance testnet vs switch to live API (paper trading first)
- [ ] Binance connector — positions, balances, open orders
- [ ] Price feed — real-time spot prices for tracked pairs
- [ ] Alerts — price threshold alerts (model from atlas-core price tracker)
- [ ] P&L tracking — daily/weekly performance

## Phase 3 — Stocks

- [ ] Pick data provider (options: Alpha Vantage free tier, Yahoo Finance unofficial, Twelve Data, Polygon.io)
- [ ] Watchlist management — add/remove tickers
- [ ] Price feed — EOD + intraday quotes
- [ ] Portfolio view — holdings, cost basis, P&L

## Phase 4 — News

- [ ] Pick news sources (RSS feeds, financial APIs, Reddit finance, etc.)
- [ ] Aggregation pipeline — fetch + deduplicate + store
- [ ] Sentiment tagging (simple keyword or Claude API call)
- [ ] Filter by portfolio relevance (only news about held/watched assets)

## Phase 5 — API contract

- [ ] `GET /api/widget/summary` — dashboard card (portfolio value, today's P&L, top mover)
- [ ] `GET /api/briefing` — overnight summary consumed by atlas-core plan-day
- [ ] `GET /api/news/latest` — recent headlines for dashboard news panel

## Phase 6 — Atlas-core integration

- [ ] Add atlas-trading widget to dashboard config
- [ ] Update plan-day skill to call `GET /api/briefing`
- [ ] Smoke-test full flow: trade executed → shows in atlas-core dashboard

## Open questions

- [ ] Stocks data provider — decide before Phase 3 starts
- [ ] Live trading vs read-only portfolio tracking — scope decision before Phase 2
- [ ] News sources — curate list before Phase 4 starts

## OSS inspiration — Ghostfolio + Wealthfolio + Rotki

- [ ] **Study Ghostfolio's data source provider pattern** before writing connectors — each exchange/data-feed is a typed provider class; adopt this abstraction for Binance, Yahoo Finance, CoinGecko (ref: Ghostfolio GitHub ⭐8.5k, NestJS+Prisma)
- [ ] Review Ghostfolio's supported data sources list — may avoid building some connectors from scratch
- [ ] Study Wealthfolio's addon SDK pattern for extensible asset type support (ref: Wealthfolio GitHub ⭐7.5k, Rust+React)
- [ ] Review Rotki's on-chain transaction decoding approach for DeFi support if crypto scope grows (ref: Rotki GitHub ⭐3.9k)
- [ ] Check if archived `trade-bot-binance-old/` indicators code overlaps with anything Rotki already solved before reimplementing
