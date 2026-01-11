import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, WagmiProvider, createConfig } from 'wagmi'
import { mainnet, baseSepolia } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'