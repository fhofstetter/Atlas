// utils.js — shared helpers

export function generateId(name) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
  const ts = Date.now().toString(36)
  return `${slug}-${ts}`
}

export function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function round2(n) {
  return Math.round(n * 100) / 100
}
