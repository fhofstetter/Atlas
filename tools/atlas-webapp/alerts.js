// alerts.js — write price alerts to alerts.json and logs/alerts.md.

import { writeFile, appendFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadAlerts, saveAlerts } from './storage.js'

const DEFAULT_LOGS = join(fileURLToPath(import.meta.url), '..', '..', '..', 'logs')
const LOGS_DIR = process.env.LOGS_DIR ?? DEFAULT_LOGS
const ALERT_LOG = join(LOGS_DIR, 'alerts.md')

/**
 * Check a product's current prices against thresholds and deals.
 * @param {object} product
 * @param {Array} deals — from detectDeals()
 * @param {object} landedCosts — { [storeUrl]: { ch: {...}, de: {...} } }
 */
export async function checkAndFireAlerts(product, deals, landedCosts) {
  if (deals.length === 0) return

  const existing = await loadAlerts()
  const newAlerts = []
  const timestamp = new Date().toISOString()

  for (const deal of deals) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      productId: product.id,
      productName: product.name,
      type: deal.type,
      storeUrl: deal.storeUrl,
      priceCHF: deal.priceCHF,
      message: deal.message,
      landedCostCH: landedCosts[deal.storeUrl]?.ch?.total ?? null,
      landedCostDE: landedCosts[deal.storeUrl]?.de?.total ?? null,
      firedAt: timestamp,
      acknowledged: false,
    }
    newAlerts.push(alert)

    console.log(`\n[ALERT] ${product.name}`)
    console.log(`  Type    : ${deal.type}`)
    console.log(`  Store   : ${deal.storeUrl}`)
    console.log(`  Price   : CHF ${deal.priceCHF?.toFixed(2)}`)
    if (alert.landedCostCH) console.log(`  Landed CH: CHF ${alert.landedCostCH.toFixed(2)}`)
    if (alert.landedCostDE) console.log(`  Landed DE: CHF ${alert.landedCostDE.toFixed(2)}`)
    console.log(`  ${deal.message}`)
  }

  await saveAlerts([...existing, ...newAlerts])
  await appendAlertLog(newAlerts)
}

async function appendAlertLog(alerts) {
  const dir = dirname(ALERT_LOG)
  if (!existsSync(dir)) await mkdir(dir, { recursive: true })

  const lines = alerts.map(a => {
    const d = a.landedCostCH ? ` | Landed CH: CHF ${a.landedCostCH.toFixed(2)}` : ''
    return `| ${a.firedAt} | ${a.productName} | ${a.type} | CHF ${a.priceCHF?.toFixed(2) ?? 'N/A'} | ${a.storeUrl}${d} |`
  })

  if (!existsSync(ALERT_LOG)) {
    const header = `# Atlas Price Alerts\n\n| Timestamp | Product | Type | Price | Store | Landed CH |\n|---|---|---|---|---|---|\n`
    await writeFile(ALERT_LOG, header, 'utf8')
  }

  await appendFile(ALERT_LOG, lines.join('\n') + '\n', 'utf8')
}
