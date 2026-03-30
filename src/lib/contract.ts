import { Transaction } from '@mysten/sui/transactions';

export const PACKAGE_ID = '0x2ed69dfc575e0fd3ad6f92705cc8ee5f061534c5d16a630d02892cef804bc7ec';
export const CLOCK_ID = '0x6';
export const MODULE = 'dead_mans_switch';
const TESTNET_URL = 'https://fullnode.testnet.sui.io:443';

// ── RPC helper ──────────────────────────────────────────────
async function rpc(method: string, params: unknown[]) {
  const res = await fetch(TESTNET_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

// ── Read functions ───────────────────────────────────────────
export async function getFirstCoin(address: string): Promise<string | null> {
  const result = await rpc('suix_getCoins', [address, '0x2::sui::SUI', null, 1]);
  return result?.data?.[0]?.coinObjectId ?? null;
}

export async function fetchPlayerSwitches(playerAddress: string) {
  // Query via events SwitchCreated, filter by owner
  const result = await rpc('suix_queryEvents', [
    {
      MoveEventType: `${PACKAGE_ID}::${MODULE}::SwitchCreated`,
    },
    null,
    50,
    false,
  ]);

  const events = result?.data ?? [];

  // Filter events milik player ini
  const myEvents = events.filter(
    (e: any) => e.parsedJson?.owner?.toLowerCase() === playerAddress.toLowerCase()
  );

  // Fetch tiap object by ID
  const switches = await Promise.all(
    myEvents.map(async (e: any) => {
      const switchId = e.parsedJson?.switch_id;
      if (!switchId) return null;

      const obj = await rpc('sui_getObject', [
        switchId,
        { showContent: true },
      ]);

      const fields = obj?.data?.content?.fields;
      if (!fields) return null;

      const decodeBytes = (val: any): string => {
        try {
          if (Array.isArray(val)) return new TextDecoder().decode(new Uint8Array(val));
          return val ?? '';
        } catch { return ''; }
      };

      return {
        objectId: obj.data.objectId,
        owner: fields.owner,
        beneficiary: fields.beneficiary,
        characterName: decodeBytes(fields.character_name),
        lastMessage: decodeBytes(fields.last_message),
        timerDays: Number(fields.timer_days),
        deadlineMs: Number(fields.deadline_ms),
        lastCheckinMs: Number(fields.last_checkin_ms),
        isActive: fields.is_active,
        isTriggered: fields.is_triggered,
        balanceMist: Number(fields.balance?.fields?.value ?? fields.balance ?? 0),
      };
    })
  );

  return switches.filter(Boolean);
}

// ── TX builders ──────────────────────────────────────────────
export function buildCreateSwitch({
  beneficiary, timerDays, coinObjectId, depositAmountSui, characterName, lastMessage,
}: {
  beneficiary: string; timerDays: number; coinObjectId: string;
  depositAmountSui: number; characterName: string; lastMessage: string;
}) {
  const tx = new Transaction();
  const depositMist = BigInt(Math.round(depositAmountSui * 1_000_000_000));
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE}::create_switch`,
    arguments: [
      tx.pure.address(beneficiary),
      tx.pure.u64(timerDays),
      tx.object(coinObjectId),
      tx.pure.u64(depositMist),
      tx.pure.vector('u8', Array.from(new TextEncoder().encode(characterName))),
      tx.pure.vector('u8', Array.from(new TextEncoder().encode(lastMessage))),
      tx.object(CLOCK_ID),
    ],
  });
  return tx;
}

export function buildCheckIn(switchObjectId: string) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE}::check_in`,
    arguments: [tx.object(switchObjectId), tx.object(CLOCK_ID)],
  });
  return tx;
}

export function buildWithdraw(switchObjectId: string) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE}::withdraw`,
    arguments: [tx.object(switchObjectId), tx.object(CLOCK_ID)],
  });
  return tx;
}

// Fetch semua switch aktif di seluruh blockchain
export async function fetchGlobalStats() {
  try {
    const result = await rpc('suix_queryEvents', [
      { MoveEventType: `${PACKAGE_ID}::${MODULE}::SwitchCreated` },
      null,
      50,
      false,
    ]);

    const events = result?.data ?? [];

    const switches = await Promise.all(
      events.map(async (e: any) => {
        const switchId = e.parsedJson?.switch_id;
        if (!switchId) return null;
        try {
          const obj = await rpc('sui_getObject', [switchId, { showContent: true }]);
          const fields = obj?.data?.content?.fields;
          if (!fields) return null;
          return {
            isActive: fields.is_active,
            isTriggered: fields.is_triggered,
            balanceMist: Number(fields.balance?.fields?.value ?? 0),
          };
        } catch { return null; }
      })
    );

    const valid = switches.filter(Boolean) as any[];
    const active = valid.filter(s => s.isActive && !s.isTriggered).length;
    const triggered = valid.filter(s => s.isTriggered).length;
    const totalSui = valid
      .filter(s => s.isActive && !s.isTriggered)
      .reduce((sum, s) => sum + s.balanceMist, 0) / 1_000_000_000;

    return { active, triggered, totalSui };
  } catch {
    return { active: 0, triggered: 0, totalSui: 0 };
  }
}

export function buildTrigger(switchObjectId: string) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE}::trigger_switch`,
    arguments: [tx.object(switchObjectId), tx.object(CLOCK_ID)],
  });
  return tx;
}