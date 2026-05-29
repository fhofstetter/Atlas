---
description: Web application security rules based on OWASP Top 10 2025
---

# Security

Source: OWASP Top 10 2025 (RC1)

## OWASP Top 10 — 2025

| # | Category | Key mitigation |
|---|---|---|
| A01 | **Broken Access Control** | Enforce permissions server-side on every request; deny by default |
| A02 | **Security Misconfiguration** | Secure defaults, remove debug endpoints, suppress verbose errors in prod |
| A03 | **Software Supply Chain Failures** | Pin dependencies, audit with `npm audit`, vet third-party build tools |
| A04 | **Cryptographic Failures** | TLS everywhere, encrypt sensitive data at rest, no MD5/SHA-1 |
| A05 | **Injection** (SQL, NoSQL, OS, LDAP) | Parameterised queries only; never interpolate user input into commands |
| A06 | **Insecure Design** | Threat-model features before building; apply least-privilege at design time |
| A07 | **Authentication Failures** | Strong password policy, rate-limit login, MFA, secure session rotation |
| A08 | **Software / Data Integrity Failures** | Verify checksums and signatures; use `integrity` attribute on CDN scripts |
| A09 | **Security Logging & Alerting Failures** | Log auth events, access denials, and errors; alert on anomalies |
| A10 | **Mishandling of Exceptional Conditions** | Fail closed; never expose stack traces or internal state to clients |

## Rules for this project

- **API keys**: stored in `.env` only, never committed, never sent to the browser.
- **User input**: sanitise and validate at the server boundary before passing to
  the Claude API or any DB query.
- **XSS**: escape all user-controlled content before rendering to HTML; set a
  `Content-Security-Policy` header.
- **Dependencies**: run `npm audit` before every release; treat high/critical
  findings as blockers.
- **Error responses**: return generic messages to clients (`"Something went wrong"`);
  log full details server-side only.
- **CORS**: restrict `Access-Control-Allow-Origin` to known origins — never `*`
  in production.
- **Rate limiting**: apply on all endpoints calling external services (Anthropic,
  etc.) to prevent abuse and cost explosion.
