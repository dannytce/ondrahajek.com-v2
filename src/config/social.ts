import type { TranslationKey } from '~/i18n'

type FooterSocialKey = Extract<TranslationKey, `footer.social.${string}`>

/**
 * Canonical social-profile destinations for the site.
 *
 * Centralizing these URLs keeps every consumer (footer, mobile menu,
 * future JSON-LD `sameAs` blocks, etc.) in lockstep and keeps
 * social link rendering DRY where labels are translation driven.
 */
export const SOCIAL_LINKS_MAP = {
  instagram: 'https://www.instagram.com/ondra_hajek',
  vimeo: 'https://vimeo.com/user51795894',
} as const satisfies Record<string, `https://${string}`>

export type SocialKey = keyof typeof SOCIAL_LINKS_MAP

export interface SocialLinkItem {
  id: SocialKey
  href: (typeof SOCIAL_LINKS_MAP)[SocialKey]
  labelKey: FooterSocialKey
}

export const SOCIAL_LINKS: readonly SocialLinkItem[] = [
  {
    id: 'instagram',
    href: SOCIAL_LINKS_MAP.instagram,
    labelKey: 'footer.social.instagram',
  },
  {
    id: 'vimeo',
    href: SOCIAL_LINKS_MAP.vimeo,
    labelKey: 'footer.social.vimeo',
  },
] as const
