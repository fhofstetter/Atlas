// deals.js — rolling average calculation and cross-store deal detection.

/**
 * Compute rolling average CHF price from history for a specific store URL.
 */
export function rollingAverage(history, storeUrl, windowSize = 30) {
  const relevant = history
    .slice(-windowSize)
    .flatMap(obs => obs.stores)
    .filter(s => s.url === storeUrl && s.priceCHF != null)
    .map(s => s.priceCHF)

  if (relevant.length === 0) return null
  return relevant.reduce((a, b) => a + b, 0) / relevant.length
}

/**
 * Compute rolling average across ALL stores for a product.
 */
export function globalRollingAverage(history, windowSize = 30) {
  const prices = history
    .slice(-windowSize)
    .flatMap(obs => obs.stores)
    .filter(s => s.priceCHF != null)
    .map(s => s.priceCHF)

  if (prices.length === 0) return null
  return prices.reduce((a, b) => a + b, 0) / prices.length
}

/**
 * Detect deals for a product given current store prices and history.
 * Deal types: 'threshold', 'below_avg', 'cross_store'
 */
export function detectDeals(product, currentStores, history, config) {
  const deals = []
  const dropPercent = config?.tracker?.deals?.drop_threshold_percent ?? 15
  const globalAvg = globalRollingAverage(history)
  const threshold = product.alertThresholdCHF

  const availableStores = currentStores.filter(s => s.priceCHF != null)
  const sorted = [...availableStores].sort((a, b) => a.priceCHF - b.priceCHF)

  for (const store of availableStores) {
    const avg = rollingAverage(history, store.url) ?? globalAvg

    if (threshold != null && store.priceCHF <= threshold) {
      deals.push({
        type: 'threshold',
        storeUrl: store.url,
        priceCHF: store.priceCHF,
        thresholdCHF: threshold,
        dropPercent: null,
        message: `Price CHF ${store.priceCHF.toFixed(2)} is at/below your threshold of CHF ${threshold.toFixed(2)}`,
      })
    }

    if (avg != null && avg > 0) {
      const pctDrop = ((avg - store.priceCHF) / avg) * 100
      if (pctDrop >= dropPercent) {
        deals.push({
          type: 'below_avg',
          storeUrl: store.url,
          priceCHF: store.priceCHF,
          rollingAvgCHF: round2(avg),
          dropPercent: round2(pctDrop),
          message: `${round2(pctDrop)}% below ${Math.round(history.length)}-observation average of CHF ${round2(avg)}`,
        })
      }
    }
  }

  if (sorted.length >= 2) {
    const cheapest = sorted[0]
    const secondCheapest = sorted[1]
    const pctDiff = ((secondCheapest.priceCHF - cheapest.priceCHF) / secondCheapest.priceCHF) * 100
    if (pctDiff >= dropPercent) {
      deals.push({
        type: 'cross_store',
        storeUrl: cheapest.url,
        priceCHF: cheapest.priceCHF,
        competitorPriceCHF: secondCheapest.priceCHF,
        competitorUrl: secondCheapest.url,
        dropPercent: round2(pctDiff),
        message: `Cheapest store is ${round2(pctDiff)}% cheaper than next best (CHF ${secondCheapest.priceCHF.toFixed(2)})`,
      })
    }
  }

  return deals
}

function round2(n) {
  return Math.round(n * 100) / 100
}
