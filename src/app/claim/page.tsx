'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ConnectButton } from '@mysten/dapp-kit';
import { Suspense } from 'react';
import { NavLogo } from '@/components/NavLogo';

function CountdownDisplay({ deadlineMs }: { deadlineMs: number }) {
  const [display, setDisplay] = useState('');
  const [pct, setPct] = useState(100);

  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(0, deadlineMs - Date.now());
      setPct(Math.min(100, (remaining / (30 * 24 * 60 * 60 * 1000)) * 100));
      const d = Math.floor(remaining / 86400000);
      const h = Math.floor((remaining % 86400000) / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setDisplay(remaining === 0 ? 'EXPIRED' : `${d}d ${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadlineMs]);

  const color = pct > 50 ? '#22c55e' : pct > 25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-zinc-600 font-mono tracking-widest uppercase">Time Until Trigger</span>
        <span className="text-sm font-mono font-black" style={{ color }}>{display}</span>
      </div>
      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}` }} />
      </div>
    </div>
  );
}

function ClaimContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loginWithPrivy, address } = useAuth();

  const [switchId, setSwitchId] = useState(searchParams.get('id') || '');
  const [found, setFound] = useState<any | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) handleSearch(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (id?: string) => {
    const target = id || switchId;
    if (!target) return;
    setSearching(true);
    setNotFound(false);
    setFound(null);

    try {
      const res = await fetch('https://fullnode.testnet.sui.io:443', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0', id: 1,
          method: 'sui_getObject',
          params: [target, { showContent: true }],
        }),
      });
      const obj = await res.json();
      const fields = obj?.result?.data?.content?.fields;
      if (!fields) { setNotFound(true); return; }

      const decodeBytes = (val: any): string => {
        try {
          if (Array.isArray(val)) return new TextDecoder().decode(new Uint8Array(val));
          return val ?? '';
        } catch { return ''; }
      };

      setFound({
        id: target,
        characterName: decodeBytes(fields.character_name),
        beneficiary: fields.beneficiary,
        message: decodeBytes(fields.last_message),
        timerDays: Number(fields.timer_days),
        depositAmount: Number(
          fields.balance?.fields?.value ??
          fields.balance?.value ??
          fields.balance ??
          0
        ) / 1_000_000_000,
        deadlineMs: Number(fields.deadline_ms),
        isActive: fields.is_active,
        isTriggered: fields.is_triggered,
        owner: fields.owner,
      });
    } catch {
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  const handleClaim = async () => {
    if (!found) return;
    if (!address) { alert('Connect your Slush wallet first!'); return; }
    try {
      const { buildTrigger } = await import('@/lib/contract');
      const { useSendTx } = await import('@/hooks/useSendTX');
      // Note: useSendTx harus dipake via hook, bukan dynamic import
      alert('To trigger: use the Slush wallet via dashboard. Anyone can call trigger_switch after deadline.');
    } catch (err: any) {
      alert(`Failed: ${err.message}`);
    }
  };

  const isTriggerable = found && (found.isTriggered || (!found.isActive === false && Date.now() > found.deadlineMs));
  const canTrigger = found && found.isActive && !found.isTriggered && Date.now() > found.deadlineMs;
  const getStatus = () => {
    if (!found) return null;
    if (found.isTriggered) return 'TRIGGERED';
    if (!found.isActive) return 'DISARMED';
    if (Date.now() > found.deadlineMs) return 'EXPIRED';
    return 'ARMED';
  };
  const status = getStatus();

  const statusStyle: Record<string, { color: string; border: string }> = {
    ARMED: { color: '#22c55e', border: 'rgba(34,197,94,0.3)' },
    TRIGGERED: { color: '#ef4444', border: 'rgba(239,68,68,0.4)' },
    EXPIRED: { color: '#ef4444', border: 'rgba(239,68,68,0.4)' },
    DISARMED: { color: '#71717a', border: 'rgba(113,113,122,0.3)' },
  };

  if (claimed) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,32,32,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,32,32,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}>
        <div className="text-7xl">💀</div>
        <div className="text-center max-w-sm">
          <p className="text-red-400 font-mono text-xl tracking-widest uppercase font-black mb-3">Assets Claimed</p>
          <p className="text-zinc-500 font-mono text-sm leading-relaxed">
            {found?.depositAmount} SUI has been transferred to your wallet.<br />
            {found?.characterName}&apos;s final transmission is complete.
          </p>
        </div>
        {found?.message && (
          <div className="max-w-sm border border-red-900/25 bg-red-950/5 p-6 text-center">
            <div className="text-xs text-red-500/30 font-mono tracking-widest uppercase mb-3">// Last Words</div>
            <p className="text-zinc-400 font-mono text-sm italic leading-relaxed">&quot;{found.message}&quot;</p>
            <div className="text-xs text-zinc-700 font-mono mt-3">— {found.characterName}</div>
          </div>
        )}
        <button onClick={() => router.push('/')}
          className="text-xs text-zinc-700 font-mono tracking-widest uppercase hover:text-zinc-500 transition-colors underline underline-offset-4 mt-4">
          Return to Home
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden"
      style={{
        backgroundImage: 'linear-gradient(rgba(255,32,32,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,32,32,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }}>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,20,20,0.05) 0%, transparent 65%)' }} />

      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-red-900/20">
        <NavLogo />
        {!isAuthenticated ? (
          <div className="flex items-center gap-2">
            <ConnectButton
              style={{
                background: 'transparent',
                border: '1px solid rgba(239,68,68,0.4)',
                color: '#f87171',
                fontSize: '12px',
                padding: '8px 16px',
                fontFamily: 'monospace',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                borderRadius: '0',
              }}
            />
            <button onClick={loginWithPrivy}
              className="border border-red-900/50 text-red-500/70 text-xs px-4 py-2 font-mono tracking-widest uppercase hover:border-red-500/50 hover:text-red-400 hover:bg-red-950/20 transition-all">
              Email / OTP
            </button>
          </div>
        ) : (
          <button onClick={() => router.push('/dashboard')}
            className="text-xs font-mono text-zinc-600 tracking-widest uppercase hover:text-white transition-colors">
            Dashboard →
          </button>
        )}
      </nav>

      <div className="relative z-10 max-w-xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-xs text-red-500/40 font-mono tracking-widest uppercase mb-2">// Claim Portal</p>
          <h1 className="text-4xl font-black text-white mb-2">Claim Assets</h1>
          <p className="text-zinc-600 text-sm font-mono">Enter the Switch Object ID shared by the pilot. If the timer has expired, you can claim.</p>
        </div>

        <div className="flex gap-2 mb-8">
          <input
            type="text"
            placeholder="0x... (Switch Object ID)"
            value={switchId}
            onChange={e => setSwitchId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-transparent border border-red-900/25 focus:border-red-500/40 text-white px-4 py-3 font-mono text-sm focus:outline-none transition-colors placeholder:text-zinc-800"
          />
          <button onClick={() => handleSearch()} disabled={searching}
            className="px-6 py-3 font-mono text-sm tracking-widest uppercase border border-red-500/40 text-red-400 hover:bg-red-950/20 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50">
            {searching ? '...' : '→ Search'}
          </button>
        </div>

        {notFound && (
          <div className="border border-red-900/20 bg-red-950/5 p-8 text-center">
            <div className="text-3xl mb-3">🔍</div>
            <p className="text-zinc-500 font-mono text-sm">No switch found with that ID.</p>
            <p className="text-zinc-700 font-mono text-xs mt-1">Make sure the pilot shared the correct Object ID.</p>
          </div>
        )}

        {found && status && (
          <div className="flex flex-col gap-6">
            <div className="border p-6 transition-all duration-500" style={{
              borderColor: canTrigger ? 'rgba(239,68,68,0.6)' : 'rgba(255,32,32,0.15)',
              background: canTrigger ? 'rgba(239,68,68,0.04)' : 'rgba(255,32,32,0.02)',
              boxShadow: canTrigger ? '0 0 40px rgba(239,68,68,0.08)' : 'none',
            }}>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="font-black text-white text-2xl mb-1">{found.characterName}</div>
                  <div className="text-xs text-zinc-600 font-mono">
                    {found.id.slice(0, 14)}...{found.id.slice(-8)}
                  </div>
                </div>
                <span className="text-xs font-mono tracking-widest px-3 py-1 border" style={{
                  color: statusStyle[status]?.color,
                  borderColor: statusStyle[status]?.border,
                }}>
                  {status === 'ARMED' ? '● ARMED' : status === 'TRIGGERED' ? '☠ TRIGGERED' : status === 'EXPIRED' ? '⚠ EXPIRED' : '○ DISARMED'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5 font-mono text-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-zinc-600 tracking-widest uppercase">SUI Locked</span>
                  <span className="text-yellow-400 font-black text-lg">{found.depositAmount.toFixed(2)} SUI</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-zinc-600 tracking-widest uppercase">Timer</span>
                  <span className="text-white font-black text-lg">{found.timerDays} days</span>
                </div>
              </div>

              {found.isActive && !found.isTriggered && (
                <div className="mb-5">
                  <CountdownDisplay deadlineMs={found.deadlineMs} />
                </div>
              )}

              {found.message && (
                <div className="border-l-2 border-red-900/40 pl-4 mb-5">
                  <div className="text-xs text-red-500/30 font-mono tracking-widest uppercase mb-2">// Last Words</div>
                  <p className="text-zinc-400 font-mono text-sm italic leading-relaxed">
                    &quot;{found.message}&quot;
                  </p>
                </div>
              )}

              {canTrigger ? (
                <div className="flex flex-col gap-3">
                  {address ? (
                    <>
                      <div className="text-xs text-zinc-600 font-mono text-center">
                        Claiming to: <span className="text-zinc-400">{address.slice(0, 10)}...{address.slice(-6)}</span>
                      </div>
                      <button onClick={handleClaim}
                        className="w-full py-4 font-mono text-sm tracking-widest uppercase border border-red-500/60 text-red-400 hover:bg-red-950/20 transition-all cursor-pointer"
                        style={{ boxShadow: '0 0 40px rgba(255,32,32,0.12)' }}>
                        ☠ CLAIM {found.depositAmount.toFixed(2)} SUI
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3 items-center">
                      <p className="text-xs text-zinc-600 font-mono tracking-widest">Connect wallet to claim</p>
                      <div className="flex gap-3">
                        <ConnectButton
                          style={{
                            background: 'transparent',
                            border: '1px solid rgba(239,68,68,0.4)',
                            color: '#f87171',
                            fontSize: '12px',
                            padding: '12px 24px',
                            fontFamily: 'monospace',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            borderRadius: '0',
                          }}
                        />
                        <button onClick={loginWithPrivy}
                          className="px-6 py-3 font-mono text-sm tracking-widest uppercase border border-red-500/40 text-red-400 hover:bg-red-950/20 transition-all">
                          Email / OTP
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-3 text-center border border-zinc-900">
                  <span className="text-xs font-mono text-zinc-600 tracking-widest uppercase">
                    {found.isTriggered ? '☠ Already triggered' : found.isActive ? 'Switch still active — pilot is alive' : '○ Switch disarmed'}
                  </span>
                </div>
              )}
            </div>

            <div className="border border-zinc-900 bg-zinc-950/50 px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs text-zinc-600 font-mono tracking-widest uppercase mb-1">Share Claim Link</div>
                <div className="text-xs text-zinc-700 font-mono truncate">/claim?id={found.id.slice(0, 20)}...</div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/claim?id=${found.id}`);
                  alert('Claim link copied!');
                }}
                className="text-xs font-mono tracking-widest uppercase px-3 py-2 border border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400 transition-all cursor-pointer shrink-0">
                Copy Link
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xs text-zinc-700 font-mono tracking-widest uppercase animate-pulse">Loading...</div>
      </main>
    }>
      <ClaimContent />
    </Suspense>
  );
}