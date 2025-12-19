import { useParams } from 'react-router-dom';
import type { Address } from 'viem';
import { FunctionPage } from '../../../components/Sync/Layout/FunctionPage';
import { BatchTransferCombinedForm } from '../../../components/Sync/Dashboard/BatchTransferCombinedForm';

export function CombinedTransferPage() {
  const { address } = useParams<{ address: string }>();
  
  return (
    <FunctionPage title="Combined Transfer" maxWidth="max-w-7xl" isCard={false}>
        <BatchTransferCombinedForm contractAddress={address as Address} />
    </FunctionPage>
  );
}
