// ── Exercise descriptions ──────────────────────────────────────────────────────
const EX_DESC = {
  'Bench Press':          'Lie flat, grip bar slightly wider than shoulder-width. Retract scapulae. Lower bar to lower chest with 2-sec descent. Drive explosively up. Feet planted throughout.',
  'Close-Grip Bench Press': 'Lie flat, grip bar shoulder-width apart (fists ~30cm). Elbows track 45° to body — not flared. Lower bar to lower chest, drive up to full lockout. Triceps do most of the work.',
  'Incline Bench Press':  'Set bench to 30–45°. Same technique as flat bench but the angle shifts emphasis to the upper (clavicular) chest and anterior deltoid.',
  'Military Press':       'Bar at front rack. Brace core and glutes hard. Press to full lockout — bar travels in a slight arc over the head. Do not hyperextend the lower back.',
  'Back Squat':           'Bar on upper traps (high-bar). Brace, break at hips and knees simultaneously. Hip crease below knee at bottom. Drive through the whole foot. Chest up throughout.',
  'Deadlift':             'Bar over mid-foot. Neutral spine — no rounding. Tension the bar before the pull. Lock hips and shoulders at the same rate. Finish with hip extension, not back hyperextension.',
  'Romanian Deadlift':    'Start standing, bar in hands. Hinge at the hips — not a squat. Bar stays close to legs. Feel hamstring stretch at bottom. Stop before lower back rounds.',
  'Barbell Bent-over Row':'Hinge to ~45°. Pull bar to lower chest or upper abs. Squeeze shoulder blades at the top. Control the descent.',
  'Pull-ups':             'Start from a full dead hang. Pull chin over bar by driving elbows toward hips. Controlled descent back to dead hang. Avoid shrugging the neck.',
  'Pull-up Negatives':    'Jump or step up so your chin is over the bar. Lower yourself as slowly as possible (3–5s descent). Trains the eccentric strength needed for full pull-ups.',
  'Push-ups':             'Plank position, hands slightly wider than shoulders. Lower chest to floor. Elbows at 45° from torso. Brace core throughout.',
  'EZ Bar Curl':          'Grip EZ bar at angled outer sections. Curl to shoulder height. Zero swinging. Controlled descent — the lowering builds more muscle than the lift.',
  'French Press':         'Lie on bench. EZ bar starts at full arm extension overhead. Upper arms stay vertical and still — hinge at elbow only. Lower bar toward forehead. Press back to lockout.',
  'Tricep Dips':          'Hands on bench behind you. Lower until upper arms are parallel to floor. Elbows track straight back, not flared.',
  'Wrist Curls':          'Forearms resting on thighs or bench, palms up. Allow wrist to drop to full extension, then curl up. Slow and controlled both ways.',
  'Reverse Wrist Curls':  'Same as wrist curls but palms face down. Trains extensors — usually underdeveloped relative to flexors.',
  'Rear Delt Raise':      'Hinge to ~45°. Arms hang with a slight elbow bend. Raise arms out to the sides, leading with elbows. Squeeze rear delts at the top.',
  'Glute Bridge':         'Lie on back, feet flat on floor, knees bent. Drive through heels, squeeze glutes at the top. Hold 2 seconds.',
  'Plank':                'Forearms and toes on ground. Body in a straight line from head to heels. Brace abs. Do not let hips sag.',
  'Decline Crunches':     'Feet secured at top of decline. Arms crossed or hands lightly behind head. Curl shoulders toward hips — short range, keep tension on abs.',
  'Hanging Knee Raise':   'Dead hang from pull-up bar. Raise knees toward chest by contracting abs. Lower slowly under control.',
  'Hanging Leg Raise':    'Dead hang. Raise straight legs to horizontal or beyond. Keep legs together. Brace core. Avoid kipping.',
  'Dead Hang':            'Hang passively from pull-up bar. Relax grip slightly. Breathe. Excellent for grip strength and spinal decompression — hang for 30–60s.',
  'Loaded Carry':         'Pick up load (plates or loaded backpack). Walk with tall posture. Shoulder blades retracted and depressed. Simulate military load-carrying.',
  'Bag Work Circuit':     'Jab-cross-hook combinations. Stay on your toes. Exhale sharply on each strike. Keep guard up between combinations.',
}

// ── Latin muscle name map for anatomy mode ────────────────────────────────────
const LATIN_MUSCLE_NAMES = {
  'chest':               'Pectoralis Major',
  'upper chest':         'Pectoralis Major (clavicular)',
  'front delt':          'Anterior Deltoid',
  'shoulders':           'Deltoid',
  'triceps':             'Triceps Brachii',
  'biceps':              'Biceps Brachii',
  'brachialis':          'Brachialis',
  'forearm flexors':     'Flexor Carpi Radialis',
  'forearm extensors':   'Extensor Carpi Radialis',
  'grip':                'Flexor Digitorum Superficialis',
  'core':                'Rectus Abdominis',
  'rectus abdominis':    'Rectus Abdominis',
  'lower abs':           'Rectus Abdominis (inferior)',
  'obliques':            'Obliquus Externus Abdominis',
  'hip flexors':         'Iliopsoas',
  'quads':               'Quadriceps Femoris',
  'adductors':           'Adductor Magnus',
  'lats':                'Latissimus Dorsi',
  'rhomboids':           'Rhomboid Major',
  'rear delt':           'Posterior Deltoid',
  'upper traps':         'Trapezius',
  'traps':               'Trapezius',
  'lower back':          'Erector Spinae',
  'glutes':              'Gluteus Maximus',
  'hamstrings':          'Biceps Femoris',
  'posterior chain':     'Posterior Chain',
  'spine':               'Erector Spinae',
  'calves':              'Gastrocnemius',
  'full body':           'Full Body',
  'full body conditioning': 'Full Body Conditioning',
}

// ── Muscle name → body-muscles library IDs ────────────────────────────────────
const MUSCLE_MAP = {
  'chest':              { f: ['chest-upper-left','chest-upper-right','chest-lower-left','chest-lower-right'], b: [] },
  'upper chest':        { f: ['chest-upper-left','chest-upper-right'], b: [] },
  'front delt':         { f: ['shoulder-front-left','shoulder-front-right'], b: [] },
  'shoulders':          { f: ['shoulder-front-left','shoulder-front-right','shoulder-side-left','shoulder-side-right'],
                          b: ['deltoid-rear-left','deltoid-rear-right'] },
  'triceps':            { f: [], b: ['triceps-long-left','triceps-long-right','triceps-lateral-left','triceps-lateral-right'] },
  'biceps':             { f: ['biceps-left','biceps-right'], b: [] },
  'brachialis':         { f: ['biceps-left','biceps-right'], b: [] },
  'forearm flexors':    { f: ['forearm-left','forearm-right'], b: [] },
  'forearm extensors':  { f: [], b: ['forearm-extensors-left','forearm-extensors-right'] },
  'grip':               { f: ['forearm-left','forearm-right'], b: ['forearm-extensors-left','forearm-extensors-right'] },
  'core':               { f: ['abs-upper-left','abs-upper-right','abs-lower-left','abs-lower-right','obliques-left','obliques-right'], b: [] },
  'rectus abdominis':   { f: ['abs-upper-left','abs-upper-right','abs-lower-left','abs-lower-right'], b: [] },
  'lower abs':          { f: ['abs-lower-left','abs-lower-right'], b: [] },
  'obliques':           { f: ['obliques-left','obliques-right'], b: [] },
  'hip flexors':        { f: ['hip-flexor-left','hip-flexor-right'], b: [] },
  'quads':              { f: ['quads-left','quads-right'], b: [] },
  'adductors':          { f: ['adductors-left','adductors-right'], b: [] },
  'lats':               { f: [], b: ['lats-upper-left','lats-upper-right','lats-mid-left','lats-mid-right','lats-lower-left','lats-lower-right'] },
  'rhomboids':          { f: [], b: ['traps-mid-left','traps-mid-right'] },
  'rear delt':          { f: [], b: ['deltoid-rear-left','deltoid-rear-right'] },
  'upper traps':        { f: [], b: ['traps-upper-left','traps-upper-right'] },
  'traps':              { f: [], b: ['traps-upper-left','traps-upper-right','traps-mid-left','traps-mid-right','traps-lower-left','traps-lower-right'] },
  'lower back':         { f: [], b: ['spine','lower-back-erectors-left','lower-back-erectors-right','lower-back-ql-left','lower-back-ql-right'] },
  'glutes':             { f: [], b: ['gluteus-maximus-left','gluteus-maximus-right','gluteus-medius-left','gluteus-medius-right'] },
  'hamstrings':         { f: [], b: ['hamstrings-medial-left','hamstrings-medial-right','hamstrings-lateral-left','hamstrings-lateral-right'] },
  'posterior chain':    { f: [], b: ['lower-back-erectors-left','lower-back-erectors-right',
                                     'gluteus-maximus-left','gluteus-maximus-right',
                                     'hamstrings-medial-left','hamstrings-medial-right',
                                     'hamstrings-lateral-left','hamstrings-lateral-right'] },
  'spine':              { f: [], b: ['spine','lower-back-erectors-left','lower-back-erectors-right'] },
  'calves':             { f: [], b: ['calves-gastroc-medial-left','calves-gastroc-medial-right',
                                     'calves-gastroc-lateral-left','calves-gastroc-lateral-right'] },
  'full body':          { f: ['chest-upper-left','chest-upper-right','abs-upper-left','abs-upper-right','quads-left','quads-right'],
                          b: ['lats-upper-left','lats-upper-right','gluteus-maximus-left','gluteus-maximus-right'] },
  'full body conditioning': { f: ['chest-upper-left','chest-upper-right','abs-upper-left','abs-upper-right','quads-left','quads-right'],
                               b: ['lats-upper-left','lats-upper-right','gluteus-maximus-left','gluteus-maximus-right'] },
}

// ── Anatomy mode state ────────────────────────────────────────────────────────
let _anatomyMode = localStorage.getItem('atlasAnatomyMode') === 'true'
let _currentPanelId = null
let _currentExName  = null

// ── Per-panel anatomy chart cache ─────────────────────────────────────────────
const _anatomyCharts = new Map()  // panelId → { front, back }

// ── Per-panel chart cache ─────────────────────────────────────────────────────
const _charts = new Map()  // panelId → { front, back }

function _initCharts(panelId) {
  if (_charts.has(panelId)) return _charts.get(panelId)
  if (!window.BodyMuscles) {
    console.warn('body-muscles library not loaded')
    return null
  }
  const { BodyChart, ViewSide } = window.BodyMuscles
  const frontEl = document.getElementById(`body-front-${panelId}`)
  const backEl  = document.getElementById(`body-back-${panelId}`)
  if (!frontEl || !backEl) return null
  const charts = {
    front: new BodyChart(frontEl, { view: ViewSide.FRONT, bodyState: {}, onMuscleClick: () => {} }),
    back:  new BodyChart(backEl,  { view: ViewSide.BACK,  bodyState: {}, onMuscleClick: () => {} }),
  }
  _charts.set(panelId, charts)
  return charts
}

function _destroyCharts(panelId) {
  // Clear the container SVGs so the next _initCharts gets a fresh DOM — no stale teal paths
  ;[`body-front-${panelId}`, `body-back-${panelId}`].forEach(id => {
    const el = document.getElementById(id)
    if (el) el.innerHTML = ''
  })
  _charts.delete(panelId)
}

// ── Anatomy mode functions ─────────────────────────────────────────────────────
function toggleAnatomyMode(panelId) {
  _anatomyMode = !_anatomyMode
  localStorage.setItem('atlasAnatomyMode', _anatomyMode)

  const panel = document.getElementById(`ex-panel-${panelId}`)
  if (panel) {
    panel.classList.toggle('anatomy-active', _anatomyMode)
  }

  const btn = document.getElementById(`anatomy-toggle-btn-${panelId}`)
  if (btn) btn.setAttribute('data-active', _anatomyMode ? 'anatomy' : 'standard')

  if (_currentPanelId === panelId && _currentExName) {
    showExerciseDetail(panelId, _currentExName)
  }
}

function _applyAnatomyModeToPanel(panelId) {
  const panel = document.getElementById(`ex-panel-${panelId}`)
  if (panel) panel.classList.toggle('anatomy-active', _anatomyMode)

  const btn = document.getElementById(`anatomy-toggle-btn-${panelId}`)
  if (btn) btn.setAttribute('data-active', _anatomyMode ? 'anatomy' : 'standard')
}

function _destroyAnatomyCharts(panelId) {
  const existing = _anatomyCharts.get(panelId)
  if (existing) {
    if (existing.front) { try { existing.front.destroy() } catch (e) {} }
    if (existing.back)  { try { existing.back.destroy()  } catch (e) {} }
    _anatomyCharts.delete(panelId)
  }
  ;[`anatomy-front-${panelId}`, `anatomy-back-${panelId}`].forEach(id => {
    const el = document.getElementById(id)
    if (el) el.innerHTML = ''
  })
}

function _renderAnatomyDiagrams(panelId, muscles) {
  if (!window.createBodyHighlighter) {
    console.warn('body-highlighter not loaded — falling back to body-muscles')
    requestAnimationFrame(() => {
      _destroyCharts(panelId)
      const charts = _initCharts(panelId)
      if (!charts) return
      const frontState = {}
      const backState  = {}
      muscles.forEach(m => {
        const map = MUSCLE_MAP[m.toLowerCase()]
        if (!map) return
        map.f.forEach(id => { frontState[id] = { intensity: 9, selected: true } })
        map.b.forEach(id => { backState[id]  = { intensity: 9, selected: true } })
      })
      charts.front.update({ bodyState: frontState })
      charts.back.update({ bodyState: backState })
      _recolorHighlighted(panelId)
      requestAnimationFrame(() => _recolorHighlighted(panelId))
    })
    return
  }

  _destroyAnatomyCharts(panelId)

  const frontEl = document.getElementById(`anatomy-front-${panelId}`)
  const backEl  = document.getElementById(`anatomy-back-${panelId}`)
  if (!frontEl || !backEl) return

  // Map muscle names to body-highlighter muscle strings using the LATIN_MUSCLE_NAMES
  // The library accepts both canonical muscle keys and anatomical aliases
  const primaryMuscles = muscles.map(m => {
    const latin = LATIN_MUSCLE_NAMES[m.toLowerCase()]
    return latin || m
  }).filter(Boolean)

  const frontHighlighter = window.createBodyHighlighter({
    container: frontEl,
    data: primaryMuscles.length
      ? [{ name: 'exercise', muscles: primaryMuscles, frequency: 1 }]
      : [],
    type: 'anterior',
    highlightedColors: ['#c97b2e', '#a0521a'],
    bodyColor: '#c8b99a',
    style: { width: '100%', height: '100%' },
  })

  const backHighlighter = window.createBodyHighlighter({
    container: backEl,
    data: primaryMuscles.length
      ? [{ name: 'exercise', muscles: primaryMuscles, frequency: 1 }]
      : [],
    type: 'posterior',
    highlightedColors: ['#c97b2e', '#a0521a'],
    bodyColor: '#c8b99a',
    style: { width: '100%', height: '100%' },
  })

  _anatomyCharts.set(panelId, { front: frontHighlighter, back: backHighlighter })
}

// ── Public API ────────────────────────────────────────────────────────────────
let _exerciseLibrary = []

function initExerciseModal(library) {
  _exerciseLibrary = library || []
  // Apply persisted anatomy mode to all panels on page load
  if (_anatomyMode) {
    document.querySelectorAll('.ex-panel').forEach(panel => {
      const id = panel.id.replace('ex-panel-', '')
      _applyAnatomyModeToPanel(id)
    })
  }
}

function _findExercise(name) {
  let ex = _exerciseLibrary.find(e => e.name === name)
  if (ex) return { ex, displayName: name }
  // Fallback: strip "(...)" suffix and re-match — e.g. "Military Press (Overhead Press)" → "Military Press"
  const stripped = name.replace(/\s*\([^)]*\)\s*$/, '').trim()
  if (stripped !== name) {
    ex = _exerciseLibrary.find(e => e.name === stripped)
    if (ex) return { ex, displayName: name }
  }
  return null
}

function showExerciseDetail(panelId, name) {
  const found = _findExercise(name)
  if (!found) return
  const ex = found.ex
  const displayName = found.displayName

  _currentPanelId = panelId
  _currentExName  = name

  const panel = document.getElementById(`ex-panel-${panelId}`)
  if (!panel) return
  panel.classList.add('has-content')

  // Apply anatomy-active class if mode is on
  _applyAnatomyModeToPanel(panelId)

  document.getElementById(`ex-panel-name-${panelId}`).textContent = displayName
  document.getElementById(`ex-panel-category-${panelId}`).textContent = ex.category || ''
  document.getElementById(`ex-panel-desc-${panelId}`).textContent = EX_DESC[displayName] || EX_DESC[ex.name] || ex.notes || ''

  const muscles = ex.muscles || []
  if (_anatomyMode) {
    document.getElementById(`ex-panel-muscles-${panelId}`).innerHTML =
      muscles.map(m => {
        const latin = LATIN_MUSCLE_NAMES[m.toLowerCase()]
        const label = latin || m
        return `<span class="ex-muscle-tag" title="${m}">${label}</span>`
      }).join('')
  } else {
    document.getElementById(`ex-panel-muscles-${panelId}`).innerHTML =
      muscles.map(m => `<span class="ex-muscle-tag">${m}</span>`).join('')
  }

  const equip = (ex.equipment && ex.equipment.length) ? ex.equipment.join(', ') : 'bodyweight'
  document.getElementById(`ex-panel-equipment-${panelId}`).textContent = `Equipment: ${equip}`

  // Highlight the active exercise in the current scope
  document.querySelectorAll(`[data-scope="${panelId}"] .ex-clickable`).forEach(el => {
    el.classList.toggle('ex-active', el.dataset.ex === name)
  })

  _renderSchematic(panelId, displayName || ex.name)

  if (_anatomyMode) {
    // Destroy stale body-muscles charts; render anatomy diagrams
    _destroyCharts(panelId)
    _renderAnatomyDiagrams(panelId, muscles)
  } else {
    // Destroy stale anatomy charts; render body-muscles diagrams
    _destroyAnatomyCharts(panelId)
    requestAnimationFrame(() => {
      _destroyCharts(panelId)
      const charts = _initCharts(panelId)
      if (!charts) return
      const frontState = {}
      const backState  = {}
      muscles.forEach(m => {
        const map = MUSCLE_MAP[m.toLowerCase()]
        if (!map) return
        map.f.forEach(id => { frontState[id] = { intensity: 9, selected: true } })
        map.b.forEach(id => { backState[id]  = { intensity: 9, selected: true } })
      })
      charts.front.update({ bodyState: frontState })
      charts.back.update({ bodyState: backState })
      _recolorHighlighted(panelId)
      requestAnimationFrame(() => _recolorHighlighted(panelId))
    })
  }
}

const _OUTLINE_FILLS = new Set(['', 'none', 'transparent', '#e0e0e0', '#f0f0f0', 'white', '#ffffff',
  '#94a3b8', '#0a0a0a', '#1a1a1a', '#111111'])

function _recolorPaths(containerIds, color) {
  containerIds.forEach(id => {
    const container = document.getElementById(id)
    if (!container) return
    container.querySelectorAll('svg path').forEach(path => {
      const fill = (path.getAttribute('fill') || path.style.fill || '').toLowerCase().replace(/\s/g, '')
      if (fill && !_OUTLINE_FILLS.has(fill) && !fill.startsWith('rgba(255') && !fill.startsWith('rgb(255')) {
        path.setAttribute('fill', color)
        path.style.fill = color
      }
    })
  })
}

// Colors the body-muscles library uses for highlighted (active) muscle paths
const _LIBRARY_MUSCLE_COLORS = new Set([
  '#7f1d1d', '#991b1b', '#b91c1c', '#dc2626', '#ef4444', '#f87171',
  'red', '#ff0000', '#f00'
])

function _recolorHighlighted(panelId) {
  // The body-muscles library colors active paths via style.fill (inline) not fill attribute.
  // Check inline style first, fall back to attribute. Normalize to hex where possible.
  ;[`body-front-${panelId}`, `body-back-${panelId}`].forEach(id => {
    const container = document.getElementById(id)
    if (!container) return
    container.querySelectorAll('svg path').forEach(path => {
      const raw = (path.style.fill || path.getAttribute('fill') || '').toLowerCase().trim()
      // Also handle rgb() form the browser may return for inline styles
      const fill = raw.startsWith('rgb') ? _rgbToHex(raw) : raw
      if (_LIBRARY_MUSCLE_COLORS.has(fill)) {
        path.setAttribute('fill', '#17bba5')
        path.style.fill = '#17bba5'
      }
    })
  })
}

function _rgbToHex(rgb) {
  const m = rgb.match(/\d+/g)
  if (!m || m.length < 3) return rgb
  return '#' + m.slice(0, 3).map(n => parseInt(n).toString(16).padStart(2, '0')).join('')
}

const EX_SCHEMATICS = {

  // ── Lying horizontal ───────────────────────────────────────────────────────
  // ── lying ───────────────────────────────────────────────────────────────────
  'Bench Press': `<img src="/img/exercises/Bench_press_1.png"
    alt="Bench Press form sequence"
    style="width:100%;max-width:420px;display:block;filter:invert(1) brightness(0.85);border-radius:4px">
  <div style="font-size:10px;color:var(--muted);margin-top:6px">Everkinetic · CC BY-SA 3.0</div>`,

  'Close-Grip Bench Press': `<div style="display:flex;gap:8px;align-items:flex-end">
    <img src="/img/exercises/Close_grip_barbell_bench_press_1.png"
      alt="Close-Grip Bench Press — start" style="width:50%;filter:invert(1) brightness(0.85);border-radius:4px">
    <img src="/img/exercises/Close_grip_barbell_bench_press_2.png"
      alt="Close-Grip Bench Press — finish" style="width:50%;filter:invert(1) brightness(0.85);border-radius:4px">
  </div>
  <div style="font-size:10px;color:var(--muted);margin-top:6px">Everkinetic · CC BY-SA 3.0 · start → finish</div>`,

  // ── standing ────────────────────────────────────────────────────────────────
  'Military Press': `<div style="display:flex;gap:8px;align-items:flex-end">
    <img src="/img/exercises/Barbell_shoulder_press_1.png"
      alt="Military Press — start position"
      style="width:50%;filter:invert(1) brightness(0.85);border-radius:4px">
    <img src="/img/exercises/Barbell_shoulder_press_2.png"
      alt="Military Press — lockout"
      style="width:50%;filter:invert(1) brightness(0.85);border-radius:4px">
  </div>
  <div style="font-size:10px;color:var(--muted);margin-top:6px">Everkinetic · CC BY-SA 3.0 · start → lockout</div>`,

  // ── hinging / bent-over ────────────────────────────────────────────────────
  'Romanian Deadlift': `<div style="display:flex;gap:8px;align-items:flex-end">
    <img src="/img/exercises/Romanian_dead_lift_1.png"
      alt="Romanian Deadlift — start" style="width:50%;filter:invert(1) brightness(0.85);border-radius:4px">
    <img src="/img/exercises/Romanian_dead_lift_2.png"
      alt="Romanian Deadlift — finish" style="width:50%;filter:invert(1) brightness(0.85);border-radius:4px">
  </div>
  <div style="font-size:10px;color:var(--muted);margin-top:6px">Everkinetic · CC BY-SA 3.0 · start → finish</div>`,

  'Deadlift': `<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:14px 16px;font-size:13px;line-height:1.9">
    <div style="color:var(--muted)">Bar over mid-foot — neutral spine</div>
    <div style="color:var(--muted)">Tension the bar before the pull</div>
    <div style="color:var(--muted)">Hips &amp; shoulders rise at the same rate</div>
    <div style="color:#17bba5">Posterior chain engaged</div>
    <div style="font-size:10px;color:var(--muted2);margin-top:8px;font-style:italic">placeholder — form guide image pending</div>
  </div>`,

  'Back Squat': `<img src="/img/exercises/Narrow_stance_squat_with_barbell_1.png"
    alt="Back Squat" style="width:100%;max-width:420px;display:block;filter:invert(1) brightness(0.85);border-radius:4px">
  <div style="font-size:10px;color:var(--muted);margin-top:6px">Everkinetic · CC BY-SA 3.0</div>`,

  // ── hanging ─────────────────────────────────────────────────────────────────
  'Pull-up Negatives': `<div style="display:flex;gap:8px;align-items:flex-end">
    <img src="/img/exercises/Pull_ups_1.png"
      alt="Pull-up — start" style="width:50%;filter:invert(1) brightness(0.85);border-radius:4px">
    <img src="/img/exercises/Pull_ups_2.png"
      alt="Pull-up — top" style="width:50%;filter:invert(1) brightness(0.85);border-radius:4px">
  </div>
  <div style="font-size:10px;color:var(--muted);margin-top:6px">Everkinetic · CC BY-SA 3.0 · lower slowly 4–5s (negatives)</div>`,

  'Barbell Bent-over Row': `<div style="display:flex;gap:8px;align-items:flex-end">
    <img src="/img/exercises/Reverse_grips_bent_over_barbell_rows_1.png"
      alt="Barbell Row — start" style="width:50%;filter:invert(1) brightness(0.85);border-radius:4px">
    <img src="/img/exercises/Reverse_grips_bent_over_barbell_rows_2.png"
      alt="Barbell Row — finish" style="width:50%;filter:invert(1) brightness(0.85);border-radius:4px">
  </div>
  <div style="font-size:10px;color:var(--muted);margin-top:6px">Everkinetic · CC BY-SA 3.0 · start → finish</div>`,

  'EZ Bar Curl': `<div style="display:flex;gap:8px;align-items:flex-end">
    <img src="/img/exercises/Ez_bar_curl_with_barbell_1.png"
      alt="EZ Bar Curl — start" style="width:50%;filter:invert(1) brightness(0.85);border-radius:4px">
    <img src="/img/exercises/Ez_bar_curl_with_barbell_2.png"
      alt="EZ Bar Curl — finish" style="width:50%;filter:invert(1) brightness(0.85);border-radius:4px">
  </div>
  <div style="font-size:10px;color:var(--muted);margin-top:6px">Everkinetic · CC BY-SA 3.0 · start → finish</div>`,

  'French Press': `<div style="display:flex;gap:8px;align-items:flex-end">
    <img src="/img/exercises/Lying_triceps_press_with_barbell_1.png"
      alt="French Press — start" style="width:50%;filter:invert(1) brightness(0.85);border-radius:4px">
    <img src="/img/exercises/Lying_triceps_press_with_barbell_2.png"
      alt="French Press — finish" style="width:50%;filter:invert(1) brightness(0.85);border-radius:4px">
  </div>
  <div style="font-size:10px;color:var(--muted);margin-top:6px">Everkinetic · CC BY-SA 3.0 · start → finish</div>`,

  'Plank': `<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:14px 16px;font-size:13px;line-height:1.9">
    <div style="color:var(--muted)">Forearms and toes on ground</div>
    <div style="color:var(--muted)">Straight line — head to heels</div>
    <div style="color:var(--muted)">Do not let hips sag or pike</div>
    <div style="color:#17bba5">Core engaged throughout</div>
    <div style="font-size:10px;color:var(--muted2);margin-top:8px;font-style:italic">placeholder — form guide image pending</div>
  </div>`,

  'Glute Bridge': `<div style="display:flex;gap:8px;align-items:flex-end">
    <img src="/img/exercises/Bent_knee_hip_raise_1.png"
      alt="Glute Bridge — start" style="width:50%;filter:invert(1) brightness(0.85);border-radius:4px">
    <img src="/img/exercises/Bent_knee_hip_raise_2.png"
      alt="Glute Bridge — finish" style="width:50%;filter:invert(1) brightness(0.85);border-radius:4px">
  </div>
  <div style="font-size:10px;color:var(--muted);margin-top:6px">Everkinetic · CC BY-SA 3.0 · start → finish</div>`,

  'Hanging Knee Raise': `<div style="display:flex;gap:8px;align-items:flex-end">
    <img src="/img/exercises/Body_leg_lifts_1.png"
      alt="Hanging Knee Raise — start" style="width:50%;filter:invert(1) brightness(0.85);border-radius:4px">
    <img src="/img/exercises/Body_leg_lifts_2.png"
      alt="Hanging Knee Raise — finish" style="width:50%;filter:invert(1) brightness(0.85);border-radius:4px">
  </div>
  <div style="font-size:10px;color:var(--muted);margin-top:6px">Everkinetic · CC BY-SA 3.0 · start → finish</div>`,

  'Decline Crunches': `<div style="display:flex;gap:8px;align-items:flex-end">
    <img src="/img/exercises/Decline_crunch_1.png"
      alt="Decline Crunches — start" style="width:50%;filter:invert(1) brightness(0.85);border-radius:4px">
    <img src="/img/exercises/Decline_crunch_2.png"
      alt="Decline Crunches — finish" style="width:50%;filter:invert(1) brightness(0.85);border-radius:4px">
  </div>
  <div style="font-size:10px;color:var(--muted);margin-top:6px">Everkinetic · CC BY-SA 3.0 · start → finish</div>`,

  'Rear Delt Raise': `<div style="display:flex;gap:8px;align-items:flex-end">
    <img src="/img/exercises/Bent_over_rear_deltoid_raise_with_head_on_bench_1.png"
      alt="Rear Delt Raise — start" style="width:50%;filter:invert(1) brightness(0.85);border-radius:4px">
    <img src="/img/exercises/Bent_over_rear_deltoid_raise_with_head_on_bench_2.png"
      alt="Rear Delt Raise — finish" style="width:50%;filter:invert(1) brightness(0.85);border-radius:4px">
  </div>
  <div style="font-size:10px;color:var(--muted);margin-top:6px">Everkinetic · CC BY-SA 3.0 · start → finish</div>`,

  'Dead Hang': `<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:14px 16px;font-size:13px;line-height:1.9">
    <div style="color:var(--muted)">Full grip on bar — overhand</div>
    <div style="color:var(--muted)">Relax shoulders — passive hang, no shrug</div>
    <div style="color:var(--muted)">Breathe steady — hold 30–60 s</div>
    <div style="color:#17bba5">Grip strength &amp; spinal decompression</div>
    <div style="font-size:10px;color:var(--muted2);margin-top:8px;font-style:italic">placeholder — form guide image pending</div>
  </div>`,

  // ── forearm ──────────────────────────────────────────────────────────────────
  'Wrist Curls': `<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:14px 16px;font-size:13px;line-height:1.9">
    <div style="color:var(--muted)">Forearm flat on thigh, palms up</div>
    <div style="color:var(--muted)">Full range — drop to extension, curl to top</div>
    <div style="color:var(--muted)">Slow and controlled both ways</div>
    <div style="color:#17bba5">Forearm flexors active</div>
    <div style="font-size:10px;color:var(--muted2);margin-top:8px;font-style:italic">placeholder — form guide image pending</div>
  </div>`,

  'Reverse Wrist Curls': `<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:14px 16px;font-size:13px;line-height:1.9">
    <div style="color:var(--muted)">Forearm flat on thigh, palms down</div>
    <div style="color:var(--muted)">Full range — drop to extension, curl to top</div>
    <div style="color:var(--muted)">Slow and controlled both ways</div>
    <div style="color:#17bba5">Forearm extensors active</div>
    <div style="font-size:10px;color:var(--muted2);margin-top:8px;font-style:italic">placeholder — form guide image pending</div>
  </div>`,
}

function _renderSchematic(panelId, exName) {
  const el = document.getElementById(`ex-panel-schematic-${panelId}`)
  if (!el) return
  const svg = EX_SCHEMATICS[exName]
  if (!svg) { el.style.display = 'none'; el.innerHTML = ''; return }
  el.style.display = ''
  el.innerHTML = `<div style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:10px">Form Guide</div>${svg}`
}

// ── Weekly diagram renderer ───────────────────────────────────────────────────
const _weeklyCharts = new Map()

function renderWeeklyDiagram(frontId, backId, muscleHitMap, color = '#e8445a') {
  if (!window.BodyMuscles) return
  const { BodyChart, ViewSide } = window.BodyMuscles
  const frontEl = document.getElementById(frontId)
  const backEl  = document.getElementById(backId)
  if (!frontEl || !backEl) return

  const key = `${frontId}:${backId}`
  if (!_weeklyCharts.has(key)) {
    _weeklyCharts.set(key, {
      front: new BodyChart(frontEl, { view: ViewSide.FRONT, bodyState: {}, onMuscleClick: () => {} }),
      back:  new BodyChart(backEl,  { view: ViewSide.BACK,  bodyState: {}, onMuscleClick: () => {} }),
    })
  }
  const charts = _weeklyCharts.get(key)
  const frontState = {}
  const backState  = {}
  Object.entries(muscleHitMap).forEach(([muscle, count]) => {
    const map = MUSCLE_MAP[muscle.toLowerCase()]
    if (!map) return
    const intensity = count > 0 ? Math.min(9, 4 + count * 2) : 0
    map.f.forEach(id => { frontState[id] = { intensity, selected: true } })
    map.b.forEach(id => { backState[id]  = { intensity, selected: true } })
  })
  charts.front.update({ bodyState: frontState })
  charts.back.update({ bodyState: backState })
  requestAnimationFrame(() => _recolorPaths([frontId, backId], color))
}
