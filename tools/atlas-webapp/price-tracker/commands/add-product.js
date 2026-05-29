// commands/add-product.js — scrape and register a new product

import { scrapeProduct } from '../scraper.js'
import { loadProducts, saveProducts, appendHistory } from '../storage.js'
import { getExchangeRates, convertToCHF } from '../currency.js'
import { calculateLandedCost } from '../shipping.js'
import { generateId } from '../utils.js'
import { readConfig } from '../config.js'

export async function addProduct(opts) {
  const config = await readConfig()
  const rates = await getExchangeRates()
  const products = await loadProducts()

  console.log(`[add-product] Scraping ${opts.url.length} URL(s)...`)

  const scrapeResults = await Promise.all(
    opts.url.map(url => scrapeProduct(url, config))
  )

  const name = opts.name ?? scrapeResults[0].name ?? 'Unknown Product'
  const id = generateId(name)
  const category = opts.category ?? 'general'
  const weightKg = opts.weight ?? null

  const stores = scrapeResults.map((r, i) => ({
    url: opts.url[i],
    name: r.storeName,
    origin: r.origin,
    currency: r.currency ?? 'EUR',
    price: r.price,
    priceCHF: r.price && r.currency ? round2(convertToCHF(r.price, r.currency, rates)) : null,
    availability: r.availability,
    lastChecked: new Date().toISOString(),
    parcelPricing: r.parcelPricing ?? [],
    extractionTier: r.extractionTier,
  }))

  const product = {
    id,
    name,
    category,
    weightKg,
    alertThresholdCHF: opts.threshold ?? null,
    stores,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  products.push(product)
  await saveProducts(products)
  await appendHistory(id, stores)

  console.log(`\n[add-product] Added: ${name} (${id})`)
  if (rates.stale) console.warn('  Warning: exchange rates are stale')

  for (const s of stores) {
    if (s.priceCHF === null || s.priceCHF === undefined) {
      console.log(`  ${s.url}`)
      console.log(`    Price: extraction failed (tier: ${s.extractionTier})`)
      continue
    }
    const landed = await calculateLandedCost(s.priceCHF, s.origin, weightKg, category, config)
    console.log(`  ${s.url}`)
    console.log(`    Price   : ${s.price} ${s.currency} = CHF ${s.priceCHF.toFixed(2)}`)
    console.log(`    Landed CH: CHF ${landed.ch.total.toFixed(2)} (shipping: ${landed.ch.shipping.cost}, customs: ${landed.ch.customs.total})`)
    console.log(`    Landed DE: CHF ${landed.de.total.toFixed(2)} (shipping: ${landed.de.shipping.cost})`)
  }

  if (opts.threshold) {
    console.log(`\n  Alert set: CHF ${opts.threshold}`)
  }
}

function round2(n) {
  return Math.round(n * 100) / 100
}
