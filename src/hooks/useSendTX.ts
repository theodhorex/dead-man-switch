'use client';

import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { useAuth } from './useAuth';

// Hook utama untuk kirim TX ke blockchain
export function useSendTx() {
  const { isSlushConnected } = useAuth();
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const sendTx = async (tx: any) => {
    if (!isSlushConnected) {
      throw new Error('Please connect your Slush wallet to perform on-chain actions.');
    }

    const result = await signAndExecute(
      { transaction: tx },
      {
        onSuccess: (data) => console.log('TX success:', data.digest),
        onError: (err) => { throw err; },
      }
    );

    // Tunggu TX confirmed
    await suiClient.waitForTransaction({ digest: result.digest });

    // Ambil detail TX termasuk events
    const txDetail = await suiClient.getTransactionBlock({
      digest: result.digest,
      options: { showEvents: true },
    });

    return txDetail;
  };

  return { sendTx };
}