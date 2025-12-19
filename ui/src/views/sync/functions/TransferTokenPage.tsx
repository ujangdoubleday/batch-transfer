import { useParams } from 'react-router-dom';
import type { Address } from 'viem';
import { FunctionPage } from '../../../components/Sync/Layout/FunctionPage';
import { BatchTransferTokenForm } from '../../../components/Sync/Dashboard/BatchTransferTokenForm';

export function TransferTokenPage() {
  const { address } = useParams<{ address: string }>();
  
  return (
    <FunctionPage title="Transfer Token">
        <BatchTransferTokenForm contractAddress={address as Address} />
    </FunctionPage>
  );
}
