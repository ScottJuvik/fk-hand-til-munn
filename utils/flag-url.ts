// flagsapi.com only has ISO country codes, so the UK home nations
// (GB-SCT, GB-WLS, GB-NIR) come from flagcdn.com instead.
const FLAGCDN_WIDTH = { 16: 40, 32: 80, 64: 160 } as const

export function getFlagUrl(countryCode: string, size: 16 | 32 | 64) {
  if (countryCode.startsWith("GB-")) {
    return `https://flagcdn.com/w${FLAGCDN_WIDTH[size]}/${countryCode.toLowerCase()}.png`
  }
  return `https://flagsapi.com/${countryCode}/flat/${size}.png`
}
