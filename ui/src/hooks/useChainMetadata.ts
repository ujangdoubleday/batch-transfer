import { useState, useEffect } from 'react';

import type { ChainMetadata } from '../types';

const CHAIN_DATA_URL = 'https://chainlist.org/rpcs.json';

export function useChainMetadata(chainId: number | undefined) {
    const [metadata, setMetadata] = useState<ChainMetadata | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!chainId) {
            setMetadata(null);
            return;
        }

        const fetchMetadata = async () => {
            setLoading(true);
            setError(null);
            try {
                // Try to get from cache first
                const cachedData = localStorage.getItem('chainMetadata');
                let chains: ChainMetadata[] = [];

                if (cachedData) {
                    chains = JSON.parse(cachedData);
                }

                // If cache is empty or old (optional: add timestamp check), fetch fresh data
                // For now, we fetch if we don't have the chain in our cache?
                // Actually, let's fetch once per session or if we don't have it.
                // Since the file is large, we might want to just fetch it once and cache it.
                
                if (!chains.length) {
                    const response = await fetch(CHAIN_DATA_URL);
                    if (!response.ok) {
                        throw new Error('Failed to fetch chain data');
                    }
                    chains = await response.json();
                    try {
                        localStorage.setItem('chainMetadata', JSON.stringify(chains));
                    } catch (e) {
                        console.warn('Failed to cache chain metadata', e);
                    }
                }

                const foundChain = chains.find((c) => c.chainId === chainId);
                setMetadata(foundChain || null);
            } catch (err) {
                console.error(err);
                setError('Failed to load network info');
            } finally {
                setLoading(false);
            }
        };

        fetchMetadata();
    }, [chainId]);

    return { metadata, loading, error };
}
