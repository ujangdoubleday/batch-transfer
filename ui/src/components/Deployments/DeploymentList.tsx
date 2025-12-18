import type { DeploymentListProps } from '../../types'
import { ExistingDeploymentAlert } from './ExistingDeploymentAlert'

export function DeploymentList({ deployments }: DeploymentListProps) {
    if (deployments.length === 0) return null

    return (
        <div className="existing-deployment-column">
            <h3 className="column-title">Previous Deployments</h3>
            <div className="deployments-list">
            {deployments.map((dep, index) => (
                <ExistingDeploymentAlert 
                    key={`${dep.address}-${index}`}
                    address={dep.address} 
                    timestamp={dep.timestamp}
                    networkName={dep.networkName}
                />
            ))}
            </div>
        </div>
    )
}
