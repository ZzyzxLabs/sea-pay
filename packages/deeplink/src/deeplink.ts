

export function buildDeeplinkUrl(cb_url: string): string {
  cb_url = encodeURIComponent(cb_url)
  return `cbwallet://dapp?url=${cb_url}`
}