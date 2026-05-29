// storage.js — read/write product data and price history.
// products.json: master product list
// history/<id>.json: per-product observations, last 365 kept

import { readFile, writeFile, rename, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_DATA = join(fileURLToPath(import.meta.url), '..', '..', '..', 'data', 'prices')
const DATA_DIR = process.env.DATA_DIR ?? DEFAULT_DATA
const PRODUCTS_FILE = join(DATA_DIR, 'products.json')
const ALERTS_FILE = join(DATA_DIR, 'alerts.json')
const HISTORY_DIR = join(DATA_DIR, 'history')

async function ensureDir(dir) {
  if (!existsSync(dir)) await mkdir(dir, { recursive: true })
}

async function writeAtomic(file, content) {
  const tmp = `${file}.tmp`
  await writeFile(tmp, content, 'utf8')
  await rename(tmp, file)
}

export async function loadProducts() {
  await ensureDir(dirname(PRODUCTS_FILE))
  if (!existsSync(PRODUCTS_FILE)) return []
  const raw = await readFile(PRODUCTS_FILE, 'utf8')
  return JSON.parse(raw).products ?? []
}

export async function saveProducts(products) {
  await ensureDir(dirname(PRODUCTS_FILE))
  const data = { schema: '1.0', updatedAt: new Date().toISOString(), products }
  await writeAtomic(PRODUCTS_FILE, JSON.stringify(data, null, 2))
}

export async function loadAlerts() {
  await ensureDir(dirname(ALERTS_FILE))
  if (!existsSync(ALERTS_FILE)) return []
  const raw = await readFile(ALERTS_FILE, 'utf8')
  return JSON.parse(raw).alerts ?? []
}

export async function saveAlerts(alerts) {
  await ensureDir(dirname(ALERTS_FILE))
  const data = { schema: '1.0', updatedAt: new Date().toISOString(), alerts }
  await writeAtomic(ALERTS_FILE, JSON.stringify(data, null, 2))
}

export async function loadHistory(productId) {
  await ensureDir(HISTORY_DIR)
  const file = join(HISTORY_DIR, `${productId}.json`)
  if (!existsSync(file)) return []
  const raw = await readFile(file, 'utf8')
  return JSON.parse(raw).observations ?? []
}

export async function appendHistory(productId, storeSnapshots) {
  await ensureDir(HISTORY_DIR)
  const file = join(HISTORY_DIR, `${productId}.json`)
  const existing = await loadHistory(productId)
  const entry = {
    timestamp: new Date().toISOString(),
    stores: storeSnapshots.map(s => ({
      url: s.url,
      price: s.price,
      priceCHF: s.priceCHF,
      currency: s.currency,
      availability: s.availability,
    })),
  }
  existing.push(entry)
  const trimmed = existing.slice(-365)
  await writeAtomic(file, JSON.stringify({ schema: '1.0', productId, observations: trimmed }, null, 2))
}

export function findProduct(products, idOrName) {
  const lower = idOrName.toLowerCase()
  return products.find(p =>
    p.id === idOrName ||
    p.name.toLowerCase().includes(lower)
  ) ?? null
}
