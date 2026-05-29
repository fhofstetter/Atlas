#!/usr/bin/env node
/**
 * Syncs the free-exercise-db exercise library to data/health/exercise-library.json.
 *
 * Source: https://github.com/yuhonas/free-exercise-db (CC0 public domain)
 * Run: node tools/scripts/sync-exercises.js
 * Schedule: manually or monthly cron — do NOT call at runtime.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SOURCE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
const OUT_FILE   = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../data/health/exercise-library.json')

// free-exercise-db names → body-highlighter slot names
const MUSCLE_MAP = {
  'abdominals':   'abs',
  'adductors':    'adductor',
  'forearms':     'forearm',
  'glutes':       'gluteal',
  'hamstrings':   'hamstring',
  'lats':         'upper-back',
  'lower back':   'lower-back',
  'middle back':  'upper-back',
  'shoulders':    'front-deltoids',
  'traps':        'trapezius',
}

function mapMuscle(name) {
  return MUSCLE_MAP[name.toLowerCase()] ?? name.toLowerCase()
}

async function main() {
  console.log('Fetching exercise database...')
  const res = await fetch(SOURCE_URL)
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${SOURCE_URL}`)
  const raw = await res.json()
  console.log(`Fetched ${raw.length} exercises`)

  const exercises = raw.map(e => ({
    id:               e.id,
    name:             e.name,
    category:         e.category ?? null,
    equipment:        e.equipment ?? null,
    level:            e.level ?? null,
    force:            e.force ?? null,
    mechanic:         e.mechanic ?? null,
    muscles:          (e.primaryMuscles   || []).map(mapMuscle),
    muscles_secondary:(e.secondaryMuscles || []).map(mapMuscle),
    instructions:     e.instructions ?? [],
  }))

  const output = {
    _source:    'yuhonas/free-exercise-db (CC0 public domain)',
    _synced:    new Date().toISOString().slice(0, 10),
    _count:     exercises.length,
    exercises,
  }

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true })
  await fs.writeFile(OUT_FILE, JSON.stringify(output, null, 2))
  console.log(`Saved ${exercises.length} exercises to ${OUT_FILE}`)
}

main().catch(err => { console.error(err); process.exit(1) })
