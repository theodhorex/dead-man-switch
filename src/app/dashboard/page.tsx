'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { switchStore, DeadSwitch } from '@/lib/switchStore';
import { getLastActivityTimestamp } from '@/lib/sui';
import { ConnectButton } from '@mysten/dapp-kit';

function CountdownTimer({ lastSeen, timerDays }: { lastSeen: string; timerDays: number }) {
  const [display, setDisplay] = useState('');
  const [pct, setPct] = useState(100);

  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - new Date(lastSeen).getTime();
      const total = timerDays * 24 * 60 * 60 * 1000;
      const remaining = Math.max(0, total - elapsed);
      const p = (remaining / total) * 100;
      setPct(p);

      const d = Math.floor(remaining / 86400000);
      const h = Math.floor((remaining % 86400000) / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setDisplay(`${d}d ${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastSeen, timerDays]);

  const color = pct > 50 ? '#22c55e' : pct > 25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-zinc-600 font-mono tracking-widest uppercase">Time Remaining</span>
        <span className="text-sm font-mono font-black" style={{ color }}>{display}</span>
      </div>
      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}` }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, loginWithPrivy, address, isSlushConnected, shortAddress } = useAuth();
  const [switches, setSwitches] = useState<DeadSwitch[]>([]);
  const [onChainTs, setOnChainTs] = useState<number | null>(null);
  const [loadingChain, setLoadingChain] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setPulse(p => !p), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!address) return;
    const all = switchStore.getByOwner(address);
    // recompute status
    const updated = all.map(s => ({ ...s, status: switchStore.computeStatus(s) }));
    setSwitches(updated);
  }, [address]);

  const fetchOnChain = useCallback(async () => {
    if (!address || !address.startsWith('0x')) return;
    setLoadingChain(true);
    try {
      const ts = await getLastActivityTimestamp(address);
      setOnChainTs(ts);
      setLastSynced(new Date().toLocaleTimeString());
    } finally {
      setLoadingChain(false);
    }
  }, [address]);

  useEffect(() => {
    fetchOnChain();
  }, [fetchOnChain]);

  const handleCheckIn = (id: string) => {
    switchStore.checkIn(id);
    if (address) {
      const updated = switchStore.getByOwner(address).map(s => ({ ...s, status: switchStore.computeStatus(s) }));
      setSwitches(updated);
    }
  };

  const handleDelete = (id: string) => {
    switchStore.delete(id);
    if (address) {
      setSwitches(switchStore.getByOwner(address));
    }
  };

  const formatTimeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor(diff / 60000);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    return `${m}m ago`;
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-8"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,32,32,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,32,32,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}>
        <div className="text-center">
          <div className="text-4xl mb-4">☠️</div>
          <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase mb-8">Connect to access Mission Control</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex flex-col items-center gap-2">
            <div className="connect-wallet-wrapper"><ConnectButton /></div>
            <span className="text-xs text-zinc-700 font-mono">// Sui Wallet</span>
          </div>
          <span className="text-zinc-800 font-mono">or</span>
          <div className="flex flex-col items-center gap-2">
            <button onClick={loginWithPrivy} className="px-8 py-3 font-mono text-sm tracking-widest uppercase border border-red-500/40 text-red-400 hover:bg-red-950/20 transition-all min-w-[180px]">
              → Email / Google
            </button>
            <span className="text-xs text-zinc-700 font-mono">// No wallet needed</span>
          </div>
        </div>
      </main>
    );
  }

  const statusColor = { ARMED: '#22c55e', DANGER: '#f59e0b', TRIGGERED: '#ef4444' };
  const statusLabel = { ARMED: '● ARMED', DANGER: '⚠ DANGER', TRIGGERED: '☠ TRIGGERED' };

  return (
    <main className="min-h-screen bg-black text-white relative"
      style={{
        backgroundImage: 'linear-gradient(rgba(255,32,32,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,32,32,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }}>

      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-red-900/20">
        <button onClick={() => router.push('/')} className="flex items-center gap-3 hover:opacity-60 transition-opacity">
          <div className={`w-2 h-2 rounded-full bg-red-500 transition-opacity duration-700 ${pulse ? 'opacity-100' : 'opacity-20'}`} />
          <span className="text-xs tracking-[0.3em] text-red-500/60 uppercase font-mono">Dead Man&apos;s Switch</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="text-xs font-mono text-zinc-700 hidden sm:block">
            {isSlushConnected ? '// Slush' : '// Privy'} · {shortAddress}
          </div>
          <button
            onClick={() => router.push('/create')}
            className="text-xs font-mono tracking-widest uppercase px-4 py-2 border border-red-900/40 text-red-500/60 hover:border-red-500/50 hover:text-red-400 transition-all cursor-pointer"
          >
            + New Switch
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-1">Mission Control</h1>
          <p className="text-zinc-600 font-mono text-sm">Your dead man&apos;s switches. Stay alive. Check in.</p>
        </div>

        {/* On-chain activity panel */}
        {isSlushConnected && (
          <div className="mb-8 border border-red-900/20 bg-red-950/5 px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="text-xs text-red-500/40 font-mono tracking-widest uppercase mb-2">// On-Chain Activity · Sui Mainnet</div>
              {loadingChain ? (
                <div className="text-xs text-zinc-700 font-mono animate-pulse">Scanning blockchain...</div>
              ) : onChainTs ? (
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
                  <span className="text-sm font-mono text-green-400/80">Last tx: <span className="text-white">{formatTimeAgo(onChainTs)}</span></span>
                </div>
              ) : (
                <div className="text-xs text-zinc-700 font-mono">No on-chain activity found for this wallet</div>
              )}
              {lastSynced && <div className="text-xs text-zinc-800 font-mono mt-1">Last synced: {lastSynced}</div>}
            </div>
            <button
              onClick={fetchOnChain}
              disabled={loadingChain}
              className="text-xs font-mono tracking-widest uppercase px-3 py-2 border border-red-900/20 text-red-900/60 hover:border-red-900/40 hover:text-red-500/60 transition-all cursor-pointer disabled:opacity-30 shrink-0"
            >
              ↻ Sync
            </button>
          </div>
        )}

        {switches.length === 0 ? (
          <div className="border border-red-900/15 bg-red-950/5 p-16 text-center">
            <div className="text-5xl mb-4">☠️</div>
            <p className="text-zinc-600 font-mono text-sm mb-6">No switches armed. You&apos;re unprotected in the Frontier.</p>
            <button onClick={() => router.push('/create')} className="px-8 py-3 font-mono text-sm tracking-widest uppercase border border-red-500/40 text-red-400 hover:bg-red-950/20 transition-all cursor-pointer">
              → Arm First Switch
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {switches.map(sw => {
              const status = switchStore.computeStatus(sw);
              const isDanger = status === 'DANGER';
              const isTriggered = status === 'TRIGGERED';
              return (
                <div key={sw.id} className="border p-6 transition-all duration-500" style={{
                  borderColor: isTriggered ? 'rgba(239,68,68,0.6)' : isDanger ? 'rgba(245,158,11,0.4)' : 'rgba(255,32,32,0.15)',
                  background: isTriggered ? 'rgba(239,68,68,0.05)' : isDanger ? 'rgba(245,158,11,0.03)' : 'rgba(255,32,32,0.02)',
                  boxShadow: isTriggered ? '0 0 30px rgba(239,68,68,0.1)' : isDanger ? '0 0 20px rgba(245,158,11,0.05)' : 'none',
                }}>
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <div className="font-black text-white text-xl mb-1">{sw.characterName}</div>
                      <div className="text-xs text-zinc-600 font-mono">
                        → {sw.beneficiary.slice(0, 12)}...{sw.beneficiary.slice(-6)}
                      </div>
                    </div>
                    <span className="text-xs font-mono tracking-widest" style={{ color: statusColor[status] }}>
                      {statusLabel[status]}
                    </span>
                  </div>

                  <div className="mb-5">
                    <CountdownTimer lastSeen={sw.lastSeen} timerDays={sw.timerDays} />
                  </div>

                  {sw.message && (
                    <p className="text-xs text-zinc-600 font-mono italic mb-5 border-l-2 border-red-900/30 pl-3 leading-relaxed">
                      &quot;{sw.message.slice(0, 100)}{sw.message.length > 100 ? '...' : ''}&quot;
                    </p>
                  )}

                  {isTriggered ? (
                    <div className="py-3 text-center border border-red-500/30 bg-red-950/10">
                      <span className="text-xs font-mono text-red-400 tracking-widest uppercase">☠ Switch Triggered — Assets Transferred</span>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleCheckIn(sw.id)}
                        className="flex-1 py-2.5 font-mono text-xs tracking-widest uppercase border border-green-900/40 text-green-500/70 hover:bg-green-950/20 hover:text-green-400 transition-all cursor-pointer"
                      >
                        ✓ Check In · Reset Timer
                      </button>
                      <button
                        onClick={() => handleDelete(sw.id)}
                        className="px-4 py-2.5 font-mono text-xs tracking-widest uppercase border border-zinc-900 text-zinc-700 hover:border-red-900/40 hover:text-red-900/60 transition-all cursor-pointer"
                      >
                        Disarm
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}