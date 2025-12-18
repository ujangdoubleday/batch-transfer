import type { DeploymentListProps } from '../../types'
import { ExistingDeployment } from './ExistingDeployment'

export function DeploymentList({ deployments, title = "Previous Deployments" }: DeploymentListProps & { title?: string }) {
    if (deployments.length === 0) return null

    return (
        <div className="w-full">
            <h3 className="text-lg font-semibold mb-4 text-zinc-400">{title}</h3>
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
            {deployments.map((dep, index) => (
                <ExistingDeployment 
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
