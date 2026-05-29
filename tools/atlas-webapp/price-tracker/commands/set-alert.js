// commands/set-alert.js — set or update CHF threshold for a product

import { loadProducts, saveProducts, findProduct } from '../storage.js'

export async function setAlert(idOrName, opts) {
  const products = await loadProducts()
  const product = findProduct(products, idOrName)

  if (!product) {
    console.error(`[set-alert] Product not found: "${idOrName}"`)
    process.exit(1)
  }

  const prev = product.alertThresholdCHF
  product.alertThresholdCHF = opts.threshold
  product.updatedAt = new Date().toISOString()
  await saveProducts(products)

  console.log(`[set-alert] ${product.name}`)
  console.log(`  Threshold: ${prev ? `CHF ${prev}` : 'none'} -> CHF ${opts.threshold}`)
}
