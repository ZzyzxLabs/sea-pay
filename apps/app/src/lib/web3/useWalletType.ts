import { useMemo } from "react";
import { useAccount, useChainId, useCapabilities } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { type Address, getAddress } from "viem";
import { usePublicClient } from "wagmi";

export type WalletType = "eoa" | "smart-wallet" | "unknown";

interface WalletTypeResult {
  walletType: WalletType;
  isLoading: boolean;
  /** True if capabilities API indicates smart wallet features */
  hasCapabilities: boolean;
  /** True if bytecode exists at address on current chain */
  hasBytecode: boolean;
  /** Debug info for UI display */
  debug: {
    capabilities: Record<string, unknown> | null;
    bytecode: string | null;
    connectorId: string | null;
  };
}

/**
 * Detects whether the connected wallet is an EOA or Smart Contract Wallet.
 *
 * Detection strategy (in order of reliability):
 * 1. EIP-5792 Capabilities - If wallet reports atomicBatch/paymasterService, it's a smart wallet
 * 2. Bytecode check - If code exists at address on current chain, it's a smart wallet
 * 3. Default to EOA - If neither method indicates smart wallet
 *
 * Note: For counterfactual smart wallets (not yet deployed on current chain),
 * capabilities check is the only reliable method.
 */
export function useWalletType(): WalletTypeResult {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();

  // 1. Check EIP-5792 capabilities
  // This works for wallets that support the capabilities API (e.g., Coinbase Smart Wallet)
  const {
    data: capabilities,
    isLoading: isLoadingCapabilities,
    error: capabilitiesError
  } = useCapabilities({
    account: address as Address,
    query: {
      enabled: !!address && isConnected,
      retry: false,
      staleTime: 30_000, // Cache for 30 seconds
    },
  });

  // 2. Check bytecode at address (fallback for deployed smart wallets)
  const {
    data: bytecode,
    isLoading: isLoadingBytecode
  } = useQuery({
    queryKey: ["bytecode", address, chainId],
    queryFn: async () => {
      if (!publicClient || !address) return null;
      const code = await publicClient.getCode({ address: getAddress(address) });
      return code ?? null;
    },
    enabled: !!address && isConnected && !!publicClient,
    staleTime: 60_000, // Cache for 1 minute
  });

  const result = useMemo((): WalletTypeResult => {
    const isLoading = isLoadingCapabilities || isLoadingBytecode;

    // Check capabilities for smart wallet indicators
    const chainIdHex = `0x${chainId.toString(16)}`;
    const chainCaps = (capabilities as Record<string, Record<string, { supported?: boolean }>> | undefined)?.[chainIdHex];
    const hasCapabilities = !!(
      chainCaps?.paymasterService?.supported ||
      chainCaps?.atomicBatch?.supported
    );

    // Check if bytecode exists (and is not empty "0x")
    const hasBytecode = !!bytecode && bytecode !== "0x" && bytecode.length > 2;

    // Determine wallet type
    let walletType: WalletType = "unknown";

    if (!isConnected || !address) {
      walletType = "unknown";
    } else if (isLoading) {
      walletType = "unknown";
    } else if (hasCapabilities || hasBytecode) {
      // Either capabilities indicate smart wallet OR bytecode exists
      walletType = "smart-wallet";
    } else if (capabilitiesError || capabilities !== undefined || bytecode !== undefined) {
      // We've completed checks and found no smart wallet indicators
      walletType = "eoa";
    }

    return {
      walletType,
      isLoading,
      hasCapabilities,
      hasBytecode,
      debug: {
        capabilities: capabilities as Record<string, unknown> | null ?? null,
        bytecode: bytecode ?? null,
        connectorId: connector?.id ?? null,
      },
    };
  }, [
    address,
    isConnected,
    chainId,
    capabilities,
    capabilitiesError,
    bytecode,
    isLoadingCapabilities,
    isLoadingBytecode,
    connector,
  ]);

  return result;
}
