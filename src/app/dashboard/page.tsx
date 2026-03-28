'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { fetchPlayerSwitches, buildCheckIn, buildWithdraw } from '@/lib/contract';
import { useSendTx } from '@/hooks/useSendTX';
import { ConnectButton } from '@mysten/dapp-kit';

interface SwitchData {
  objectId: string;
  owner: string;
  beneficiary: string;
  characterName: string;
  lastMessage: string;
  timerDays: number;
  deadlineMs: number;
  lastCheckinMs: number;
  isActive: boolean;
  isTriggered: boolean;
  balanceMist: number;
}

function CountdownTimer({ deadlineMs }: { deadlineMs: number }) {
  const [display, setDisplay] = useState('');
  const [pct, setPct] = useState(100);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const remaining = Math.max(0, deadlineMs - now);
      const total = deadlineMs - (deadlineMs - 30 * 24 * 60 * 60 * 1000); // approx
      setPct(Math.min(100, (remaining / (30 * 24 * 60 * 60 * 1000)) * 100));
      const d = Math.floor(remaining / 86400000);
      const h = Math.floor((remaining % 86400000) / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setDisplay(remaining === 0 ? 'TRIGGERED' : `${d}d ${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadlineMs]);

  const color = pct > 50 ? '#22c55e' : pct > 25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-zinc-600 font-mono tracking-widest uppercase">Time Remaining</span>
        <span className="text-sm font-mono font-black" style={{ color }}>{display}</span>
      </div>
      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}` }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, loginWithPrivy, address, isSlushConnected, shortAddress } = useAuth();
  const { sendTx } = useSendTx();
  const [switches, setSwitches] = useState<SwitchData[]>([]);
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setPulse(p => !p), 1000);
    return () => clearInterval(id);
  }, []);

  const loadSwitches = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const data = await fetchPlayerSwitches(address);
      setSwitches(data as SwitchData[]);
    } catch (err) {
      console.error('Failed to load switches:', err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadSwitches();
  }, [loadSwitches]);

  const handleCheckIn = async (objectId: string) => {
    if (!isSlushConnected) { alert('Connect your Slush wallet to check in.'); return; }
    setActionLoading(objectId);
    try {
      await sendTx(buildCheckIn(objectId));
      await loadSwitches();
    } catch (err: any) {
      alert(`Check-in failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisarm = async (objectId: string) => {
    if (!isSlushConnected) { alert('Connect your Slush wallet to disarm.'); return; }
    if (!confirm('Disarm this switch? Your SUI deposit will be returned.')) return;
    setActionLoading(objectId);
    try {
      await sendTx(buildWithdraw(objectId));
      await loadSwitches();
    } catch (err: any) {
      alert(`Disarm failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const mistToSui = (mist: number) => (mist / 1_000_000_000).toFixed(2);

  const getStatus = (sw: SwitchData) => {
    if (sw.isTriggered) return 'TRIGGERED';
    if (!sw.isActive) return 'DISARMED';
    if (Date.now() > sw.deadlineMs) return 'TRIGGERED';
    if (Date.now() > sw.deadlineMs - (sw.timerDays * 0.3 * 24 * 60 * 60 * 1000)) return 'DANGER';
    return 'ARMED';
  };

  const statusColor: Record<string, string> = {
    ARMED: '#22c55e', DANGER: '#f59e0b', TRIGGERED: '#ef4444', DISARMED: '#71717a'
  };
  const statusLabel: Record<string, string> = {
    ARMED: '● ARMED', DANGER: '⚠ DANGER', TRIGGERED: '☠ TRIGGERED', DISARMED: '○ DISARMED'
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
            <ConnectButton />
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

  return (
    <main className="min-h-screen bg-black text-white relative"
      style={{
        backgroundImage: 'linear-gradient(rgba(255,32,32,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,32,32,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }}>

      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-red-900/20">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')}
            className="text-xs text-zinc-600 font-mono tracking-widest uppercase hover:text-zinc-400 transition-colors">
            ← Home
          </button>
          <span className="text-zinc-800 font-mono text-xs">·</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full bg-red-500 transition-opacity duration-700 ${pulse ? 'opacity-100' : 'opacity-20'}`} />
            <span className="text-xs tracking-[0.3em] text-red-500/60 uppercase font-mono">Dead Man&apos;s Switch</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs font-mono text-zinc-700 hidden sm:block">
            {isSlushConnected ? '// Slush' : '// Privy'} · {shortAddress}
          </div>
          <button onClick={loadSwitches} disabled={loading}
            className="text-xs font-mono tracking-widest uppercase px-3 py-2 border border-red-900/20 text-red-900/60 hover:border-red-900/40 hover:text-red-500/60 transition-all disabled:opacity-30">
            {loading ? '...' : '↻ Sync'}
          </button>
          <button onClick={() => router.push('/create')}
            className="text-xs font-mono tracking-widest uppercase px-4 py-2 border border-red-900/40 text-red-500/60 hover:border-red-500/50 hover:text-red-400 transition-all">
            + New Switch
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-black text-white mb-1">Mission Control</h1>
            <p className="text-zinc-600 font-mono text-sm">
              {loading ? 'Scanning blockchain...' : `${switches.length} switch${switches.length !== 1 ? 'es' : ''} on-chain · Sui Testnet`}
            </p>
          </div>
        </div>

        {/* Not Slush warning */}
        {!isSlushConnected && (
          <div className="mb-6 border border-yellow-900/30 bg-yellow-950/10 px-5 py-3">
            <p className="text-xs text-yellow-500/60 font-mono">
              ⚠ Connect your Slush wallet to arm, check in, or disarm switches on-chain.
            </p>
          </div>
        )}

        {loading ? (
          <div className="border border-red-900/15 p-20 text-center">
            <div className="flex gap-1 justify-center mb-4">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-red-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <p className="text-zinc-700 font-mono text-xs tracking-widest uppercase">Loading from blockchain...</p>
          </div>
        ) : switches.length === 0 ? (
          <div className="border border-red-900/15 p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(255,32,32,0.04) 0%, transparent 70%)' }} />
            <div className="text-6xl mb-6">☠️</div>
            <p className="text-zinc-500 font-mono text-sm mb-2">No switches armed.</p>
            <p className="text-zinc-700 font-mono text-xs mb-8 tracking-widest uppercase">
              You&apos;re unprotected in the Frontier
            </p>
            <button onClick={() => router.push('/create')}
              className="px-10 py-3 font-mono text-sm tracking-widest uppercase text-black bg-red-500 hover:bg-red-400 transition-all font-bold"
              style={{ boxShadow: '0 0 30px rgba(255,32,32,0.3)' }}>
              ⚡ Arm First Switch
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {switches.map(sw => {
              const status = getStatus(sw);
              const isTriggered = status === 'TRIGGERED';
              const isDanger = status === 'DANGER';
              const isActioning = actionLoading === sw.objectId;

              return (
                <div key={sw.objectId} className="border p-6 transition-all duration-500" style={{
                  borderColor: isTriggered ? 'rgba(239,68,68,0.6)' : isDanger ? 'rgba(245,158,11,0.4)' : 'rgba(255,32,32,0.15)',
                  background: isTriggered ? 'rgba(239,68,68,0.05)' : isDanger ? 'rgba(245,158,11,0.03)' : 'rgba(255,32,32,0.02)',
                  boxShadow: isTriggered ? '0 0 30px rgba(239,68,68,0.1)' : 'none',
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

                  <div className="flex items-center gap-0 mb-5 border border-zinc-900 divide-x divide-zinc-900">
                    <div className="flex flex-col gap-0.5 px-4 py-3 flex-1">
                      <span className="text-xs text-zinc-700 font-mono tracking-widest uppercase">SUI Locked</span>
                      <span className="text-yellow-400 font-black font-mono">{mistToSui(sw.balanceMist)} SUI</span>
                    </div>
                    <div className="flex flex-col gap-0.5 px-4 py-3 flex-1">
                      <span className="text-xs text-zinc-700 font-mono tracking-widest uppercase">Timer</span>
                      <span className="text-white font-black font-mono">{sw.timerDays} days</span>
                    </div>
                    <div className="flex flex-col gap-0.5 px-4 py-3 flex-1">
                      <span className="text-xs text-zinc-700 font-mono tracking-widest uppercase">Object ID</span>
                      <span className="text-zinc-600 text-xs font-mono truncate">
                        {sw.objectId.slice(0, 8)}...{sw.objectId.slice(-6)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-5">
                    <CountdownTimer deadlineMs={sw.deadlineMs} />
                  </div>

                  {sw.lastMessage && (
                    <p className="text-xs text-zinc-600 font-mono italic mb-5 border-l-2 border-red-900/30 pl-3 leading-relaxed">
                      &quot;{sw.lastMessage.slice(0, 100)}{sw.lastMessage.length > 100 ? '...' : ''}&quot;
                    </p>
                  )}

                  {isTriggered ? (
                    <div className="py-3 text-center border border-red-500/30 bg-red-950/10">
                      <span className="text-xs font-mono text-red-400 tracking-widest uppercase">
                        ☠ Switch Triggered — Assets Transferred to Beneficiary
                      </span>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button onClick={() => handleCheckIn(sw.objectId)} disabled={isActioning || !isSlushConnected}
                        className="flex-1 py-2.5 font-mono text-xs tracking-widest uppercase bg-green-950/30 border border-green-900/50 text-green-400 hover:bg-green-950/60 transition-all font-bold disabled:opacity-40 disabled:cursor-not-allowed">
                        {isActioning ? '⏳ Processing...' : '✓ Check In · Reset Timer'}
                      </button>
                      <button onClick={() => handleDisarm(sw.objectId)} disabled={isActioning || !isSlushConnected}
                        className="px-4 py-2.5 font-mono text-xs tracking-widest uppercase border border-zinc-800 text-zinc-600 hover:border-red-900/50 hover:text-red-500/60 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
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