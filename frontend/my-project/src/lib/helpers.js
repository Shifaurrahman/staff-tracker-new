export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin2024'

export const STAFF_COLORS = [
  { bg: '#4a6cf7', light: '#eef2ff' },  // indigo
  { bg: '#27ae60', light: '#e8f8f0' },  // green
  { bg: '#e74c3c', light: '#fdecea' },  // red
  { bg: '#8e44ad', light: '#f3e8fd' },  // purple
  { bg: '#e07b2a', light: '#fff3e8' },  // orange
  { bg: '#16a085', light: '#e6f7f4' },  // teal
  { bg: '#d63384', light: '#fce4f0' },  // pink
  { bg: '#0288d1', light: '#e1f3fb' },  // sky
  { bg: '#795548', light: '#f0ebe8' },  // brown
  { bg: '#607d8b', light: '#edf1f3' },  // slate
]

export function getColor(idx) {
  return STAFF_COLORS[idx % STAFF_COLORS.length]
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(iso) {
  const d     = new Date(iso)
  const today = new Date()
  const yest  = new Date(today); yest.setDate(today.getDate() - 1)
  const days  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const mons  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const base  = `${days[d.getDay()]}, ${mons[d.getMonth()]} ${d.getDate()}`
  if (d.toDateString() === today.toDateString()) return `Today — ${base}`
  if (d.toDateString() === yest.toDateString())  return `Yesterday — ${base}`
  return base
}

export function sameDay(a, b) {
  const da = new Date(a), db = new Date(b)
  return da.toDateString() === db.toDateString()
}

export function getWeekBounds(offsetWeeks = 0) {
  const now  = new Date()
  const day  = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const mon  = new Date(now)
  mon.setDate(now.getDate() + diff + offsetWeeks * 7)
  mon.setHours(0, 0, 0, 0)
  const sun  = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  sun.setHours(23, 59, 59, 999)
  return { start: mon.toISOString(), end: sun.toISOString(), mon, sun }
}

export function formatWeekLabel({ mon, sun }) {
  const mons = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const s    = `${mons[mon.getMonth()]} ${mon.getDate()}`
  const e    = mon.getMonth() === sun.getMonth()
    ? sun.getDate().toString()
    : `${mons[sun.getMonth()]} ${sun.getDate()}`
  return `${s} – ${e}, ${sun.getFullYear()}`
}

export function todayLabel() {
  const d    = new Date()
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const mons = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${days[d.getDay()]}, ${mons[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}