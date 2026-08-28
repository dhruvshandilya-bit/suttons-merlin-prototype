export const cn = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ')

export const money = (n: number | null | undefined, dp = 0) =>
  n === null || n === undefined || isNaN(n as number)
    ? '—'
    : (n as number).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: dp, maximumFractionDigits: dp })

export const pct = (n: number | null | undefined, dp = 1) =>
  n === null || n === undefined || isNaN(n as number) ? '—' : `${((n as number) * 100).toFixed(dp)}%`

export const shortDate = (iso?: string | null) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(+d)) return String(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** "Doolan, Mike & Tanya" -> "Doolan" */
export const surname = (s?: string | null) => (s ? String(s).split(',')[0].trim() : '')

/** Parse a Future Forecast / Ops Master cell: "Glossop 1556-25 SDG (AC) DUMPTRAILER" */
const PM_RE = /\(([A-Z]{2})\)/
const JOB_RE = /(\d{3,4}-\d{2})/
export function parseCell(raw: string) {
  const text = String(raw ?? '').trim()
  const job = text.match(JOB_RE)?.[1] ?? null
  const pm = text.match(PM_RE)?.[1] ?? null
  const name = job ? text.slice(0, text.indexOf(job)).trim() : text
  const tags: string[] = []
  for (const [re, tag] of [
    [/\bcb\b/i, 'callback'], [/\bc\/o\b/i, 'change order'], [/\bPL\b/, 'punchlist'],
    [/DUMPTRAILER/i, 'dump trailer'], [/DUMPSTER/i, 'dumpster'], [/\bDEMO\b|\bDMO\b/i, 'demo'],
    [/\bTEMP\b/i, 'temp repair'], [/\bTMR\b/i, 'tomorrow'], [/Complete/i, 'complete'],
    [/Collect/i, 'collect'], [/remeasure/i, 'remeasure'],
  ] as [RegExp, string][]) if (re.test(text)) tags.push(tag)
  const phases = (text.match(/\b(RFG|SDG|WND|DRE|DCK|DRY|PNT|GUT|ELE|ELC|PLM|MAS|FRM|INS|DMO|SCR|CAB|WRH)\b/g) ?? [])
  const unavailable = /Vacation Day|called in|cold day|SZN DNE/i.test(text)
  return { text, job, pm, name, tags, phases: [...new Set(phases)], unavailable }
}

export const PM_NAMES: Record<string, string> = {
  AS: 'Adam Shryock', BF: 'Brian Farley', AC: 'Abelardo Cortez', HV: 'Hector Ventura',
  JC: 'Jordan Chapman', JP: 'Joshua Phillips', RD: 'Richard Doering', JK: 'John Kelly',
  ZP: 'Zoe Pittman', AB: 'Ashley Bowling',
}
