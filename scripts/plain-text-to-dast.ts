/**
 * Convert plain text (CSV long descriptions) into a DatoCMS Structured Text request payload.
 * @see https://www.datocms.com/docs/structured-text/dast
 */
import { validate, type Document } from 'datocms-structured-text-utils'

/** CMA / Delivery structured text: `schema` must be the string `"dast"` (required by API). */
export type StructuredTextRequest = { schema: 'dast'; document: Document['document'] }

/**
 * Split on blank lines into paragraphs; normalize single newlines to spaces within a paragraph.
 */
export function plainTextToStructuredTextRequest(text: string): StructuredTextRequest | null {
  const t = text.trim()
  if (!t) {
    return null
  }
  const chunks = t.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  const paragraphs = chunks.length > 0 ? chunks : [t]
  const children = paragraphs.map((p) => ({
    type: 'paragraph' as const,
    children: [{ type: 'span' as const, value: p.replace(/\r?\n/g, ' ') }],
  }))
  const full: Document = {
    schema: 'dast',
    document: { type: 'root', children },
  }
  const v = validate(full)
  if (!v.valid) {
    throw new Error(v.message ?? 'Invalid structured text document')
  }
  return { schema: 'dast', document: full.document }
}
