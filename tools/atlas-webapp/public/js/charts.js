// Reads history + product data embedded by history.ejs and renders Chart.js

const historyEl = document.getElementById('historyData')
const productEl = document.getElementById('productData')
if (!historyEl || !productEl) throw new Error('Missing data script tags')

const history = JSON.parse(historyEl.textContent)
const product = JSON.parse(productEl.textContent)

// ── Stats ─────────────────────────────────────────────────────────────────────

const allObs = history.observations || []

const cardPrices = allObs.flatMap(o =>
  (o.stores || []).filter(s => s.priceCHF != null).map(s => s.priceCHF * 1.025)
)

if (cardPrices.length) {
  const avg = cardPrices.reduce((a, b) => a + b, 0) / cardPrices.length
  const low = Math.min(...cardPrices)
  const latest = cardPrices[cardPrices.length - 1]

  const statCurrent = document.getElementById('statCurrentBest')
  const statAvg = document.getElementById('statAvg')
  const statLow = document.getElementById('statLow')

  if (statCurrent) statCurrent.textContent = `CHF ${latest.toFixed(2)}`
  if (statAvg) statAvg.textContent = `CHF ${avg.toFixed(2)}`
  if (statLow) statLow.textContent = `CHF ${low.toFixed(2)}`
}

// ── Chart ─────────────────────────────────────────────────────────────────────

const canvas = document.getElementById('priceChart')
if (!canvas || !window.Chart) throw new Error('Chart.js not loaded or canvas missing')

// Collect all unique timestamps as labels (sorted)
const timestamps = [...new Set(allObs.map(o => o.timestamp))].sort()
const labels = timestamps.map(ts => {
  const d = new Date(ts)
  return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' }) +
    ' ' + d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })
})

// Build one dataset per store URL
const storeMap = new Map()
for (const obs of allObs) {
  for (const s of (obs.stores || [])) {
    if (s.priceCHF == null) continue
    if (!storeMap.has(s.url)) storeMap.set(s.url, new Array(timestamps.length).fill(null))
    const idx = timestamps.indexOf(obs.timestamp)
    if (idx !== -1) storeMap.get(s.url)[idx] = Math.round(s.priceCHF * 1.025 * 100) / 100
  }
}

const palette = ['#e8445a', '#6ee7b7', '#82aaff', '#c792ea', '#ffcb6b', '#f78c6c']
const datasets = [...storeMap.entries()].map(([url, points], i) => {
  let label = url
  try { label = new URL(url).hostname.replace(/^www\./, '') } catch {}
  return {
    label,
    data: points,
    borderColor: palette[i % palette.length],
    backgroundColor: palette[i % palette.length] + '22',
    borderWidth: 2,
    pointRadius: timestamps.length <= 10 ? 4 : 2,
    spanGaps: true,
    tension: 0.3,
    fill: false,
  }
})

new Chart(canvas, {
  type: 'line',
  data: { labels, datasets },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        labels: { color: '#b0b0b0', font: { family: 'Inter, sans-serif', size: 12 } },
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        borderColor: '#2a2a2a',
        borderWidth: 1,
        titleColor: '#ffffff',
        bodyColor: '#b0b0b0',
        callbacks: {
          label: ctx => ` ${ctx.dataset.label}: CHF ${ctx.parsed.y?.toFixed(2) ?? '—'}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#666', font: { size: 11 }, maxTicksLimit: 10 },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: {
          color: '#666',
          font: { size: 11 },
          callback: v => `CHF ${v}`,
        },
      },
    },
  },
})
