export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ChainMetadata {
    name: string;
    chain: string;
    icon?: string;
    rpc: string[];
    features?: { name: string }[];
    faucets?: string[];
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    infoURL: string;
    shortName: string;
    chainId: number;
    networkId: number;
    slip44?: number;
    ens?: {
        registry: string;
    };
    explorers?: {
        name: string;
        url: string;
        standard: string;
    }[];
}

export interface WalletDropdownProps {
  address: string
  chainName?: string
  walletIcon?: string
  onDisconnect: () => void
  onClose: () => void
}
