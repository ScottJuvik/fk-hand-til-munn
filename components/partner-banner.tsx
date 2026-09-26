"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"

interface PartnerBannerButton {
  label: string
  href: string
}

interface PartnerBannerProps {
  eyebrow: string
  sponsorName: string
  sponsorUrl?: string
  quote: string
  primaryButton?: PartnerBannerButton
  secondaryButton?: PartnerBannerButton
  backgroundColor?: string
  titleColor?: string
  primaryButtonColor?: string
}

export function PartnerBanner({
  eyebrow,
  sponsorName,
  sponsorUrl,
  quote,
  primaryButton,
  secondaryButton,
  backgroundColor = "#1c1c1c",
  titleColor = "#ffffff",
  primaryButtonColor = "#d40000",
}: PartnerBannerProps) {
  const [isPrimaryHovered, setIsPrimaryHovered] = useState(false)

  const titleContent = (
    <h2 className="text-6xl md:text-[90px] font-light leading-none" style={{ color: titleColor }}>
      {sponsorName}
    </h2>
  )

  return (
    <section className="w-full py-20" style={{ background: backgroundColor }}>
      <div className="max-w-6xl mx-auto px-6 md:px-16 lg:px-24">
        <div className="flex flex-col md:flex-row md:items-start gap-10 md:gap-16">
          <div className="md:w-2/5 shrink-0">
            <p className="text-[15px] font-normal text-[#999999] mb-2">{eyebrow}</p>
            {sponsorUrl ? (
              <a href={sponsorUrl} target="_blank" rel="noopener noreferrer">
                {titleContent}
              </a>
            ) : (
              titleContent
            )}
          </div>

          <div className="md:w-3/5">
            <p className="text-[19px] leading-[1.5] text-[#cccccc] max-w-md mb-6">&ldquo;{quote}&rdquo;</p>
            <div className="flex flex-wrap gap-4">
              {primaryButton && (
                <a
                  href={primaryButton.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setIsPrimaryHovered(true)}
                  onMouseLeave={() => setIsPrimaryHovered(false)}
                  className="inline-flex items-center justify-center rounded-full px-6 py-3 text-[15px] font-bold transition-colors duration-200"
                  style={{
                    background: isPrimaryHovered ? backgroundColor : primaryButtonColor,
                    color: "#ffffff",
                    border: `2px solid ${primaryButtonColor}`,
                  }}
                >
                  {primaryButton.label}
                </a>
              )}
              {secondaryButton && (
                <a
                  href={secondaryButton.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 rounded-full border border-[#999999] px-6 py-3 text-[15px] font-bold text-white"
                >
                  {secondaryButton.label}
                  <ChevronRight className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
