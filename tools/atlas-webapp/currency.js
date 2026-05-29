// currency.js — live EUR/USD/GBP -> CHF exchange rates with 1h in-memory cache.
// API: https://api.frankfurter.app (free, no key required)
// When from=EUR&to=CHF,USD,GBP: USD->CHF = (EUR->CHF) / (EUR->USD)
//
// Card spread: Visa/Mastercard add ~1.5% interchange + ~1% bank fee over interbank.
// Use convertToCHF(amount, currency, rates, { withCardSpread: true }) for the
// realistic price a Swiss cardholder actually pays when buying abroad.

const CACHE_TTL_MS = 60 * 60 * 1000
export const CARD_SPREAD_PERCENT = 2.5

let cache = null
let cacheTime = 0

const FRANKFURTER_URL = 'https://api.frankfurter.app/latest?from=EUR&to=CHF,USD,GBP'

export async function getExchangeRates() {
  const now = Date.now()
  if (cache && (now - cacheTime) < CACHE_TTL_MS) return cache

  try {
    const res = await fetch(FRANKFURTER_URL, {
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    const eurToChf = json.rates.CHF
    cache = {
      EUR: eurToChf,
      CHF: 1.0,
      USD: eurToChf / json.rates.USD,
      GBP: eurToChf / json.rates.GBP,
      fetchedAt: new Date().toISOString(),
      stale: false,
    }
    cacheTime = now
  } catch (err) {
    if (cache) {
      console.warn(`[currency] Rate fetch failed (${err.message}), using stale rates from ${cache.fetchedAt}`)
      cache = { ...cache, stale: true }
    } else {
      console.warn(`[currency] Rate fetch failed, using hardcoded fallback rates`)
      cache = { EUR: 0.93, CHF: 1.0, USD: 0.87, GBP: 1.16, fetchedAt: null, stale: true }
      cacheTime = now
    }
  }
  return cache
}

export function convertToCHF(amount, currency, rates, { withCardSpread = false } = {}) {
  const rate = rates[currency.toUpperCase()]
  if (rate == null) {
    console.warn(`[currency] Unknown currency: ${currency}, treating as EUR`)
    return amount * rates.EUR * (withCardSpread ? 1 + CARD_SPREAD_PERCENT / 100 : 1)
  }
  const chf = amount * rate
  return withCardSpread ? chf * (1 + CARD_SPREAD_PERCENT / 100) : chf
}

