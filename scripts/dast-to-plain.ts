/**
 * Best-effort DAST → plain text for CSV export (paragraphs separated by blank lines).
 */
import {
  hasChildren,
  isBlock,
  isBlockquote,
  isCode,
  isHeading,
  isInlineBlock,
  isList,
  isListItem,
  isParagraph,
  isRoot,
  isSpan,
  isThematicBreak,
} from 'datocms-structured-text-utils'
import type { Node, Root } from 'datocms-structured-text-utils'

function inlineToPlain(node: Node): string {
  if (isSpan(node)) {
    return node.value
  }
  if (hasChildren(node)) {
    return node.children.map((c) => inlineToPlain(c as Node)).join('')
  }
  return ''
}

function blockToPlain(node: Node): string {
  if (isParagraph(node) || isHeading(node)) {
    return inlineToPlain(node)
  }
  if (isList(node)) {
    return node.children
      .map((child) => {
        if (isListItem(child)) {
          return inlineToPlain(child)
        }
        return ''
      })
      .filter(Boolean)
      .join('\n')
  }
  if (isBlockquote(node)) {
    return node.children.map((p) => blockToPlain(p as Node)).filter(Boolean).join('\n\n')
  }
  if (isCode(node)) {
    return node.code
  }
  if (isThematicBreak(node)) {
    return ''
  }
  if (isBlock(node) || isInlineBlock(node)) {
    return ''
  }
  if (hasChildren(node)) {
    return node.children.map((c) => blockToPlain(c as Node)).filter(Boolean).join('\n\n')
  }
  return ''
}

function dastRootToPlain(root: Root): string {
  const parts: string[] = []
  for (const child of root.children) {
    const t = blockToPlain(child as Node).trim()
    if (t) {
      parts.push(t)
    }
  }
  return parts.join('\n\n')
}

/** Accepts CMA structured text value, `{ schema, document }`, or a `root` node. */
export function structuredTextValueToPlain(raw: unknown): string {
  if (raw == null || typeof raw !== 'object') {
    return ''
  }
  const o = raw as Record<string, unknown>
  let doc: unknown = o.document
  if (!doc && 'value' in o && o.value && typeof o.value === 'object') {
    const v = o.value as Record<string, unknown>
    doc = v.document ?? v
  }
  if (!doc || typeof doc !== 'object') {
    return ''
  }
  if (isRoot(doc as Node)) {
    return dastRootToPlain(doc as Root)
  }
  const maybeRoot = doc as { type?: string; children?: unknown[] }
  if (maybeRoot.type === 'root' && Array.isArray(maybeRoot.children)) {
    return dastRootToPlain(maybeRoot as Root)
  }
  return ''
}

function localeStructuredToPlain(raw: unknown, locale: 'cs' | 'en'): string {
  if (raw == null || typeof raw !== 'object') {
    return ''
  }
  const o = raw as Record<string, unknown>
  const v = o[locale] ?? o[locale.toUpperCase()]
  return structuredTextValueToPlain(v)
}

export function localizedDescriptionToPlainCsEn(description: unknown): { cs: string; en: string } {
  if (description == null) {
    return { cs: '', en: '' }
  }
  if (typeof description === 'object' && !Array.isArray(description)) {
    const o = description as Record<string, unknown>
    if ('cs' in o || 'en' in o) {
      return {
        cs: localeStructuredToPlain(description, 'cs'),
        en: localeStructuredToPlain(description, 'en'),
      }
    }
  }
  const both = structuredTextValueToPlain(description)
  return { cs: both, en: both }
}
