import { useDeploy } from '../hooks/useDeploy'

export function Deploy() {
  const { 
    isConnected, 
    chainId, 
    networkName, 
    balance, 
    isBalanceLoading, 
    handleDeploy, 
    isDeploying, 
    isConfirming, 
    isConfirmed, 
    deployError, 
    hash 
  } = useDeploy()

  return (
    <div className="deploy-page" style={{ padding: '0 2rem 2rem', maxWidth: '600px', margin: '0', textAlign: 'left' }}>
      <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          marginBottom: '2rem',
          color: '#fff',
          marginTop: '0'
      }}>
        Deploy Batch Transfer Contract
      </h2>
      
      {!isConnected ? (
        <div className="alert-message">
          Please connect your wallet to deploy the contract.
        </div>
      ) : (
        <div className="deploy-container">
            <div style={{ marginBottom: '30px', color: '#a1a1aa', fontSize: '0.95rem' }}>
                <div>
                    <span style={{ marginRight: '10px', color: '#71717a' }}>Network:</span>
                    <span style={{ color: '#e4e4e7', fontWeight: '500' }}>{networkName} <span style={{ opacity: 0.5, marginLeft: '4px' }}>(ID: {chainId})</span></span>
                </div>
            </div>
            
            <div style={{ marginTop: '20px' }}>
                <button 
                    onClick={handleDeploy} 
                    disabled={!balance || isBalanceLoading || isDeploying || isConfirming}
                    style={{
                        padding: '10px 24px',
                        fontSize: '14px',
                        fontWeight: '500',
                        backgroundColor: '#FFFFFF',
                        color: '#000000',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: (!balance || isBalanceLoading || isDeploying || isConfirming) ? 'not-allowed' : 'pointer',
                        opacity: (!balance || isBalanceLoading || isDeploying || isConfirming) ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'opacity 0.2s',
                        height: '40px'
                    }}
                >
                    {(isDeploying || isConfirming) && <span className="spinner"></span>}
                    {isDeploying ? 'Deploying...' : isConfirming ? 'Confirming...' : 'Deploy Contract'}
                </button>
            </div>

            {deployError && (
                <div style={{ marginTop: '20px', color: '#ef4444', fontSize: '0.9rem', maxWidth: '500px' }}>
                    <p style={{ fontWeight: '500' }}>Deployment Failed</p>
                    <p style={{ marginTop: '4px', opacity: 0.9 }}>{deployError.message}</p>
                </div>
            )}

            {hash && (
                <div style={{ marginTop: '20px', wordBreak: 'break-all', maxWidth: '500px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '8px' }}>Transaction Hash</h3>
                    <p style={{ fontFamily: 'monospace', color: '#9ca3af', fontSize: '0.9rem' }}>{hash}</p>
                </div>
            )}

            {isConfirmed && (
                <div style={{ marginTop: '20px', color: '#10b981' }}>
                    <p>Contract deployed successfully.</p>
                </div>
            )}
        </div>
      )}
    </div>
  )
}
