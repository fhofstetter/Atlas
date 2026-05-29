// commands/list.js — list all tracked products with current prices

import { loadProducts } from '../storage.js'

export async function listProducts(opts) {
  const products = await loadProducts()

  if (products.length === 0) {
    console.log('No products tracked yet. Use: node index.js add-product --url <url>')
    return
  }

  if (opts.json) {
    console.log(JSON.stringify(products, null, 2))
    return
  }

  for (const p of products) {
    console.log(`\n${p.name} (${p.id})`)
    console.log(`  Category: ${p.category} | Weight: ${p.weightKg ?? 'unknown'}kg | Alert: ${p.alertThresholdCHF ? `CHF ${p.alertThresholdCHF}` : 'none'}`)
    for (const s of p.stores) {
      const price = s.priceCHF ? `CHF ${s.priceCHF.toFixed(2)}` : 'N/A'
      const avail = s.availability ? ` [${s.availability}]` : ''
      console.log(`  ${s.url}`)
      console.log(`    ${price} (${s.price} ${s.currency})${avail} — origin: ${s.origin} — checked: ${s.lastChecked?.slice(0, 10) ?? 'never'}`)
    }
  }
}
