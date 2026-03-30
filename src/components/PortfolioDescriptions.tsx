import { StructuredText } from 'react-datocms/structured-text'
import type { CdaStructuredTextValue } from 'datocms-structured-text-utils'

type Props = {
  descriptionCs?: CdaStructuredTextValue | null
  descriptionEn?: CdaStructuredTextValue | null
}

export function PortfolioDescriptions({ descriptionCs, descriptionEn }: Props) {
  const hasCs = descriptionCs?.value != null
  const hasEn = descriptionEn?.value != null
  if (!hasCs && !hasEn) {
    return null
  }

  return (
    <div className="mt-10 max-w-[840px] text-white/90 font-sans text-[1.05rem] leading-relaxed space-y-10">
      {hasCs && descriptionCs && (
        <section>
          <h3 className="text-secondary font-teko text-[1.5rem] uppercase tracking-wide mb-3">Čeština</h3>
          <div className="[&_a]:text-secondary [&_a]:underline [&_p]:mb-3">
            <StructuredText data={descriptionCs} />
          </div>
        </section>
      )}
      {hasEn && descriptionEn && (
        <section>
          <h3 className="text-secondary font-teko text-[1.5rem] uppercase tracking-wide mb-3">English</h3>
          <div className="[&_a]:text-secondary [&_a]:underline [&_p]:mb-3">
            <StructuredText data={descriptionEn} />
          </div>
        </section>
      )}
    </div>
  )
}
