// config.js — load and cache config/tracker.yaml
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'

const DEFAULT_CONFIG = join(fileURLToPath(import.meta.url), '..', '..', '..', 'config')
const CONFIG_DIR = process.env.CONFIG_DIR ?? DEFAULT_CONFIG
let cached = null

export async function readConfig() {
  if (cached) return cached
  const raw = await readFile(join(CONFIG_DIR, 'tracker.yaml'), 'utf8')
  cached = yaml.load(raw)
  return cached
}
