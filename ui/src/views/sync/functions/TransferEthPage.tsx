import { useParams } from 'react-router-dom';
import type { Address } from 'viem';
import { FunctionPage } from '../../../components/Sync/Layout/FunctionPage';
import { BatchTransferEthForm } from '../../../components/Sync/Dashboard/BatchTransferEthForm';

export function TransferEthPage() {
  const { address } = useParams<{ address: string }>();
  
  return (
    <FunctionPage title="Transfer ETH" maxWidth="max-w-7xl" isCard={false}>
        <BatchTransferEthForm contractAddress={address as Address} />
    </FunctionPage>
  );
}
