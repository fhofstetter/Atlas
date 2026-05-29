// commands/check-one.js — refresh prices for a single product

import { scrapeProduct } from '../scraper.js'
import { loadProducts, saveProducts, appendHistory, findProduct, loadHistory } from '../storage.js'
import { getExchangeRates, convertToCHF } from '../currency.js'
import { calculateLandedCost } from '../shipping.js'
import { detectDeals } from '../deals.js'
import { checkAndFireAlerts } from '../alerts.js'
import { readConfig } from '../config.js'

export async function checkOne(idOrName, opts) {
  const config = await readConfig()
  const products = await loadProducts()
  const product = findProduct(products, idOrName)

  if (!product) {
    console.error(`[check-one] Product not found: "${idOrName}"`)
    process.exit(1)
  }

  console.log(`[check-one] Checking: ${product.name}`)

  const rates = await getExchangeRates()
  if (rates.stale) console.warn('  Warning: exchange rates are stale')

  const scrapeResults = await Promise.all(
    product.stores.map(s => scrapeProduct(s.url, config))
  )

  const updatedStores = product.stores.map((s, i) => {
    const r = scrapeResults[i]
    const priceCHF = r.price && r.currency ? round2(convertToCHF(r.price, r.currency, rates)) : null
    return {
      ...s,
      price: r.price ?? s.price,
      priceCHF: priceCHF ?? s.priceCHF,
      currency: r.currency ?? s.currency,
      availability: r.availability ?? s.availability,
      lastChecked: new Date().toISOString(),
      extractionTier: r.extractionTier,
    }
  })

  product.stores = updatedStores
  product.updatedAt = new Date().toISOString()
  await saveProducts(products)
  await appendHistory(product.id, updatedStores)

  const history = await loadHistory(product.id)
  const deals = detectDeals(product, updatedStores, history, config)

  const landedCosts = {}
  for (const s of updatedStores) {
    if (s.priceCHF) {
      landedCosts[s.url] = await calculateLandedCost(s.priceCHF, s.origin, product.weightKg, product.category, config)
    }
  }

  printSummary(product, updatedStores, landedCosts, deals)

  if (opts.alerts !== false) {
    await checkAndFireAlerts(product, deals, landedCosts)
  }
}

function printSummary(product, stores, landedCosts, deals) {
  console.log(`\n${product.name}`)
  for (const s of stores) {
    const lc = landedCosts[s.url]
    console.log(`  ${s.url}`)
    if (s.priceCHF) {
      console.log(`    Price   : ${s.price} ${s.currency} = CHF ${s.priceCHF.toFixed(2)}`)
      if (lc) {
        console.log(`    Landed CH: CHF ${lc.ch.total.toFixed(2)}`)
        console.log(`    Landed DE: CHF ${lc.de.total.toFixed(2)}`)
      }
    } else {
      console.log(`    Price: extraction failed`)
    }
  }
  if (deals.length > 0) {
    console.log(`\n  Deals detected:`)
    deals.forEach(d => console.log(`    [${d.type}] ${d.message}`))
  }
}

function round2(n) {
  return Math.round(n * 100) / 100
}
