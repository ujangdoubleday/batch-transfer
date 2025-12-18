import { usePublicClient } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import type { Address } from 'viem'

export function useVerifyBytecode(address: string | undefined, expectedBytecode: string) {
  const publicClient = usePublicClient()

  const { data: isValid, isLoading, error } = useQuery({
    queryKey: ['verifyBytecode', address, expectedBytecode, publicClient?.chain.id],
    queryFn: async () => {
      if (!address || !expectedBytecode || !publicClient) {
        return null
      }

      try {
        const code = await publicClient.getBytecode({ address: address as Address })
        
        if (!code) {
           return false
        }
        
        // Simple case-insensitive comparison
        return code.toLowerCase() === expectedBytecode.toLowerCase()
      } catch (err) {
        console.error("Error verifying bytecode:", err)
        throw err instanceof Error ? err : new Error('Failed to verify bytecode')
      }
    },
    enabled: !!address && !!expectedBytecode && !!publicClient,
    staleTime: 1000 * 60 * 5, // Cache result for 5 minutes
    retry: 1
  })

  return { isValid: isValid ?? null, isLoading, error }
}
