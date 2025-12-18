import type { DeployContractCardProps } from '../../types'

export function DeployContractCard({
    networkName,
    chainId,
    isDeploying,
    isConfirming,
    isConfirmed,
    deployError,
    hash,
    handleDeploy
}: DeployContractCardProps) {
    return (
        <div className="deploy-card">
            <div className="network-info">
                <span className="network-label">Target Network</span>
                <div className="network-value">
                {networkName} 
                <span className="chain-id-badge">ID: {chainId}</span>
                </div>
            </div>
            
            <div className="action-area">
                <button 
                    className="deploy-button"
                    onClick={handleDeploy} 
                    disabled={isDeploying || isConfirming}
                >
                    {(isDeploying || isConfirming) && <span className="spinner"></span>}
                    {isDeploying ? 'Deploying...' : isConfirming ? 'Confirming...' : 'Deploy Contract'}
                </button>
            </div>

            {deployError && (
                <div className="error-message">
                    <p className="error-title">Deployment Failed</p>
                    <p>{deployError.message}</p>
                </div>
            )}

            {hash && (
                <div className="transaction-hash">
                    <p className="hash-label">Transaction Hash</p>
                    <p className="hash-value">{hash}</p>
                </div>
            )}

            {isConfirmed && (
                <div className="success-message">
                    <p>Contract deployed successfully!</p>
                </div>
            )}
        </div>
    )
}
