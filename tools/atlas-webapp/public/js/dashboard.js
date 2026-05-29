// ── Fade-up on scroll ─────────────────────────────────────────────────────────

const io = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) } }),
  { threshold: 0.05 }
)
document.querySelectorAll('.fade-up').forEach(el => io.observe(el))

// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function timeAgo(isoStr) {
  if (!isoStr) return ''
  const diff = Date.now() - new Date(isoStr).getTime()
  if (diff < 60000)  return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

function hostname(url) {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

// ── Products grid ─────────────────────────────────────────────────────────────

async function loadProducts() {
  const res = await fetch('/api/products')
  const data = await res.json()
  const products = data?.products || []

  const countEl = document.getElementById('statProducts')
  const alertEl = document.getElementById('statAlerts')
  const storesEl = document.getElementById('statStores')
  if (countEl) countEl.textContent = products.length
  if (storesEl) storesEl.textContent = products.reduce((n, p) => n + (p.stores?.length || 0), 0)

  const countBadge = document.getElementById('productCount')
  if (countBadge) countBadge.textContent = products.length

  const grid = document.getElementById('productsGrid')
  if (!grid) return

  if (!products.length) {
    grid.innerHTML = '<div style="color:var(--muted2);font-size:14px;padding:20px 0">No products tracked yet. Add one above.</div>'
    return
  }

  grid.innerHTML = products.map(p => {
    const pricedStores = (p.stores || []).filter(s => s.priceCHF != null)
    const best = pricedStores.length ? pricedStores.reduce((m, s) => s.priceCHF < m.priceCHF ? s : m, pricedStores[0]) : null
    const bestCard = best ? Math.round(best.priceCHF * 1.025 * 100) / 100 : null
    const ch = best ? (best.parcelPricing || []).find(x => x.destination === 'CH') : null
    const catClass = p.category === 'electronics' ? 'pill-blue' : p.category === 'clothing' ? 'pill-purple' : p.category === 'footwear' ? 'pill-orange' : 'pill-muted'

    const storeRows = (p.stores || []).map(s => {
      const t = s.extractionTier || ''
      const tClass = t === 'jsonld' ? 'pill-green' : t === 'opengraph' ? 'pill-yellow' : t === 'heuristic' ? 'pill-orange' : 'pill-red'
      const tLabel = t === 'jsonld' ? 'JSON-LD' : t === 'opengraph' ? 'OpenGraph' : t === 'heuristic' ? 'Heuristic' : 'failed'
      const cardPrice = s.priceCHF != null ? Math.round(s.priceCHF * 1.025 * 100) / 100 : null
      return `<div class="store-row">
        <div class="store-row-top">
          <a href="${esc(s.url)}" target="_blank" rel="noopener" class="store-hostname">${esc(hostname(s.url))}</a>
          <span class="pill ${tClass}" style="font-size:10px">${tLabel}</span>
        </div>
        ${cardPrice != null
          ? `<div class="store-price">CHF ${cardPrice.toFixed(2)} <span class="orig-price">card rate</span></div>`
          : `<div style="font-size:12px;color:var(--muted2)">Price not available</div>`
        }
      </div>`
    }).join('')

    return `<div class="product-card">
      <div class="product-card-header">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
          <div class="product-name"><a href="/history/${esc(p.id)}" style="color:var(--text);text-decoration:none">${esc(p.name)}</a></div>
          <span class="pill ${catClass}" style="flex-shrink:0">${esc(p.category)}</span>
        </div>
        <div style="margin-top:12px;display:flex;align-items:baseline;gap:8px">
          ${bestCard != null
            ? `<span style="font-size:22px;font-weight:700;color:var(--text)">CHF ${bestCard.toFixed(2)}</span>
               <span style="font-size:12px;color:var(--muted)">card rate</span>`
            : `<span style="font-size:14px;color:var(--muted2)">No price data</span>`
          }
        </div>
        ${ch ? `<div style="font-size:12px;color:var(--muted);margin-top:4px">Landed CH: <strong style="color:var(--text)">CHF ${Number(ch.totalCHF).toFixed(2)}</strong></div>` : ''}
        ${p.oneLiner ? `<div style="font-size:12px;color:var(--muted2);margin-top:8px;line-height:1.5;font-style:italic">${esc(p.oneLiner)}</div>` : ''}
      </div>
      <div class="store-rows">${storeRows}</div>
      <div class="card-footer">
        <span class="history-link">${best ? timeAgo(best.lastChecked) : 'Never checked'}</span>
        <a href="/history/${esc(p.id)}" class="btn btn-ghost" style="padding:4px 10px;font-size:12px">History →</a>
      </div>
    </div>`
  }).join('')
}

// ── Alerts table ──────────────────────────────────────────────────────────────

async function loadAlerts() {
  const res = await fetch('/api/alerts')
  const data = await res.json()
  const alerts = data?.alerts || []

  const alertCountEl = document.getElementById('statAlerts')
  if (alertCountEl) alertCountEl.textContent = alerts.length

  const badge = document.getElementById('alertCount')
  if (badge) badge.textContent = alerts.length

  const wrap = document.getElementById('alertsWrap')
  if (!wrap) return

  if (!alerts.length) {
    wrap.innerHTML = '<div class="table-empty">No alerts configured. Use the CLI: <code>node index.js set-alert "Name" --threshold 150</code></div>'
    return
  }

  wrap.innerHTML = `<table>
    <thead><tr><th>Product</th><th>Threshold (CHF)</th><th>Last Triggered</th><th>Status</th></tr></thead>
    <tbody>${alerts.map(a => `<tr>
      <td class="cell-strong">${esc(a.productName || a.productId)}</td>
      <td>${a.thresholdCHF != null ? `CHF ${Number(a.thresholdCHF).toFixed(2)}` : '<span class="cell-muted">—</span>'}</td>
      <td class="cell-muted">${a.lastTriggered ? new Date(a.lastTriggered).toLocaleString('de-CH') : '—'}</td>
      <td><span class="pill ${a.active ? 'pill-green' : 'pill-muted'}">${a.active ? 'Active' : 'Inactive'}</span></td>
    </tr>`).join('')}</tbody>
  </table>`
}

// ── Add product form ──────────────────────────────────────────────────────────

const addForm = document.getElementById('addForm')
const addStatus = document.getElementById('addStatus')
const addBtn = document.getElementById('addBtn')

if (addForm) {
  addForm.addEventListener('submit', async e => {
    e.preventDefault()
    const url = document.getElementById('inputUrl').value.trim()
    const name = document.getElementById('inputName').value.trim()
    const category = document.getElementById('inputCategory').value
    const weight = document.getElementById('inputWeight').value

    addBtn.disabled = true
    addStatus.style.display = 'block'
    addStatus.textContent = 'Adding product…'

    try {
      const res = await fetch('/api/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, name: name || undefined, category, weight: weight ? Number(weight) : undefined }),
      })
      const data = await res.json()
      if (data.ok) {
        addStatus.style.color = 'var(--green)'
        addStatus.textContent = '✓ Product added. Refreshing…'
        addForm.reset()
        await loadProducts()
      } else {
        addStatus.style.color = 'var(--red2)'
        addStatus.textContent = `Error: ${data.error}`
      }
    } catch (err) {
      addStatus.style.color = 'var(--red2)'
      addStatus.textContent = `Network error: ${err.message}`
    } finally {
      addBtn.disabled = false
    }
  })
}

// ── Check all (SSE) ───────────────────────────────────────────────────────────

const checkBtn = document.getElementById('checkBtn')
const logPanel = document.getElementById('logPanel')

if (checkBtn) {
  checkBtn.addEventListener('click', () => {
    checkBtn.disabled = true
    checkBtn.textContent = 'Checking…'
    if (logPanel) { logPanel.style.display = 'block'; logPanel.innerHTML = '' }

    const es = new EventSource('/api/stream-check')

    es.onmessage = e => {
      if (!logPanel) return
      const line = document.createElement('div')
      line.textContent = e.data
      logPanel.appendChild(line)
      logPanel.scrollTop = logPanel.scrollHeight
    }

    es.addEventListener('done', () => {
      es.close()
      checkBtn.disabled = false
      checkBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1.5A6.5 6.5 0 1 0 14.5 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M8 4.5v3.75l2.5 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Check All Prices Now`
      loadProducts()
      loadAlerts()
    })

    es.onerror = () => {
      es.close()
      checkBtn.disabled = false
      checkBtn.textContent = 'Check All Prices Now'
      if (logPanel) {
        const line = document.createElement('div')
        line.style.color = 'var(--red2)'
        line.textContent = '[Connection error]'
        logPanel.appendChild(line)
      }
    }
  })
}

// ── Init ──────────────────────────────────────────────────────────────────────

loadProducts()
loadAlerts()
