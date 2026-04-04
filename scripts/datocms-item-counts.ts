/**
 * Print DatoCMS item counts per model (CMA) — useful for quota / PLAN_UPGRADE_REQUIRED audits.
 *
 * Usage:
 *   pnpm datocms:item-counts
 *
 * Requires DATOCMS_MANAGEMENT_API_TOKEN (or DATOCMS_API_TOKEN with CMA access).
 * Optional: DATOCMS_ENVIRONMENT for non-primary environments.
 */

import 'dotenv/config'
import { buildClient } from '@datocms/cma-client-node'
import { fetchAllItemsOfType } from './import-taxonomy-lookup'

function resolveEnvironment(): string | undefined {
  const e = process.env.DATOCMS_ENVIRONMENT?.trim()
  return e || undefined
}

async function main() {
  const token =
    process.env.DATOCMS_MANAGEMENT_API_TOKEN?.trim() ||
    process.env.DATOCMS_API_TOKEN?.trim()
  if (!token) {
    console.error(
      'Set DATOCMS_MANAGEMENT_API_TOKEN (or DATOCMS_API_TOKEN) in .env'
    )
    process.exit(1)
  }

  const env = resolveEnvironment()
  const client = buildClient({
    apiToken: token,
    ...(env ? { environment: env } : {}),
  })

  const types = await client.itemTypes.list()
  const sorted = [...types].sort((a, b) =>
    a.api_key.localeCompare(b.api_key)
  )

  console.log(
    env ? `Environment: ${env}\n` : 'Environment: (primary)\n'
  )
  console.log('model_api_key\titems')
  let total = 0
  for (const t of sorted) {
    const items = await fetchAllItemsOfType(client, t.api_key)
    const n = items.length
    total += n
    console.log(`${t.api_key}\t${n}`)
  }
  console.log(`—\ntotal\t${total}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
