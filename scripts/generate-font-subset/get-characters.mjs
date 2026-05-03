/**
 * Collects characters used per font bucket from the Astro build (dist) and
 * from source when dist is missing. Output: unique_chars.json for the Python subsetter.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { load } from 'cheerio'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '..', '..')
const outJson = join(__dirname, 'unique_chars.json')
const distDir = join(repoRoot, 'dist')
const i18nPath = join(repoRoot, 'src', 'i18n', 'index.ts')

const ASCII_PRINTABLE = [...Array(95)]
  .map((_, i) => String.fromCharCode(32 + i))
  .join('')
const EXTRA = '\u00A0\u2013\u2014\u2018\u2019\u201C\u201D\u2026'
/** Full Czech alphabet for Anton subset (belt-and-suspenders vs partial dist). */
const CZECH_LETTERS = 'áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ'

function walkHtmlFiles(dir, acc = []) {
  let names
  try {
    names = readdirSync(dir)
  } catch {
    return acc
  }
  for (const name of names) {
    const p = join(dir, name)
    const st = statSync(p, { throwIfNoEntry: false })
    if (!st) continue
    if (st.isDirectory()) walkHtmlFiles(p, acc)
    else if (name.endsWith('.html')) acc.push(p)
  }
  return acc
}

function addChars(set, str) {
  if (!str) return
  for (const ch of str) {
    if (ch === '\n' || ch === '\r' || ch === '\t') continue
    set.add(ch)
  }
}

/**
 * Anton headlines use `text-transform: uppercase` (Tailwind), so the browser needs
 * uppercase glyphs (Ě, Č, …) even when the DOM only contains lowercase Czech text.
 */
function addAntonChars(set, str) {
  if (!str) return
  for (const ch of str) {
    if (ch === '\n' || ch === '\r' || ch === '\t') continue
    set.add(ch)
  }
  for (const ch of str.toUpperCase()) {
    if (ch === '\n' || ch === '\r' || ch === '\t') continue
    set.add(ch)
  }
}

function extractTranslationStringsFromI18n() {
  const raw = readFileSync(i18nPath, 'utf8')
  /** Strings inside single-quoted TS string literals (good enough for our i18n file). */
  const out = []
  let i = 0
  while (i < raw.length) {
    const q = raw.indexOf("'", i)
    if (q === -1) break
    let j = q + 1
    let buf = ''
    while (j < raw.length) {
      const c = raw[j]
      if (c === '\\') {
        j += 2
        continue
      }
      if (c === "'") break
      buf += c
      j++
    }
    if (buf.length > 1 && /[a-zA-Záčďéěíňóřšťúůýž]/i.test(buf)) {
      out.push(buf)
    }
    i = j + 1
  }
  return out.join('\n')
}

function extractVisibleTextFromAstroSource() {
  const roots = [join(repoRoot, 'src', 'components'), join(repoRoot, 'src', 'pages')]
  const chunks = []

  function walk(dir) {
    let names
    try {
      names = readdirSync(dir)
    } catch {
      return
    }
    for (const name of names) {
      const p = join(dir, name)
      const st = statSync(p, { throwIfNoEntry: false })
      if (!st) continue
      if (st.isDirectory()) walk(p)
      else if (name.endsWith('.astro')) {
        let s = readFileSync(p, 'utf8')
        s = s.replace(/<script\b[\s\S]*?<\/script>/gi, '')
        s = s.replace(/<style\b[\s\S]*?<\/style>/gi, '')
        s = s.replace(/\{[^}]+\}/g, ' ')
        const re = />([^<>]{0,800})</g
        let m
        while ((m = re.exec(s))) {
          const t = m[1].trim()
          if (t && !t.startsWith('!--')) chunks.push(t)
        }
      }
    }
  }
  for (const r of roots) walk(r)
  return chunks.join('\n')
}

function collectFromHtml(htmlPaths) {
  const anton = new Set()
  const inter = new Set()
  const geist = new Set()
  const teko = new Set()

  for (const p of htmlPaths) {
    const html = readFileSync(p, 'utf8')
    const $ = load(html)

    const addFromSelector = (sel, set) => {
      $(sel).each((_, el) => {
        addChars(set, $(el).text())
      })
    }

    $('.font-anton').each((_, el) => {
      addAntonChars(anton, $(el).text())
    })
    addFromSelector('.font-inter', inter)
    addFromSelector('.font-geist', geist)
    addFromSelector('.font-teko', teko)

    const body = $('body').text()
    addChars(inter, body)
  }

  return { anton, inter, geist, teko }
}

function seedBasics(sets) {
  const seed = ASCII_PRINTABLE + EXTRA
  for (const s of Object.values(sets)) addChars(s, seed)
  addChars(sets.anton, CZECH_LETTERS)
}

function toSortedArray(set) {
  return [...set].sort((a, b) => a.codePointAt(0) - b.codePointAt(0))
}

function main() {
  const htmlPaths = walkHtmlFiles(distDir)
  const sets =
    htmlPaths.length > 0
      ? collectFromHtml(htmlPaths)
      : {
          anton: new Set(),
          inter: new Set(),
          geist: new Set(),
          teko: new Set(),
        }

  if (htmlPaths.length === 0) {
    console.warn(
      'No HTML under dist/. Using src/i18n + .astro text only (run `pnpm build` before generate:fonts for full coverage).',
    )
    addChars(sets.inter, extractTranslationStringsFromI18n())
    addAntonChars(sets.anton, extractTranslationStringsFromI18n())
    addChars(sets.inter, extractVisibleTextFromAstroSource())
    addAntonChars(sets.anton, extractVisibleTextFromAstroSource())
  }

  seedBasics(sets)

  const payload = {
    anton: toSortedArray(sets.anton),
    inter: toSortedArray(sets.inter),
    geist_mono: toSortedArray(sets.geist),
    teko: toSortedArray(sets.teko),
  }

  writeFileSync(outJson, JSON.stringify(payload, null, 0), 'utf8')
  console.log(`Wrote ${relative(repoRoot, outJson)}`)
  console.log(
    `Counts — anton: ${payload.anton.length}, inter: ${payload.inter.length}, geist_mono: ${payload.geist_mono.length}, teko: ${payload.teko.length}`,
  )
}

main()
