import { useParams } from 'react-router-dom';
import type { Address } from 'viem';
import { FunctionPage } from '../../../components/Sync/Layout/FunctionPage';
import { BatchTransferMultiTokensForm } from '../../../components/Sync/Dashboard/BatchTransferMultiTokensForm';

export function MultiTokenTransferPage() {
  const { address } = useParams<{ address: string }>();
  
  return (
    <FunctionPage title="Multi-Token Transfer" maxWidth="max-w-7xl" isCard={false}>
        <BatchTransferMultiTokensForm contractAddress={address as Address} />
    </FunctionPage>
  );
}
