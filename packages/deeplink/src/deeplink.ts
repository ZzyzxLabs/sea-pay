
export enum WalletType {
  COINBASE = "coinbase",
  METAMASK = "metamask",
  PHANTOM = "phantom",
}

export function buildDeeplinkUrl(
  dappUrl: string,
  walletType: WalletType = WalletType.COINBASE
): string {
  const encodedUrl = encodeURIComponent(dappUrl);

  switch (walletType) {
    case WalletType.COINBASE:
      return `cbwallet://dapp?url=${encodedUrl}`;
    case WalletType.METAMASK:
      return `https://metamask.app.link/dapp/${dappUrl}`;
    case WalletType.PHANTOM:
      // Phantom uses solana: URL scheme for Solana dapps
      // For EVM dapps, we can use a generic approach or redirect to browser
      return dappUrl; // For now, return the URL as-is (can be enhanced later)
    default:
      throw new Error(`Unsupported wallet type: ${walletType}`);
  }
}

// Legacy function for backward compatibility
export function buildCoinbaseDeeplinkUrl(cb_url: string): string {
  return buildDeeplinkUrl(cb_url, WalletType.COINBASE);
}