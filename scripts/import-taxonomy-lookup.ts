/**
 * Case-insensitive taxonomy lookup for portfolio_category / portfolio_subcategory.
 * Dato `name` eq filter is exact; CSV often differs in casing ("Video production" vs "Video Production").
 */

import fs from 'node:fs'
import path from 'node:path'
import type { buildClient } from '@datocms/cma-client-node'

type Client = ReturnType<typeof buildClient>

export type TaxonomyAliases = {
  portfolio_category?: Record<string, string>
  portfolio_subcategory?: Record<string, string>
}

/**
 * Canonical key for taxonomy matching: trim, lowercase, collapse spaces,
 * and treat hyphens/underscores like spaces so "Real Estate" matches Dato "real-estate".
 */
export function normalizeTaxonomyLabel(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractLocalizedName(raw: unknown): string {
  if (typeof raw === 'string') {
    return raw.trim()
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>
    for (const k of ['cs', 'en', 'default']) {
      const v = o[k]
      if (typeof v === 'string' && v.trim()) {
        return v.trim()
      }
    }
    for (const v of Object.values(o)) {
      if (typeof v === 'string' && v.trim()) {
        return v.trim()
      }
    }
  }
  return ''
}

/** Display name for a taxonomy item (used by import and portfolio CSV export). */
export function taxonomyItemDisplayName(item: Record<string, unknown>): string {
  const top = item.name
  const attrs = item.attributes as Record<string, unknown> | undefined
  const fromAttrs = attrs?.name
  return extractLocalizedName(top) || extractLocalizedName(fromAttrs)
}

export async function fetchAllItemsOfType(
  client: Client,
  modelApiKey: string
): Promise<Record<string, unknown>[]> {
  const out: Record<string, unknown>[] = []
  const limit = 100
  let offset = 0
  for (;;) {
    const batch = await client.items.list({
      filter: { type: modelApiKey },
      page: { offset, limit },
    })
    if (!batch?.length) {
      break
    }
    out.push(...(batch as Record<string, unknown>[]))
    if (batch.length < limit) {
      break
    }
    offset += limit
  }
  return out
}

/** normalized label → Dato item id */
export type TaxonomyMaps = {
  category: Map<string, string>
  subcategory: Map<string, string>
}

export function loadTaxonomyAliasesFromDisk(): TaxonomyAliases {
  const p = path.join(process.cwd(), 'data/portfolio-taxonomy-aliases.json')
  if (!fs.existsSync(p)) {
    return {}
  }
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8')) as TaxonomyAliases
  } catch {
    return {}
  }
}

function normalizeAliasKeys(
  raw: Record<string, string> | undefined
): Record<string, string> {
  if (!raw) {
    return {}
  }
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(raw)) {
    out[normalizeTaxonomyLabel(k)] = v.trim()
  }
  return out
}

export async function buildTaxonomyMaps(client: Client): Promise<TaxonomyMaps> {
  const [catItems, subItems] = await Promise.all([
    fetchAllItemsOfType(client, 'portfolio_category'),
    fetchAllItemsOfType(client, 'portfolio_subcategory'),
  ])

  function toMap(items: Record<string, unknown>[]): Map<string, string> {
    const m = new Map<string, string>()
    for (const item of items) {
      const name = taxonomyItemDisplayName(item)
      if (!name) {
        continue
      }
      const key = normalizeTaxonomyLabel(name)
      const id = item.id as string
      if (m.has(key) && m.get(key) !== id) {
        console.warn(
          `Taxonomy: duplicate normalized name "${key}" — keeping first id, also saw ${id} (${name})`
        )
        continue
      }
      m.set(key, id)
    }
    return m
  }

  return {
    category: toMap(catItems),
    subcategory: toMap(subItems),
  }
}

/** Dato item id → display name (for CSV export). */
export async function buildTaxonomyIdToNameMaps(client: Client): Promise<{
  category: Map<string, string>
  subcategory: Map<string, string>
}> {
  const [catItems, subItems] = await Promise.all([
    fetchAllItemsOfType(client, 'portfolio_category'),
    fetchAllItemsOfType(client, 'portfolio_subcategory'),
  ])

  function toIdMap(items: Record<string, unknown>[]): Map<string, string> {
    const m = new Map<string, string>()
    for (const item of items) {
      const id = item.id as string
      const name = taxonomyItemDisplayName(item)
      if (id && name) {
        m.set(id, name)
      }
    }
    return m
  }

  return {
    category: toIdMap(catItems),
    subcategory: toIdMap(subItems),
  }
}

export function resolveTaxonomyId(
  maps: TaxonomyMaps,
  modelApiKey: 'portfolio_category' | 'portfolio_subcategory',
  csvValue: string,
  aliases: TaxonomyAliases
): string | null {
  const trimmed = csvValue.trim()
  if (!trimmed) {
    return null
  }

  const aliasTable =
    modelApiKey === 'portfolio_category'
      ? normalizeAliasKeys(aliases.portfolio_category)
      : normalizeAliasKeys(aliases.portfolio_subcategory)

  const nk = normalizeTaxonomyLabel(trimmed)
  const afterAlias = aliasTable[nk] ?? trimmed
  const lookupKey = normalizeTaxonomyLabel(afterAlias)

  const map =
    modelApiKey === 'portfolio_category' ? maps.category : maps.subcategory
  return map.get(lookupKey) ?? null
}
