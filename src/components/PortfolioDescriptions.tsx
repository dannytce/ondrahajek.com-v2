import { useState } from 'react'
import { StructuredText } from 'react-datocms/structured-text'
import type { CdaStructuredTextValue } from 'datocms-structured-text-utils'
import type { Locale } from '~/i18n'

type Props = {
  descriptionCs?: CdaStructuredTextValue | null
  descriptionEn?: CdaStructuredTextValue | null
  locale?: Locale
}

export function PortfolioDescriptions({ descriptionCs, descriptionEn, locale = 'en' }: Props) {
  const hasCs = descriptionCs?.value != null
  const hasEn = descriptionEn?.value != null
  if (!hasCs && !hasEn) return null

  const primary = locale === 'cs' ? { data: descriptionCs, label: 'Čeština', has: hasCs } : { data: descriptionEn, label: 'English', has: hasEn }
  const secondary = locale === 'cs' ? { data: descriptionEn, label: 'English', has: hasEn } : { data: descriptionCs, label: 'Čeština', has: hasCs }

  const [showSecondary, setShowSecondary] = useState(false)

  return (
    <div className="mt-10 max-w-[840px] text-white/90 font-sans text-[1.05rem] leading-relaxed space-y-8">
      {primary.has && primary.data && (
        <section>
          <div className="[&_a]:text-secondary [&_a]:underline [&_p]:mb-3">
            <StructuredText data={primary.data} />
          </div>
        </section>
      )}
      {secondary.has && secondary.data && (
        <section>
          <button
            onClick={() => setShowSecondary((v) => !v)}
            className="text-secondary font-teko text-[1.5rem] uppercase tracking-wide cursor-pointer bg-transparent border-none hover:text-white transition-colors"
          >
            {showSecondary ? `▾ ${secondary.label}` : `▸ ${secondary.label}`}
          </button>
          {showSecondary && (
            <div className="[&_a]:text-secondary [&_a]:underline [&_p]:mb-3 mt-3">
              <StructuredText data={secondary.data} />
            </div>
          )}
        </section>
      )}
    </div>
  )
}
