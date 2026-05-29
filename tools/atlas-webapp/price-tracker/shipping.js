// shipping.js — shipping cost estimation and full landed-cost calculation.
// Lookup tables come from config/tracker.yaml.

import { calculateCustoms } from './customs.js'

/**
 * Estimate shipping cost to CH or DE from a given origin.
 * @param {string} origin — 'CH'|'DE'|'EU'|'UK'|'US'
 * @param {number|null} weightKg
 * @param {'CH'|'DE'} destination
 * @param {object} config
 */
export async function estimateShipping(origin, weightKg, destination, config) {
  const tables = config.tracker.shipping
  const destKey = destination === 'DE' ? 'shipping_to_de' : 'shipping_to_ch'
  const regionTable = tables[destKey]?.[origin]

  if (!regionTable) {
    const fallback = destination === 'DE' ? 5.0 : 15.0
    return { cost: fallback, note: 'fallback flat rate (unknown origin)', currency: 'CHF' }
  }

  if (origin === 'CH' && destination === 'CH') {
    return { cost: 0, note: 'domestic shipment', currency: 'CHF' }
  }

  const tiers = regionTable.tiers
  if (!weightKg || !Array.isArray(tiers)) {
    const mid = regionTable.estimate ?? regionTable.flat ?? 12.0
    return { cost: mid, note: 'estimated (no weight provided)', currency: 'CHF' }
  }

  for (const tier of tiers) {
    if (weightKg <= tier.max_kg) {
      return { cost: tier.cost_chf, note: `weight tier <=  ${tier.max_kg}kg`, currency: 'CHF' }
    }
  }

  const last = tiers[tiers.length - 1]
  const extra = Math.ceil(weightKg - last.max_kg) * (regionTable.per_extra_kg_chf ?? 2.0)
  return {
    cost: last.cost_chf + extra,
    note: `oversize (${weightKg}kg, surcharge applied)`,
    currency: 'CHF',
  }
}

/**
 * Calculate full landed cost for both CH and DE destination options.
 */
export async function calculateLandedCost(priceCHF, origin, weightKg, category, config) {
  const shippingCH = await estimateShipping(origin, weightKg, 'CH', config)
  const shippingDE = await estimateShipping(origin, weightKg, 'DE', config)

  const customsCH = origin !== 'CH'
    ? calculateCustoms(priceCHF, shippingCH.cost, category, config)
    : { vat: 0, duty: 0, clearanceFee: 0, total: 0, note: 'domestic — no customs' }

  return {
    product: priceCHF,
    ch: {
      shipping: shippingCH,
      customs: customsCH,
      total: priceCHF + shippingCH.cost + customsCH.total,
    },
    de: {
      shipping: shippingDE,
      customs: { vat: 0, duty: 0, clearanceFee: 0, total: 0, note: 'shipped to DE — no CH customs' },
      total: priceCHF + shippingDE.cost,
    },
  }
}
