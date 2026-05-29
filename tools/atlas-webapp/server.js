#!/usr/bin/env node

import express from 'express'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client'

collectDefaultMetrics({ prefix: 'atlas_' })

const httpRequests = new Counter({
  name: 'atlas_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status'],
})
const httpDuration = new Histogram({
  name: 'atlas_http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'path'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2],
})
const trackedProducts = new Gauge({
  name: 'atlas_tracked_products_total',
  help: 'Number of products being tracked',
})
const priceCheckSuccesses = new Counter({
  name: 'atlas_price_check_successes_total',
  help: 'Successful price extractions',
  labelNames: ['store'],
})
const priceCheckFailures = new Counter({
  name: 'atlas_price_check_failures_total',
  help: 'Failed price extractions',
  labelNames: ['store'],
})

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3456

// ── Data directories ──────────────────────────────────────────────────────────
const ATLAS_DATA = process.env.ATLAS_DATA_ROOT ?? path.join(__dirname, '../../data')
const PRICES_DIR     = process.env.DATA_DIR      ?? path.join(ATLAS_DATA, 'prices')
const ORGANIZER_DIR  = process.env.ORGANIZER_DIR ?? path.join(ATLAS_DATA, 'organizer')
const BUDGET_DIR     = process.env.BUDGET_DIR    ?? path.join(ATLAS_DATA, 'budget')
const TASKS_ROOT     = process.env.TASKS_ROOT    ?? path.join(__dirname, '../../tasks')

const PRODUCTS_FILE      = path.join(PRICES_DIR, 'products.json')
const ALERTS_FILE        = path.join(PRICES_DIR, 'alerts.json')
const HISTORY_DIR        = path.join(PRICES_DIR, 'history')
const SUMMARIES_FILE     = path.join(PRICES_DIR, 'product-summaries.json')
const WIDGETS_CONFIG     = path.join(__dirname, '../../config/dashboard-widgets.json')
const CALENDAR_FILE  = path.join(ORGANIZER_DIR, 'calendar-events.json')
const app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())

// ── Metrics middleware ────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const end = httpDuration.startTimer({ method: req.method, path: req.path })
  res.on('finish', () => {
    httpRequests.inc({ method: req.method, path: req.path, status: res.statusCode })
    end()
  })
  next()
})

// ── Helpers ───────────────────────────────────────────────────────────────────

async function readJSON(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function augmentProducts(data, summaries = {}) {
  if (!data?.products) return data
  const products = data.products.map(p => ({
    ...p,
    stores: (p.stores || []).map(s => ({
      ...s,
      priceCHFCard: s.priceCHF !== null && s.priceCHF !== undefined
        ? Math.round(s.priceCHF * 1.025 * 100) / 100
        : null,
    })),
    ...(summaries[p.id] || {}),
  }))
  return { ...data, products }
}

async function readTasksDir(dir) {
  try {
    const files = await fs.readdir(dir)
    const tasks = []
    for (const f of files) {
      if (!f.endsWith('.md') || f.startsWith('_') || f.startsWith('.')) continue
      const raw = await fs.readFile(path.join(dir, f), 'utf-8')
      const fm = {}
      const match = raw.match(/^---\n([\s\S]*?)\n---/)
      if (match) {
        for (const line of match[1].split('\n')) {
          const [k, ...rest] = line.split(':')
          if (k && rest.length) fm[k.trim()] = rest.join(':').trim().replace(/^["']|["']$/g, '')
        }
      }
      tasks.push(fm)
    }
    return tasks
  } catch {
    return []
  }
}

// ── Overview (/): morning briefing across all Atlas sections ──────────────────

async function fetchWidgets() {
  const config = await readJSON(WIDGETS_CONFIG)
  const enabled = (config?.widgets || []).filter(w => w.enabled)
  const results = await Promise.all(enabled.map(async w => {
    try {
      const res = await fetch(w.url, { signal: AbortSignal.timeout(3000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      return { ...data, id: w.id }
    } catch {
      return { id: w.id, title: w.label, status: 'error', lines: ['Service unavailable'], actions: [] }
    }
  }))
  return results
}

function computeNextUp(todos, chores, queuedTasks, activeTasks) {
  const today = new Date().toISOString().slice(0, 10)
  const items = []

  for (const t of activeTasks.slice(0, 1))
    items.push({ text: `In progress: ${t.title}`, url: '/tasks' })

  const overdue = todos.filter(t => t.due && t.due < today)
  for (const t of overdue.slice(0, 2))
    items.push({ text: `Overdue: ${t.title}`, url: '/organizer' })

  const dueToday = todos.filter(t => t.due === today)
  for (const t of dueToday.slice(0, 2))
    items.push({ text: `Due today: ${t.title}`, url: '/organizer' })

  const overdueChores = chores.filter(c => c.next_due && c.next_due <= today)
  for (const c of overdueChores.slice(0, 2))
    items.push({ text: `Chore overdue: ${c.name}`, url: '/organizer' })

  if (queuedTasks.length > 0 && items.length < 4)
    items.push({ text: `Queued: ${queuedTasks[0].title}`, url: '/tasks' })

  const seen = new Set([...overdue, ...dueToday].map(t => t.id))
  const highPri = todos.filter(t => t.priority === 'high' && !seen.has(t.id))
  for (const t of highPri.slice(0, Math.max(0, 4 - items.length)))
    items.push({ text: t.title, url: '/organizer' })

  return items.slice(0, 5)
}

app.get('/', async (_req, res) => {
  const [productsData, alertsData, goalsData, todosData, choresData, summaries, widgets] = await Promise.all([
    readJSON(PRODUCTS_FILE),
    readJSON(ALERTS_FILE),
    readJSON(path.join(ORGANIZER_DIR, 'goals.json')),
    readJSON(path.join(ORGANIZER_DIR, 'user-todos.json')),
    readJSON(path.join(ORGANIZER_DIR, 'chores.json')),
    readJSON(SUMMARIES_FILE),
    fetchWidgets(),
  ])

  const [queuedTasks, activeTasks] = await Promise.all([
    readTasksDir(path.join(TASKS_ROOT, 'queue')),
    readTasksDir(path.join(TASKS_ROOT, 'active')),
  ])

  const products = productsData?.products || []
  const alerts = alertsData?.alerts || []
  const goals = (goalsData?.goals || []).filter(g => g.status === 'active')
  const todos = (todosData?.todos || []).filter(t => t.status === 'open')
  const chores = (choresData?.chores || [])

  // price snapshot for overview card
  const bestPrices = products.map(p => {
    const priced = (p.stores || []).filter(s => s.priceCHF !== null && s.priceCHF !== undefined)
    if (!priced.length) return null
    const best = priced.reduce((a, b) => a.priceCHF < b.priceCHF ? a : b)
    const summary = summaries?.[p.id] || null
    return {
      id: p.id,
      name: p.name,
      priceCHFCard: Math.round(best.priceCHF * 1.025 * 100) / 100,
      oneLiner: summary?.oneLiner || null,
    }
  }).filter(Boolean)

  // overdue todos
  const today = new Date().toISOString().slice(0, 10)
  const todayTodos = todos.filter(t => t.due && t.due <= today)

  res.render('overview', {
    title: 'Overview',
    activeNav: 'overview',
    goals,
    todos,
    todayTodos,
    chores,
    alerts,
    bestPrices,
    queuedTasks,
    activeTasks,
    productCount: products.length,
    nextUp: computeNextUp(todos, chores, queuedTasks, activeTasks),
    widgets,
  })
})

// ── Prices section ────────────────────────────────────────────────────────────

app.get('/prices', (_req, res) => {
  res.render('index', { title: 'Prices', activeNav: 'prices' })
})

app.get('/history', (_req, res) => {
  res.render('history', {
    title: 'Price History',
    activeNav: 'prices',
    includeCharts: false,
    product: null,
    history: null,
  })
})

app.get('/history/:productId', async (req, res) => {
  const { productId } = req.params
  const historyFile = path.join(HISTORY_DIR, `${productId}.json`)
  const [history, productsData, summaries] = await Promise.all([
    readJSON(historyFile),
    readJSON(PRODUCTS_FILE),
    readJSON(SUMMARIES_FILE),
  ])

  if (!history) {
    return res.status(404).render('history', {
      title: 'Not Found',
      activeNav: 'prices',
      includeCharts: false,
      product: null,
      history: null,
      productId,
    })
  }

  const product = productsData?.products?.find(p => p.id === productId) || { name: productId }
  const summary = summaries?.[productId] || null

  res.render('history', {
    title: product.name || productId,
    activeNav: 'prices',
    includeCharts: true,
    product,
    history,
    productId,
    summary,
  })
})

app.get('/compare', async (_req, res) => {
  const data = await readJSON(PRODUCTS_FILE)
  let products = data?.products || []

  if (products.length >= 10) {
    products = products.filter(p => p.category === 'electronics')
  }

  const rows = products.map(p => {
    const stores = (p.stores || []).filter(s => s.priceCHF !== null && s.priceCHF !== undefined)
    if (!stores.length) {
      return { id: p.id, name: p.name, storeName: null, storeUrl: null, priceEUR: null, priceCHF: null, priceCHFCard: null, landedCH: null, isBest: false }
    }
    const best = stores.reduce((min, s) => s.priceCHF < min.priceCHF ? s : min, stores[0])
    const ch = (best.parcelPricing || []).find(x => x.destination === 'CH')
    let storeName
    try { storeName = new URL(best.url).hostname.replace(/^www\./, '') } catch { storeName = null }
    return {
      id: p.id,
      name: p.name,
      storeName,
      storeUrl: best.url,
      priceEUR: best.price,
      priceCHF: best.priceCHF,
      priceCHFCard: Math.round(best.priceCHF * 1.025 * 100) / 100,
      landedCH: ch ? ch.totalCHF : null,
      isBest: false,
    }
  })

  const validRows = rows.filter(r => r.priceCHFCard !== null && r.priceCHFCard !== undefined)
  if (validRows.length) {
    const best = validRows.reduce((min, r) => {
      const a = r.landedCH ?? r.priceCHFCard
      const b = min.landedCH ?? min.priceCHFCard
      return a < b ? r : min
    }, validRows[0])
    best.isBest = true
  }

  const bestRow = rows.find(r => r.isBest) || null

  const allLastChecked = products.flatMap(p => p.stores || [])
    .map(s => s.lastChecked ? new Date(s.lastChecked).getTime() : 0)
    .filter(Boolean)
  const mostRecent = allLastChecked.length ? Math.max(...allLastChecked) : 0
  const ratesStale = mostRecent > 0 && (Date.now() - mostRecent) > 2 * 60 * 60 * 1000

  res.render('compare', { title: 'Compare', activeNav: 'prices', rows, bestRow, ratesStale })
})

// ── Organizer section ─────────────────────────────────────────────────────────

app.get('/organizer', async (_req, res) => {
  const [goalsData, todosData, choresData] = await Promise.all([
    readJSON(path.join(ORGANIZER_DIR, 'goals.json')),
    readJSON(path.join(ORGANIZER_DIR, 'user-todos.json')),
    readJSON(path.join(ORGANIZER_DIR, 'chores.json')),
  ])

  const today = new Date().toISOString().slice(0, 10)
  const allGoals = goalsData?.goals || []
  const userGoals = allGoals.filter(g => g.owner !== 'atlas')
  const atlasGoals = allGoals.filter(g => g.owner === 'atlas')
  const openTodos = (todosData?.todos || []).filter(t => t.status === 'open')
  const chores = choresData?.chores || []
  const overdueTodos = openTodos.filter(t => t.due && t.due < today)
  const dueTodayTodos = openTodos.filter(t => t.due === today)

  res.render('organizer', {
    title: 'Organizer',
    activeNav: 'organizer',
    userGoals,
    atlasGoals,
    todos: openTodos,
    overdueTodos,
    dueTodayTodos,
    chores,
    today,
  })
})

// ── Budget section ────────────────────────────────────────────────────────────

app.get('/budget', async (_req, res) => {
  const [accountsData, transactionsData, savingsData] = await Promise.all([
    readJSON(path.join(BUDGET_DIR, 'accounts.json')),
    readJSON(path.join(BUDGET_DIR, 'transactions.json')),
    readJSON(path.join(BUDGET_DIR, 'savings-goals.json')),
  ])

  const accounts = accountsData?.accounts || []
  const transactions = (transactionsData?.transactions || []).slice(-50)
  const savingsBuckets = savingsData?.buckets || []

  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0)
  const totalSavingsTarget = savingsBuckets.reduce((sum, b) => sum + (b.target || 0), 0)
  const totalSaved = savingsBuckets.reduce((sum, b) => sum + (b.saved || 0), 0)

  res.render('budget', {
    title: 'Budget',
    activeNav: 'budget',
    accounts,
    transactions,
    savingsBuckets,
    totalBalance,
    totalSavingsTarget,
    totalSaved,
  })
})

// ── Agents section ────────────────────────────────────────────────────────────

const AGENTS_DIR = process.env.AGENTS_DIR ?? '/claude-agents'

let _agentsCache = null
let _agentsCacheAt = 0

async function readAgentsFromDisk() {
  const now = Date.now()
  if (_agentsCache && now - _agentsCacheAt < 60_000) return _agentsCache

  try {
    const files = (await fs.readdir(AGENTS_DIR)).sort()
    const agents = []

    for (const f of files) {
      if (!f.endsWith('.md') || f.startsWith('_') || f.startsWith('.')) continue
      const raw = await fs.readFile(path.join(AGENTS_DIR, f), 'utf-8')
      const match = raw.match(/^---\n([\s\S]*?)\n---/)
      if (!match) continue

      const fm = {}
      let key = null
      let multiLines = []
      let inMulti = false

      for (const line of match[1].split('\n')) {
        if (/^[a-zA-Z]/.test(line) && line.includes(':')) {
          if (inMulti && key) fm[key] = multiLines.join(' ')
          inMulti = false; multiLines = []; key = null
          const colon = line.indexOf(':')
          key = line.slice(0, colon).trim()
          const val = line.slice(colon + 1).trim()
          if (val === '>' || val === '|') { inMulti = true } else { fm[key] = val.replace(/^["']|["']$/g, '') }
        } else if (inMulti && (line.startsWith('  ') || line.startsWith('\t'))) {
          multiLines.push(line.trim())
        } else if (inMulti) {
          if (key) fm[key] = multiLines.join(' ')
          inMulti = false; multiLines = []; key = null
        }
      }
      if (inMulti && key) fm[key] = multiLines.join(' ')
      if (!fm.name) continue

      const modelRaw = (fm.model || '').toLowerCase()
      const model = modelRaw.includes('opus') ? 'opus' : modelRaw.includes('haiku') ? 'haiku' : 'sonnet'
      const desc = (fm.description || '').replace(/\s+/g, ' ').trim()
      const purpose = desc.split(/\.\s+(?=[A-Z])/)[0].slice(0, 140)

      agents.push({ slug: fm.name, model, color: fm.color || '#888', purpose, tools: fm.tools || '' })
    }

    _agentsCache = agents
    _agentsCacheAt = now
    return agents
  } catch {
    return _agentsCache || []
  }
}

app.get('/agents', async (_req, res) => {
  const agents = await readAgentsFromDisk()
  res.render('agents', { title: 'Agents', activeNav: 'agents', agents })
})

app.get('/webapp-team', async (_req, res) => {
  const agents = await readAgentsFromDisk()
  res.render('webapp-team', { title: 'Webapp Team', activeNav: 'webapp-team', agents })
})

app.get('/reference', async (_req, res) => {
  const agents = await readAgentsFromDisk()
  res.render('reference', { title: 'Reference', activeNav: 'reference', agents })
})

// ── Tasks section ─────────────────────────────────────────────────────────────

app.get('/tasks', async (_req, res) => {
  const [queuedTasks, activeTasks, completedTasks, failedTasks] = await Promise.all([
    readTasksDir(path.join(TASKS_ROOT, 'queue')),
    readTasksDir(path.join(TASKS_ROOT, 'active')),
    readTasksDir(path.join(TASKS_ROOT, 'completed')),
    readTasksDir(path.join(TASKS_ROOT, 'failed')),
  ])
  res.render('tasks', {
    title: 'Tasks',
    activeNav: 'tasks',
    queuedTasks,
    activeTasks,
    completedTasks,
    failedTasks,
    queueCount: queuedTasks.length,
    activeCount: activeTasks.length,
    completedCount: completedTasks.length,
    failedCount: failedTasks.length,
  })
})

app.get('/docs', (_req, res) => {
  res.render('docs', { title: 'Documentation', activeNav: 'docs' })
})
// ── Calendar section ──────────────────────────────────────────────────────────

const ATLAS_FIT_URL = process.env.ATLAS_FIT_URL ?? 'http://atlas-fit:3457'

async function fetchTrainingEvents() {
  try {
    const res = await fetch(`${ATLAS_FIT_URL}/api/training-events`, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

function buildCalendarEvents(calData, trainingEvents) {
  const custom = (calData?.events || []).map(e => {
    const cat = e.category || 'other'
    const colors = SESSION_COLORS[cat] || SESSION_COLORS.other
    return {
      id: e.id,
      title: e.title,
      start: e.start_time ? `${e.date}T${e.start_time}` : e.date,
      end: e.end_time ? `${e.date}T${e.end_time}` : undefined,
      allDay: !e.start_time,
      backgroundColor: e.color || colors.bg,
      borderColor: e.color ? e.color : colors.border,
      textColor: '#fff',
      extendedProps: {
        category: cat,
        location: e.location || null,
        description: e.description || null,
        gcal_sync: e.gcal_sync || false,
        gcal_event_id: e.gcal_event_id || null,
      },
    }
  })
  return [...custom, ...(trainingEvents || [])]
}

app.get('/calendar', async (_req, res) => {
  const [calData, trainingEvents] = await Promise.all([
    readJSON(CALENDAR_FILE),
    fetchTrainingEvents(),
  ])
  res.render('calendar', {
    title: 'Calendar',
    activeNav: 'calendar',
    eventsJson: JSON.stringify(buildCalendarEvents(calData, trainingEvents)),
  })
})

app.get('/api/calendar/events', async (_req, res) => {
  const [calData, trainingEvents] = await Promise.all([
    readJSON(CALENDAR_FILE),
    fetchTrainingEvents(),
  ])
  res.json(buildCalendarEvents(calData, trainingEvents))
})

// ── API routes ────────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() })
})

app.get('/metrics', async (_req, res) => {
  const data = await readJSON(PRODUCTS_FILE)
  trackedProducts.set(data?.products?.length ?? 0)
  res.set('Content-Type', register.contentType)
  res.end(await register.metrics())
})

app.get('/status', async (_req, res) => {
  const [productsData, alertsData] = await Promise.all([
    readJSON(PRODUCTS_FILE),
    readJSON(ALERTS_FILE),
  ])
  const products = productsData?.products || []
  const alerts = alertsData?.alerts || []
  const pricedStores = products.flatMap(p => p.stores || []).filter(s => s.priceCHF !== null && s.priceCHF !== undefined)
  const failedStores = products.flatMap(p => p.stores || []).filter(s => (s.priceCHF === null || s.priceCHF === undefined) && s.lastChecked)
  const lastChecked = products.flatMap(p => p.stores || [])
    .map(s => s.lastChecked).filter(Boolean).sort().at(-1) ?? null
  const grafanaUrl = process.env.GRAFANA_URL ?? null
  res.render('status', {
    title: 'Status',
    activeNav: 'status',
    uptime: process.uptime(),
    products,
    alerts,
    pricedStores: pricedStores.length,
    failedStores: failedStores.length,
    lastChecked,
    grafanaUrl,
  })
})

app.get('/api/products', async (_req, res) => {
  const [data, summaries] = await Promise.all([readJSON(PRODUCTS_FILE), readJSON(SUMMARIES_FILE)])
  if (!data) return res.status(404).json({ error: 'products.json not found' })
  res.json(augmentProducts(data, summaries || {}))
})

app.get('/api/alerts', async (_req, res) => {
  const data = await readJSON(ALERTS_FILE)
  if (!data) return res.status(404).json({ error: 'alerts.json not found' })
  res.json(data)
})

app.get('/api/stream-check', (_req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')

  const indexPath = path.join(__dirname, 'index.js')
  const child = spawn(process.execPath, [indexPath, 'check-all'], {
    cwd: __dirname,
    env: { ...process.env },
  })

  function sendLine(line) {
    if (!line.trim()) return
    res.write(`data: ${line}\n\n`)
  }

  let stdoutBuf = ''
  child.stdout.on('data', chunk => {
    stdoutBuf += chunk.toString()
    const lines = stdoutBuf.split('\n')
    stdoutBuf = lines.pop()
    lines.forEach(sendLine)
  })

  let stderrBuf = ''
  child.stderr.on('data', chunk => {
    stderrBuf += chunk.toString()
    const lines = stderrBuf.split('\n')
    stderrBuf = lines.pop()
    lines.forEach(sendLine)
  })

  child.on('close', () => {
    if (stdoutBuf.trim()) sendLine(stdoutBuf)
    if (stderrBuf.trim()) sendLine(stderrBuf)
    res.write('event: done\ndata: {}\n\n')
    res.end()
  })

  child.on('error', err => {
    sendLine(`[ERROR] ${err.message}`)
    res.write('event: done\ndata: {}\n\n')
    res.end()
  })
})

app.post('/api/add-product', async (req, res) => {
  const { url, name, category, weight } = req.body
  if (!url) return res.status(400).json({ ok: false, error: 'url is required' })

  const args = [path.join(__dirname, 'index.js'), 'add-product', '--url', url]
  if (name)     args.push('--name', name)
  if (category) args.push('--category', category)
  if (weight)   args.push('--weight', String(weight))

  return new Promise(resolve => {
    const child = spawn(process.execPath, args, { cwd: __dirname, env: { ...process.env } })
    let out = ''
    let err = ''
    child.stdout.on('data', c => { out += c })
    child.stderr.on('data', c => { err += c })
    child.on('close', code => {
      if (code === 0) {
        res.json({ ok: true, output: out })
      } else {
        res.status(500).json({ ok: false, error: err || out || `Exit code ${code}` })
      }
      resolve()
    })
    child.on('error', spawnErr => {
      res.status(500).json({ ok: false, error: spawnErr.message })
      resolve()
    })
  })
})

// ── API 404 — must come after all /api/* routes ───────────────────────────────

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'not found' })
})

// ── Page 404 & 500 error handlers ─────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).render('404', { title: 'Not Found', activeNav: '' })
})

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(500).render('500', { title: 'Error', activeNav: '' })
})

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Atlas dashboard running at http://localhost:${PORT}`)
})

// suppress unused warning — counters are wired to Prometheus scrape, not called directly
void priceCheckSuccesses
void priceCheckFailures
