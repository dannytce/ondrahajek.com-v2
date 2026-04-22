/**
 * Canonical social-profile destinations for the site.
 *
 * Centralizing these URLs keeps every consumer (footer, mobile menu,
 * future JSON-LD `sameAs` blocks, etc.) in lockstep and makes the
 * LinkedIn swap a one-line change once the client's profile exists.
 *
 * LinkedIn currently points at the homepage as an intentional placeholder;
 * replace it with the real profile URL when available.
 */
export const SOCIAL_LINKS = {
  linkedin: 'https://www.linkedin.com/',
  instagram: 'https://www.instagram.com/ondra_hajek',
  vimeo: 'https://vimeo.com/user51795894',
} as const satisfies Record<string, `https://${string}`>

export type SocialKey = keyof typeof SOCIAL_LINKS
