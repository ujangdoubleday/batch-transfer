import { useParams } from 'react-router-dom';
import type { Address } from 'viem';
import { FunctionPage } from '../../../components/Sync/Layout/FunctionPage';
import { AdminControls } from '../../../components/Sync/Dashboard/AdminControls';
import { useBatchTransfer } from '../../../hooks/useBatchTransfer';

export function AdminPage() {
  const { address } = useParams<{ address: string }>();
  const contractAddress = address as Address;
  
  const { useContractRead } = useBatchTransfer(contractAddress);
  
  const { data: owner, refetch: refetchOwner } = useContractRead('owner');
  const { data: maxRecipients, refetch: refetchMax } = useContractRead('maxRecipients');
  const { data: paused, refetch: refetchPaused } = useContractRead('paused');

  const refetchAll = () => {
    refetchOwner();
    refetchMax();
    refetchPaused();
  };
  
  return (
    <FunctionPage title="Admin Controls">
        <AdminControls 
            contractAddress={contractAddress} 
            paused={!!paused} 
            owner={owner as string} 
            maxRecipients={maxRecipients as bigint}
            refetch={refetchAll}
        />
    </FunctionPage>
  );
}
