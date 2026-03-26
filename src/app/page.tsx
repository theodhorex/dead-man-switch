'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ConnectButton } from '@mysten/dapp-kit';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isSlushConnected, isPrivyConnected, shortAddress, loginWithPrivy, logout, ready } = useAuth();
  const [pulse, setPulse] = useState(true);
  const [glitch, setGlitch] = useState(false);
  const [stats, setStats] = useState({ active: 0, triggered: 0 });

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 4000);
    return () => clearInterval(glitchInterval);
  }, []);

  useEffect(() => {
    const switches = JSON.parse(localStorage.getItem('dms_switches') || '[]');
    const triggered = switches.filter((s: { status: string }) => s.status === 'TRIGGERED').length;
    setStats({ active: switches.length, triggered });
  }, []);

  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,32,32,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,32,32,0.04) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(255,20,20,0.07) 0%, transparent 65%)'
      }} />
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,1) 2px, rgba(0,0,0,1) 4px)'
      }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-red-900/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-2 h-2 rounded-full bg-red-500 transition-opacity duration-700 ${pulse ? 'opacity-100' : 'opacity-10'}`} />
            <div className={`absolute inset-0 w-2 h-2 rounded-full bg-red-500 blur-sm transition-opacity duration-700 ${pulse ? 'opacity-60' : 'opacity-0'}`} />
          </div>
          <span className="text-xs tracking-[0.35em] text-red-500/60 uppercase font-mono">Dead Man&apos;s Switch</span>
          <span className="text-xs text-red-900/40 font-mono hidden sm:block">// v1.0.0</span>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button onClick={() => router.push('/dashboard')} className="text-xs font-mono text-zinc-500 tracking-widest uppercase hover:text-white transition-colors">
                Dashboard →
              </button>
              <button onClick={logout} className="text-xs font-mono text-red-900/60 tracking-widest uppercase hover:text-red-500/60 transition-colors border border-red-900/30 px-3 py-1.5 hover:border-red-900/50">
                Disconnect
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="connect-wallet-nav">
                <ConnectButton />
              </div>
              <button
                onClick={loginWithPrivy}
                className="border border-red-900/50 text-red-500/70 text-xs px-4 py-2 font-mono tracking-widest uppercase hover:border-red-500/50 hover:text-red-400 hover:bg-red-950/20 transition-all"
              >
                Email / Google
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] text-center px-6">
        <div className="mb-10 flex items-center gap-2 px-4 py-2 border border-red-900/30 bg-red-950/10">
          <div className={`w-1.5 h-1.5 rounded-full bg-red-500 transition-opacity duration-700 ${pulse ? 'opacity-100' : 'opacity-30'}`} />
          <span className="text-xs tracking-[0.45em] text-red-400/50 uppercase font-mono">EVE Frontier · Hackathon 2026</span>
        </div>

        <div className="relative mb-6">
          <h1 className="text-7xl md:text-9xl font-black tracking-tight text-white leading-none select-none"
            style={{
              textShadow: '0 0 60px rgba(255,32,32,0.5), 0 0 120px rgba(255,32,32,0.15)',
              transform: glitch ? 'translateX(2px)' : 'translateX(0)',
              transition: 'transform 0.05s',
              filter: glitch ? 'hue-rotate(20deg)' : 'none',
            }}>
            DEAD MAN&apos;S
          </h1>
          <h1 className="text-7xl md:text-9xl font-black tracking-tight leading-none select-none"
            style={{
              color: '#ef4444',
              textShadow: '0 0 40px rgba(255,32,32,0.8)',
              transform: glitch ? 'translateX(-2px)' : 'translateX(0)',
              transition: 'transform 0.05s',
            }}>
            SWITCH
          </h1>
        </div>

        <p className="max-w-lg text-zinc-500 text-base leading-relaxed font-mono mb-1">
          In the void between stars, death comes without warning.
        </p>
        <p className="max-w-lg text-zinc-400 text-base leading-relaxed font-mono">
          Set your final transmission. If you go silent —{' '}
          <span className="text-red-400">it triggers automatically.</span>
        </p>

        {/* CTA */}
        <div className="mt-12">
          {!ready ? (
            <div className="flex items-center gap-2 text-xs text-zinc-700 font-mono tracking-widest uppercase animate-pulse">
              <div className="w-1 h-1 bg-zinc-700 rounded-full" />
              Initializing neural link...
            </div>
          ) : isAuthenticated ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
                <span className="text-green-500/60">
                  {isSlushConnected ? 'Slush' : 'Privy'} · {shortAddress}
                </span>
              </div>
              <button
                onClick={() => router.push('/create')}
                className="group relative px-12 py-4 text-sm font-mono tracking-widest uppercase text-red-400 border border-red-500/40 hover:border-red-400/70 hover:bg-red-950/20 transition-all duration-300"
                style={{ boxShadow: '0 0 30px rgba(255,32,32,0.08)' }}
              >
                → Create Your Switch
              </button>
              <button onClick={() => router.push('/dashboard')} className="text-xs text-zinc-600 font-mono tracking-widest uppercase hover:text-zinc-400 transition-colors underline underline-offset-4">
                View Dashboard
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <p className="text-xs text-zinc-700 font-mono tracking-widest uppercase">Choose your access method</p>

              {/* Dual login buttons */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                {/* Slush — crypto native */}
                <div className="flex flex-col items-center gap-2">
                  <div className="connect-wallet-wrapper">
                    <ConnectButton />
                  </div>
                  <span className="text-xs text-zinc-700 font-mono tracking-widest">// Sui Wallet</span>
                </div>

                <div className="flex flex-col items-center justify-center h-12">
                  <div className="h-8 w-px bg-red-900/30" />
                  <span className="text-zinc-800 font-mono text-xs py-1">or</span>
                  <div className="h-8 w-px bg-red-900/30" />
                </div>

                {/* Privy — email/google */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={loginWithPrivy}
                    className="px-8 py-3 text-sm font-mono tracking-widest uppercase text-red-400 border border-red-500/40 hover:border-red-400/70 hover:bg-red-950/20 transition-all duration-300 min-w-[180px]"
                    style={{ boxShadow: '0 0 20px rgba(255,32,32,0.06)' }}
                  >
                    → Email / Google
                  </button>
                  <span className="text-xs text-zinc-700 font-mono tracking-widest">// No wallet needed</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-20 flex gap-16 border-t border-zinc-900/80 pt-8">
          {[
            { label: 'Active Switches', value: stats.active > 0 ? stats.active.toString() : '—' },
            { label: 'Assets Protected', value: '∞' },
            { label: 'Triggers Fired', value: stats.triggered > 0 ? stats.triggered.toString() : '—' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-mono font-black text-red-500/80">{stat.value}</div>
              <div className="text-xs text-zinc-700 tracking-widest uppercase mt-1 font-mono">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-32">
        <div className="border border-red-900/15 bg-gradient-to-b from-red-950/5 to-transparent p-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px flex-1 bg-red-900/20" />
            <h2 className="text-xs tracking-[0.5em] text-red-500/40 uppercase font-mono whitespace-nowrap">// Protocol</h2>
            <div className="h-px flex-1 bg-red-900/20" />
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { num: '01', title: 'Arm the Switch', desc: 'Login with email or Sui wallet. Define your beneficiary, timeout threshold, and final message.' },
              { num: '02', title: 'Maintain Presence', desc: 'While you check in, nothing triggers. Your on-chain activity is monitored automatically.' },
              { num: '03', title: 'Silence = Trigger', desc: 'Exceed the silence threshold and your assets, access, and last words execute — automatically.' },
            ].map(step => (
              <div key={step.num} className="flex flex-col gap-3 group">
                <span className="text-red-900/60 font-mono text-5xl font-black group-hover:text-red-900/90 transition-colors">{step.num}</span>
                <h3 className="text-white font-bold text-sm tracking-wide">{step.title}</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 text-center">
          <p className="text-xs text-zinc-800 font-mono tracking-widest">
            Built on Sui · Secured by Privy · EVE Frontier Hackathon 2026
          </p>
        </div>
      </section>
    </main>
  );
}