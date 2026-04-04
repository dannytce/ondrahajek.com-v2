/**
 * Resolve Dato admin UI links for a portfolio record via GraphQL `_editingUrl`.
 * CMA uses URL-safe record ids; the admin URL path uses a numeric segment (`.../items/8871261/edit`).
 *
 * GraphQL requires a token with **Content Delivery API** access (`can_access_cda`).
 * CMA-only tokens often lack this — set `DATOCMS_GRAPHQL_TOKEN` to a read-only token with CDA,
 * or enable CDA on your existing token in Dato (Settings → API tokens).
 */

const GRAPHQL_ENDPOINT = 'https://graphql.datocms.com/'

export type PortfolioEditingHints = {
  /** Full admin URL from GraphQL, when available */
  editingUrl: string | null
  /** Numeric segment from `/items/{id}/edit` in the admin, if parseable */
  adminNumericId: string | null
}

export type PortfolioEditingFetchResult = PortfolioEditingHints & {
  /** GraphQL `errors[].message` entries (auth, wrong environment, etc.) */
  graphqlErrors: string[]
  httpStatus: number
  /** HTTP 200, no GraphQL errors, but `portfolio` was null (wrong env / id?) */
  portfolioWasNull: boolean
}

/** Extract `8871261` from `.../items/8871261/edit`. */
export function adminNumericIdFromEditingUrl(url: string | null): string | null {
  if (!url) {
    return null
  }
  const m = /\/items\/(\d+)\/edit/.exec(url)
  return m?.[1] ?? null
}

function graphqlErrorMessages(body: unknown): string[] {
  const j = body as { errors?: Array<{ message?: string }> }
  if (!Array.isArray(j?.errors)) {
    return []
  }
  return j.errors
    .map((e) => (typeof e?.message === 'string' ? e.message : null))
    .filter((m): m is string => Boolean(m))
}

export type FetchEditingHintsOptions = {
  /** Same as CMA `buildClient({ environment })` — required if not using primary env */
  environment?: string
}

/**
 * Fetch `_editingUrl` for a portfolio by CMA record id.
 * Prefer a token with Content Delivery API (read) permission.
 */
export async function fetchPortfolioEditingHints(
  apiToken: string,
  itemId: string,
  options?: FetchEditingHintsOptions
): Promise<PortfolioEditingFetchResult> {
  const query = `
    query PortfolioEditingUrl($id: ItemId!) {
      portfolio(filter: { id: { eq: $id } }) {
        _editingUrl
      }
    }
  `
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiToken}`,
    'Content-Type': 'application/json',
  }
  const env = options?.environment?.trim()
  if (env) {
    headers['X-Environment'] = env
  }

  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables: { id: itemId } }),
    })
    const httpStatus = res.status
    const json = (await res.json()) as {
      data?: { portfolio?: { _editingUrl?: string | null } | null }
      errors?: Array<{ message?: string }>
    }
    const graphqlErrors = graphqlErrorMessages(json)
    const portfolio = json.data?.portfolio
    const portfolioWasNull =
      res.ok && graphqlErrors.length === 0 && portfolio === null

    if (!res.ok) {
      return {
        editingUrl: null,
        adminNumericId: null,
        graphqlErrors: graphqlErrors.length
          ? graphqlErrors
          : [`HTTP ${httpStatus}`],
        httpStatus,
        portfolioWasNull: false,
      }
    }
    if (graphqlErrors.length) {
      return {
        editingUrl: null,
        adminNumericId: null,
        graphqlErrors,
        httpStatus,
        portfolioWasNull: false,
      }
    }
    const editingUrl = portfolio?._editingUrl ?? null
    return {
      editingUrl,
      adminNumericId: adminNumericIdFromEditingUrl(editingUrl),
      graphqlErrors: [],
      httpStatus,
      portfolioWasNull,
    }
  } catch (e) {
    return {
      editingUrl: null,
      adminNumericId: null,
      graphqlErrors: [
        e instanceof Error ? e.message : 'Network error calling GraphQL',
      ],
      httpStatus: 0,
      portfolioWasNull: false,
    }
  }
}

/**
 * Pick the best token for GraphQL Content Delivery API (has CDA permission).
 * Order: dedicated GraphQL token → CDA-only env → shared API token → CMA fallback.
 */
export function resolveGraphqlContentToken(cmaFallback: string): string {
  return (
    process.env.DATOCMS_GRAPHQL_TOKEN?.trim() ||
    process.env.DATOCMS_CDA_TOKEN?.trim() ||
    process.env.DATOCMS_API_TOKEN?.trim() ||
    cmaFallback
  )
}

export function resolveDatocmsEnvironment(): string | undefined {
  return (
    process.env.DATOCMS_ENVIRONMENT?.trim() ||
    process.env.DATOCMS_CMA_ENVIRONMENT?.trim() ||
    undefined
  )
}
