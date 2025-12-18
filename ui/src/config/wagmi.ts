import { http, createConfig } from 'wagmi'
import * as chainDefs from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { type Chain } from 'wagmi/chains'

const chains = Object.values(chainDefs) as unknown as [Chain, ...Chain[]]

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
