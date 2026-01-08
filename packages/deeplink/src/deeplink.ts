

export function buildDeeplinkUrl(cb_url: string): string {
  cb_url = encodeURIComponent(cb_url)
  return `https://go.cb-w.com/dapp?cb_url=${cb_url}`
}