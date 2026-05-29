// scraper.js — fetch page HTML and extract price/name/availability.
// Tier 1: JSON-LD / schema.org structured data
// Tier 2: Open Graph meta tags
// Tier 3: heuristic CSS selectors for common e-commerce platforms

import * as cheerio from 'cheerio'

export async function scrapeProduct(url, config) {
  const html = await fetchHtml(url)
  if (!html) return nullResult(url, 'fetch_failed')

  const $ = cheerio.load(html)
  const origin = guessOrigin(url, config)

  const jsonld = extractJsonLd($)
  if (jsonld?.price != null) {
    return { ...jsonld, url, extractionTier: 'jsonld', origin }
  }

  const og = extractOpenGraph($)
  if (og?.price != null) {
    return { ...og, url, extractionTier: 'og', origin }
  }

  const heuristic = extractHeuristic($, url)
  if (heuristic?.price != null) {
    return { ...heuristic, url, extractionTier: 'heuristic', origin }
  }

  return {
    ...nullResult(url, 'extraction_failed'),
    rawText: extractRawText($),
    origin,
  }
}

async function fetchHtml(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AtlasPriceBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'de-CH,de;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    return res.text()
  } catch {
    return null
  }
}

function extractJsonLd($) {
  const scripts = $('script[type="application/ld+json"]')
  for (let i = 0; i < scripts.length; i++) {
    try {
      const data = JSON.parse($(scripts[i]).html() ?? '{}')
      const offers = Array.isArray(data['@graph'])
        ? data['@graph'].find(n => n['@type'] === 'Product')?.offers
        : data['@type'] === 'Product'
          ? data.offers
          : null
      if (!offers) continue
      const offer = Array.isArray(offers) ? offers[0] : offers
      const price = parseFloat(offer.price ?? offer.lowPrice)
      if (isNaN(price)) continue
      return {
        name: data.name ?? null,
        price,
        currency: offer.priceCurrency ?? 'EUR',
        availability: normaliseAvailability(offer.availability),
        storeName: null,
        parcelPricing: [],
      }
    } catch {
      continue
    }
  }
  return null
}

function extractOpenGraph($) {
  const price = parseFloat($('meta[property="product:price:amount"]').attr('content') ?? '')
  if (isNaN(price)) return null
  return {
    name: $('meta[property="og:title"]').attr('content') ?? null,
    price,
    currency: $('meta[property="product:price:currency"]').attr('content') ?? 'EUR',
    availability: null,
    storeName: $('meta[property="og:site_name"]').attr('content') ?? null,
    parcelPricing: [],
  }
}

function extractHeuristic($, url) {
  const PRICE_SELECTORS = [
    '[itemprop="price"]',
    '.price',
    '.product-price',
    '#priceblock_ourprice',
    '.a-price-whole',
    '[data-testid="price"]',
    '.pricebox',
    '.product__price',
  ]
  for (const sel of PRICE_SELECTORS) {
    const raw = $(sel).first().attr('content') ?? $(sel).first().text()
    const price = parsePrice(raw)
    if (price != null) {
      return {
        name: $('h1').first().text().trim() || null,
        price,
        currency: guessCurrencyFromUrl(url),
        availability: null,
        storeName: null,
        parcelPricing: [],
      }
    }
  }
  return null
}

function parsePrice(raw) {
  if (!raw) return null
  // Handle Swiss (1'234.56), German (1.234,56), and international (1234.56) formats
  const cleaned = String(raw)
    .replace(/[^\d,.']/g, '')
    .replace(/'/g, '')
    .replace(/\.(\d{3})/g, '$1')
    .replace(',', '.')
  const n = parseFloat(cleaned)
  return isNaN(n) ? null : n
}

function normaliseAvailability(raw) {
  if (!raw) return null
  const s = String(raw).toLowerCase()
  if (s.includes('instock') || s.includes('in_stock')) return 'in_stock'
  if (s.includes('outofstock') || s.includes('out_of_stock')) return 'out_of_stock'
  if (s.includes('preorder') || s.includes('pre_order')) return 'pre_order'
  return 'unknown'
}

function guessOrigin(url, config) {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    const domainMap = config?.tracker?.domainOrigins ?? {}
    for (const [pattern, origin] of Object.entries(domainMap)) {
      if (hostname.includes(pattern)) return origin
    }
    if (hostname.endsWith('.ch')) return 'CH'
    if (hostname.endsWith('.de') || hostname.endsWith('.at')) return 'DE'
    if (hostname.endsWith('.uk') || hostname.endsWith('.co.uk')) return 'UK'
    if (hostname.endsWith('.com') || hostname.endsWith('.us')) return 'US'
    return 'EU'
  } catch {
    return 'EU'
  }
}

function guessCurrencyFromUrl(url) {
  try {
    const h = new URL(url).hostname
    if (h.endsWith('.ch')) return 'CHF'
    if (h.endsWith('.uk') || h.endsWith('.co.uk')) return 'GBP'
    if (h.endsWith('.com') || h.endsWith('.us')) return 'USD'
    return 'EUR'
  } catch {
    return 'EUR'
  }
}

function extractRawText($) {
  return $('body').text().replace(/\s+/g, ' ').trim().slice(0, 2000)
}

function nullResult(url, reason) {
  return { name: null, price: null, currency: null, availability: null,
           storeName: null, parcelPricing: [], extractionTier: reason, url }
}
