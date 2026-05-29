// commands/check-all.js — refresh prices for all tracked products

import { loadProducts } from '../storage.js'
import { checkOne } from './check-one.js'

export async function checkAll(opts) {
  const products = await loadProducts()

  if (products.length === 0) {
    console.log('[check-all] No products tracked yet.')
    return
  }

  console.log(`[check-all] Checking ${products.length} product(s)...`)
  let failures = 0

  for (const product of products) {
    try {
      await checkOne(product.id, opts)
    } catch (err) {
      console.error(`[check-all] Error checking "${product.name}": ${err.message}`)
      failures++
    }
  }

  console.log(`\n[check-all] Done. ${products.length - failures}/${products.length} succeeded.`)
  if (failures > 0) {
    console.log(`  ${failures} failed — check logs for details.`)
  }
}
