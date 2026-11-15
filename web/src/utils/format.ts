// Small helpers for dates ("YYYY-MM-DD" strings) and prices.
// Dates are kept as strings because the API and json-server use that format,
// and "2026-11-20" < "2026-11-22" compares correctly as text.

/** Turn a Date into "YYYY-MM-DD" using the local time zone. */
export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** "YYYY-MM-DD" -> Date at local midnight (avoids UTC shifting the day). */
function parseISODate(iso: string): Date {
  return new Date(`${iso}T00:00:00`)
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function addDays(iso: string, days: number): string {
  const date = parseISODate(iso)
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

/** Number of nights between check-in and check-out (20 -> 22 Nov = 2 nights). */
export function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = parseISODate(checkOut).getTime() - parseISODate(checkIn).getTime()
  return Math.round(ms / 86_400_000)
}

/** "2026-11-20" -> "Fri 20 Nov" */
export function formatDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`
}

export function formatKhr(amount: number): string {
  return `KHR ${amount.toLocaleString('en-US')}`
}

export function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}
