'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ConnectButton } from '@mysten/dapp-kit';
import { NavLogo } from '@/components/NavLogo';
import { fetchPlayerSwitches } from '@/lib/contract';
import { fetchGlobalStats } from '@/lib/contract';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isSlushConnected, shortAddress, address, loginWithPrivy, logout, ready } = useAuth();
  const [pulse, setPulse] = useState(true);
  const [glitch, setGlitch] = useState(false);
  const [stats, setStats] = useState({ active: 0, triggered: 0 });
  const [typed, setTyped] = useState('');

  const tagline = 'if you go silent — it triggers.';

  useEffect(() => {
    const id = setInterval(() => setPulse(p => !p), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 120);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetchGlobalStats().then((data) => {
      setStats({ active: data.active, triggered: data.triggered });
    });
  }, []); // tidak perlu address, langsung load saat landing page dibuka

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setTyped(tagline.slice(0, i));
      i++;
      if (i > tagline.length) clearInterval(id);
    }, 50);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="min-h-screen bg-black relative overflow-x-hidden">
      {/* Grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,32,32,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,32,32,0.035) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,20,20,0.07) 0%, transparent 65%)' }} />
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,1) 2px, rgba(0,0,0,1) 4px)' }} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-red-900/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <NavLogo />
            <span className="text-xs text-red-900/40 font-mono hidden sm:block">// v1.0.0</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button onClick={() => router.push('/dashboard')}
                className="text-xs font-mono text-zinc-400 tracking-widest uppercase hover:text-white transition-colors border border-zinc-800 px-4 py-2 hover:border-zinc-600">
                Mission Control →
              </button>
              <button onClick={logout}
                className="text-xs font-mono text-red-900/50 tracking-widest uppercase hover:text-red-500/60 transition-colors">
                Disconnect
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="connect-wallet-nav"><ConnectButton /></div>
              <button onClick={loginWithPrivy}
                className="border border-red-900/50 text-red-500/70 text-xs px-4 py-2 font-mono tracking-widest uppercase hover:border-red-500/50 hover:text-red-400 hover:bg-red-950/20 transition-all">
                Email / OTP
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[88vh] text-center px-6">

        {/* Badge */}
        <div className="mb-10 flex items-center gap-2 px-4 py-2 border border-red-900/30 bg-red-950/10">
          <div className={`w-1.5 h-1.5 rounded-full bg-red-500 transition-opacity duration-700 ${pulse ? 'opacity-100' : 'opacity-30'}`} />
          <span className="text-xs tracking-[0.45em] text-red-400/50 uppercase font-mono">EVE Frontier · Hackathon 2026</span>
        </div>

        {/* Title */}
        <div className="relative mb-8">
          <h1 className="text-8xl md:text-9xl font-black tracking-tight text-white leading-none select-none"
            style={{
              textShadow: '0 0 80px rgba(255,32,32,0.4), 0 0 160px rgba(255,32,32,0.1)',
              transform: glitch ? 'translateX(3px)' : 'translateX(0)',
              transition: 'transform 0.05s',
              filter: glitch ? 'hue-rotate(15deg)' : 'none',
            }}>
            DEAD MAN&apos;S
          </h1>
          <h1 className="text-8xl md:text-9xl font-black tracking-tight leading-none select-none"
            style={{
              color: '#ef4444',
              textShadow: '0 0 60px rgba(255,32,32,0.9), 0 0 120px rgba(255,32,32,0.3)',
              transform: glitch ? 'translateX(-3px)' : 'translateX(0)',
              transition: 'transform 0.05s',
            }}>
            SWITCH
          </h1>
        </div>

        {/* Typewriter tagline */}
        <div className="mb-10 h-6 flex items-center justify-center">
          <p className="text-zinc-400 font-mono text-sm tracking-widest">
            {typed}
            <span className={`inline-block w-0.5 h-4 bg-red-500 ml-0.5 align-middle transition-opacity duration-300 ${pulse ? 'opacity-100' : 'opacity-0'}`} />
          </p>
        </div>

        {/* CTA */}
        {!ready ? (
          <div className="flex items-center gap-2 text-xs text-zinc-800 font-mono tracking-widest uppercase animate-pulse">
            <div className="w-1 h-1 bg-zinc-800 rounded-full" />
            Initializing...
          </div>
        ) : isAuthenticated ? (
          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
              <span className="text-green-500/60">{isSlushConnected ? 'Slush' : 'Privy'} · {shortAddress}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => router.push('/create')}
                className="group relative px-10 py-4 text-sm font-mono tracking-widest uppercase text-black bg-red-500 hover:bg-red-400 transition-all duration-300 font-bold"
                style={{ boxShadow: '0 0 40px rgba(255,32,32,0.4)' }}>
                ⚡ Arm Your Switch
              </button>
              <button onClick={() => router.push('/dashboard')}
                className="px-10 py-4 text-sm font-mono tracking-widest uppercase text-red-400 border border-red-500/40 hover:border-red-400/70 hover:bg-red-950/20 transition-all duration-300">
                Dashboard →
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <p className="text-xs text-zinc-700 font-mono tracking-widest uppercase">Choose your access method</p>
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex flex-col items-center gap-2">
                <div className="connect-wallet-wrapper"><ConnectButton /></div>
                <span className="text-xs text-zinc-800 font-mono">// Sui Wallet</span>
              </div>
              <div className="text-zinc-800 font-mono px-2">—</div>
              <div className="flex flex-col items-center gap-2">
                <button onClick={loginWithPrivy}
                  className="px-8 py-3 text-sm font-mono tracking-widest uppercase text-red-400 border border-red-500/40 hover:border-red-400/70 hover:bg-red-950/20 transition-all min-w-[180px]">
                  → Email / OTP
                </button>
                <span className="text-xs text-zinc-800 font-mono">// No wallet needed</span>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-20 flex gap-16 border-t border-zinc-900/60 pt-8">
          {[
            { label: 'Active Switches', value: stats.active > 0 ? stats.active.toString() : '—' },
            { label: 'Assets Protected', value: '∞' },
            { label: 'Triggers Fired', value: stats.triggered > 0 ? stats.triggered.toString() : '—' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-mono font-black text-red-500/80 mb-1">{stat.value}</div>
              <div className="text-xs text-zinc-700 tracking-widest uppercase font-mono">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works + Footer */}
      <section className="relative z-10 max-w-4xl mx-auto px-6">
        <div className="border border-red-900/15 bg-gradient-to-b from-red-950/5 to-transparent p-10 pb-16">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px flex-1 bg-red-900/20" />
            <h2 className="text-xs tracking-[0.5em] text-red-500/40 uppercase font-mono whitespace-nowrap">// Protocol</h2>
            <div className="h-px flex-1 bg-red-900/20" />
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { num: '01', title: 'Arm the Switch', desc: 'Login with email or Sui wallet. Set your beneficiary, silence threshold, and lock your SUI deposit.' },
              { num: '02', title: 'Maintain Presence', desc: 'While you check in regularly, nothing triggers. Your on-chain activity is monitored automatically.' },
              { num: '03', title: 'Silence = Trigger', desc: 'Go dark beyond the threshold — your SUI transfers to your beneficiary. Automatically. Permanently.' },
            ].map(step => (
              <div key={step.num} className="flex flex-col gap-3 group">
                <span className="text-red-900/50 font-mono text-5xl font-black group-hover:text-red-900/80 transition-colors duration-300">{step.num}</span>
                <h3 className="text-white font-bold text-sm tracking-wide">{step.title}</h3>
                <p className="text-zinc-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer bar */}
        <div className="mt-16 mb-10 border-t border-zinc-900/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-700 font-mono tracking-widest">
            Built on Sui · Secured by Privy · EVE Frontier Hackathon 2026
          </p>
          <button onClick={() => router.push('/claim')}
            className="text-xs text-zinc-400 font-mono tracking-widest uppercase hover:text-red-400 transition-colors border border-zinc-800 hover:border-red-900/50 px-5 py-2 whitespace-nowrap">
            Beneficiary? Claim →
          </button>
        </div>
      </section>
    </main>
  );
}