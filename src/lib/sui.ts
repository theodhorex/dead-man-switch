export async function getLastActivityTimestamp(address: string): Promise<number | null> {
  try {
    const res = await fetch('https://fullnode.mainnet.sui.io:443', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_queryTransactionBlocks',
        params: [
          { filter: { FromAddress: address } },
          null,
          1,
          true
        ],
      }),
    });

    const data = await res.json();
    const txs = data?.result?.data;

    if (!txs || txs.length === 0) return null;

    const digest = txs[0].digest;

    const res2 = await fetch('https://fullnode.mainnet.sui.io:443', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'sui_getTransactionBlock',
        params: [digest, { showInput: false }],
      }),
    });

    const data2 = await res2.json();
    const ts = data2?.result?.timestampMs;
    return ts ? parseInt(ts) : null;
  } catch (e) {
    console.error('Sui fetch error:', e);
    return null;
  }
}