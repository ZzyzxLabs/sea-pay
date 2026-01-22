
export enum WalletType {
  COINBASE = "coinbase",
  METAMASK = "metamask",
  PHANTOM = "phantom",
}

export function buildDeeplinkUrl(
  dappUrl: string,
  walletType: WalletType = WalletType.COINBASE,
  ref: string = ""
): string {
  const encodedUrl = encodeURIComponent(dappUrl);
  const encodedRef = encodeURIComponent(ref);
  switch (walletType) {
    case WalletType.COINBASE:
      return `cbwallet://dapp?url=${encodedUrl}`;
    case WalletType.METAMASK:
      return `https://metamask.app.link/dapp/${dappUrl}`;
    case WalletType.PHANTOM:
      return `https://phantom.app/ul/browse/${encodedUrl}?ref=${encodedRef}`;
    default:
      throw new Error(`Unsupported wallet type: ${walletType}`);
  }
}

// Legacy function for backward compatibility
export function buildCoinbaseDeeplinkUrl(cb_url: string): string {
  return buildDeeplinkUrl(cb_url, WalletType.COINBASE);
}