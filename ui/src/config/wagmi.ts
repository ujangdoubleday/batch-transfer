import { http, createConfig } from 'wagmi'
import { mainnet, arbitrum, base, bsc, sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

const chains = [mainnet, arbitrum, base, bsc, sepolia] as const

export const config = createConfig({
  chains,
  connectors: [
    injected(),
  ],
  transports: chains.reduce((acc, chain) => {
    acc[chain.id] = http()
    return acc
  }, {} as Record<number, ReturnType<typeof http>>),
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
