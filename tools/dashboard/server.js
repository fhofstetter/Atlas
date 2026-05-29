const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const https = require('https')

const app = express()
const PORT = process.env.PORT || 3000
const DATA_ROOT = process.env.ATLAS_DATA_DIR || path.join(__dirname, '../../data')
const ATLAS_ROOT = process.env.ATLAS_ROOT || path.join(__dirname, '../..')

app.use(cors())
app.use(express.json())

function readJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    console.error(`[atlas-dashboard] Failed to read ${filePath}:`, err.message)
    return null
  }
}

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

function todayString() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}${mm}${dd}`
}

function currentYearMonth() {
  const d = new Date()
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    prefix: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/api/status', (req, res) => {
  const organizerExists =
    fileExists(path.join(DATA_ROOT, 'organizer/goals.json')) ||
    fileExists(path.join(DATA_ROOT, 'organizer/chores.json')) ||
    fileExists(path.join(DATA_ROOT, 'organizer/user-todos.json'))

  const healthExists =
    fileExists(path.join(DATA_ROOT, 'health/sleep-log.json')) ||
    fileExists(path.join(DATA_ROOT, 'health/fitness-log.json'))

  const budgetExists =
    fileExists(path.join(DATA_ROOT, 'budget/accounts.json')) ||
    fileExists(path.join(DATA_ROOT, 'budget/transactions.json'))

  const travelExists = fileExists(path.join(DATA_ROOT, 'travel/trips.json'))

  res.json({
    timestamp: new Date().toISOString(),
    data_dir: DATA_ROOT,
    modules: {
      organizer: organizerExists,
      health: healthExists,
      budget: budgetExists,
      travel: travelExists
    }
  })
})

app.get('/api/organizer', (req, res) => {
  const goalsData  = readJson(path.join(DATA_ROOT, 'organizer/goals.json'))
  const goals      = goalsData?.goals  || []
  const choresData = readJson(path.join(DATA_ROOT, 'organizer/chores.json'))
  const chores     = choresData?.chores || []
  const todosData  = readJson(path.join(DATA_ROOT, 'organizer/user-todos.json'))
  const todos      = todosData?.todos  || []

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  const overdue_chores = chores.filter(c => c.next_due && c.next_due < todayStr).length
  const overdue_todos = todos.filter(t =>
    t.status !== 'done' && t.due_date && t.due_date < todayStr
  ).length
  const active_goals = goals.filter(g => g.status === 'active').length

  res.json({ goals, chores, todos, overdue_chores, overdue_todos, active_goals })
})

app.get('/api/health', (req, res) => {
  const sleepData    = readJson(path.join(DATA_ROOT, 'health/sleep-log.json'))
  const sleepEntries = sleepData?.entries    || []
  const fitnessData  = readJson(path.join(DATA_ROOT, 'health/fitness-log.json'))
  const workouts     = fitnessData?.workouts || []
  const healthGoalsData = readJson(path.join(DATA_ROOT, 'health/health-goals.json'))
  const healthGoals  = healthGoalsData?.goals || []

  const sleepLog   = sleepEntries
  const fitnessLog = workouts

  const sortedSleep = [...sleepLog].sort((a, b) => (a.date > b.date ? -1 : 1))
  const last14Sleep = sortedSleep.slice(0, 14)
  const last7Sleep = sortedSleep.slice(0, 7)

  let avg_hours_7d = null
  let avg_quality_7d = null
  if (last7Sleep.length >= 2) {
    avg_hours_7d = Math.round((last7Sleep.reduce((s, e) => s + (e.hours || 0), 0) / last7Sleep.length) * 10) / 10
    avg_quality_7d = Math.round((last7Sleep.reduce((s, e) => s + (e.quality || 0), 0) / last7Sleep.length) * 10) / 10
  }

  const sortedFitness = [...fitnessLog].sort((a, b) => (a.date > b.date ? -1 : 1))
  const last14Fitness = sortedFitness.slice(0, 14)

  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]

  const workouts_7d = fitnessLog.filter(e => e.date && e.date >= sevenDaysAgoStr).length

  res.json({
    sleep: {
      last14: last14Sleep,
      avg_hours_7d,
      avg_quality_7d,
      last_entry: sortedSleep[0] || null
    },
    fitness: {
      last14: last14Fitness,
      last_entry: sortedFitness[0] || null,
      workouts_7d
    },
    health_goals: healthGoals
  })
})

app.get('/api/budget', (req, res) => {
  const accountsData  = readJson(path.join(DATA_ROOT, 'budget/accounts.json'))
  const accounts      = accountsData?.accounts || []
  const txnData       = readJson(path.join(DATA_ROOT, 'budget/transactions.json'))
  const transactions  = txnData?.transactions  || []
  const savingsData   = readJson(path.join(DATA_ROOT, 'budget/savings-goals.json'))
  const savingsGoals  = savingsData?.buckets   || []

  const { year, month, prefix } = currentYearMonth()
  const monthTxns = transactions.filter(t => t.date && t.date.startsWith(prefix))

  let income = 0
  let expenses = 0
  const by_category = {}

  for (const txn of monthTxns) {
    const amt = typeof txn.amount === 'number' ? txn.amount : parseFloat(txn.amount) || 0
    if (amt >= 0) {
      income += amt
    } else {
      expenses += Math.abs(amt)
    }
    const cat = txn.category || 'Uncategorized'
    if (amt < 0) {
      by_category[cat] = (by_category[cat] || 0) + Math.abs(amt)
    }
  }

  res.json({
    accounts,
    current_month: {
      year,
      month,
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
      net: Math.round((income - expenses) * 100) / 100,
      by_category
    },
    savings: savingsGoals
  })
})

app.get('/api/docs', (req, res) => {
  const commandsDir = path.join(ATLAS_ROOT, '.claude/commands')
  const agentsDir   = path.join(ATLAS_ROOT, '.claude/agents')

  function parseFrontmatter(filePath) {
    try {
      const raw = fs.readFileSync(filePath, 'utf8')
      const match = raw.match(/^---\n([\s\S]*?)\n---/)
      if (!match) return null
      const block = match[1]
      const result = {}
      const lines = block.split('\n')
      let currentKey = null
      let multiline = []
      let inMultiline = false
      for (const line of lines) {
        const kv = line.match(/^(\w[\w-]*):\s*(.*)$/)
        if (kv) {
          if (inMultiline && currentKey) {
            result[currentKey] = multiline.join(' ').trim()
            multiline = []
            inMultiline = false
          }
          const [, key, val] = kv
          if (val.trim() === '>') {
            currentKey = key
            inMultiline = true
          } else {
            result[key] = val.trim()
            currentKey = key
          }
        } else if (inMultiline && line.startsWith('  ')) {
          multiline.push(line.trim())
        }
      }
      if (inMultiline && currentKey) {
        result[currentKey] = multiline.join(' ').trim()
      }
      return result
    } catch {
      return null
    }
  }

  function loadDir(dir) {
    try {
      return fs.readdirSync(dir)
        .filter(f => f.endsWith('.md'))
        .map(f => {
          const fm = parseFrontmatter(path.join(dir, f))
          if (!fm || !fm.name) return null
          return {
            name: fm.name,
            description: fm.description || '',
            argument_hint: fm['argument-hint'] || null,
            model: fm.model || null,
            tools: fm.tools || null
          }
        })
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name))
    } catch {
      return []
    }
  }

  res.json({
    commands: loadDir(commandsDir),
    agents:   loadDir(agentsDir)
  })
})

app.get('/api/today', (req, res) => {
  const dateStr = todayString()
  const planPath = path.join(ATLAS_ROOT, `output/daily-plan_${dateStr}.md`)

  if (!fileExists(planPath)) {
    return res.json({ exists: false, date: dateStr, content: null })
  }

  try {
    const content = fs.readFileSync(planPath, 'utf8')
    res.json({ exists: true, date: dateStr, content })
  } catch (err) {
    console.error(`[atlas-dashboard] Failed to read plan ${planPath}:`, err.message)
    res.json({ exists: false, date: dateStr, content: null })
  }
})

app.get('/travel', (req, res) => {
  res.sendFile(path.join(__dirname, 'travel.html'))
})

app.get('/api/travel/osrm', (req, res) => {
  const coords = (req.query.coords || '').trim()
  if (!coords) return res.status(400).json({ error: 'coords required' })
  if (!/^[-0-9.,;]+$/.test(coords)) return res.status(400).json({ error: 'invalid coords' })
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`
  const req2 = https.get(url, { headers: { 'User-Agent': 'atlas-dashboard/1.0' } }, (r) => {
    let raw = ''
    r.on('data', c => { raw += c })
    r.on('end', () => {
      try { res.json(JSON.parse(raw)) }
      catch { res.status(502).json({ error: 'parse error' }) }
    })
  })
  req2.on('error', (err) => {
    console.error('[atlas-dashboard] OSRM:', err.message)
    res.status(502).json({ error: 'routing unavailable' })
  })
})

app.get('/api/travel/weather', (req, res) => {
  const city = (req.query.city || '').trim()
  if (!city) return res.status(400).json({ error: 'city required' })
  const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`
  const req2 = https.get(url, { headers: { 'User-Agent': 'atlas-dashboard/1.0' } }, (r) => {
    let raw = ''
    r.on('data', c => { raw += c })
    r.on('end', () => {
      try { res.json(JSON.parse(raw)) }
      catch { res.status(502).json({ error: 'parse error' }) }
    })
  })
  req2.on('error', (err) => {
    console.error('[atlas-dashboard] Weather proxy:', err.message)
    res.status(502).json({ error: 'weather unavailable' })
  })
})

app.get('/api/travel', (req, res) => {
  const travelData = readJson(path.join(DATA_ROOT, 'travel/trips.json'))
  const trips = travelData?.trips || []

  const today = new Date().toISOString().split('T')[0]

  const upcoming = trips
    .filter(t => t.status !== 'completed' && t.status !== 'cancelled' && t.start_date >= today)
    .sort((a, b) => a.start_date.localeCompare(b.start_date))

  const ongoing = trips.filter(t =>
    t.status === 'ongoing' || (t.start_date <= today && t.end_date >= today)
  )

  const next = upcoming[0] || null
  const daysUntil = next
    ? Math.ceil((new Date(next.start_date) - new Date(today)) / 86400000)
    : null

  res.json({ trips, upcoming, ongoing, next, days_until_next: daysUntil })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[atlas-dashboard] Running at http://0.0.0.0:${PORT}`)
  console.log(`[atlas-dashboard] Data dir: ${DATA_ROOT}`)
  console.log(`[atlas-dashboard] Atlas root: ${ATLAS_ROOT}`)
})
