import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import type { Deployment } from '../types'

const STORAGE_KEY = 'batch_transfer_deployments_v2'

export function useDeployments() {
  const { address, chainId } = useAccount()
  const [deployments, setDeployments] = useState<Deployment[]>([])

  // Load deployments
  useEffect(() => {
    if (!chainId || !address) {
      setDeployments([])
      return
    }

    try {
      const storedData = localStorage.getItem(STORAGE_KEY)
      if (storedData) {
        const allDeployments = JSON.parse(storedData)
        const chainDeployments = allDeployments[chainId]
        if (chainDeployments && chainDeployments[address]) {
            if (Array.isArray(chainDeployments[address])) {
                setDeployments(chainDeployments[address])
            } else {
                setDeployments([])
            }
            return
        }
      }
    } catch (e) {
      console.error('Failed to load deployments from local storage:', e)
    }
    setDeployments([])
  }, [chainId, address])

  const addDeployment = useCallback((deployment: Deployment) => {
    if (!chainId || !address) return false

    try {
        const storedData = localStorage.getItem(STORAGE_KEY)
        const allDeployments = storedData ? JSON.parse(storedData) : {}
        
        if (!allDeployments[chainId]) {
            allDeployments[chainId] = {}
        }

        if (!allDeployments[chainId][address]) {
            allDeployments[chainId][address] = []
        }
        
        const currentList = allDeployments[chainId][address]
        const exists = currentList.some((d: Deployment) => d.address.toLowerCase() === deployment.address.toLowerCase())
        
        if (!exists) {
            allDeployments[chainId][address] = [deployment, ...currentList]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allDeployments))
            setDeployments(prev => [deployment, ...prev])
            return true
        }
        return false // Already exists
    } catch (e) {
        console.error('Failed to save deployment to local storage:', e)
        return false
    }
  }, [chainId, address])

  const removeDeployment = useCallback((deploymentAddress: string) => {
    if (!chainId || !address) return

    try {
        const storedData = localStorage.getItem(STORAGE_KEY)
        if (!storedData) return

        const allDeployments = JSON.parse(storedData)
        if (allDeployments[chainId] && allDeployments[chainId][address]) {
            const currentList = allDeployments[chainId][address]
            const newList = currentList.filter((d: Deployment) => d.address.toLowerCase() !== deploymentAddress.toLowerCase())
            
            allDeployments[chainId][address] = newList
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allDeployments))
            setDeployments(newList)
        }
    } catch (e) {
        console.error('Failed to remove deployment from local storage:', e)
    }
  }, [chainId, address])

  return {
    deployments,
    addDeployment,
    removeDeployment
  }
}
