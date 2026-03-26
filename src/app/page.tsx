'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [pulse, setPulse] = useState(true);
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 1000);
    return () => clearInterval(interval);
  }, []);

  const mockConnect = () => {
    setConnected(true);
    setAddress('0x7f3a...d91c');
  };

  return (
    <main className="min-h-screen bg-black relative overflow-hidden" style={{
      backgroundImage: 'linear-gradient(rgba(255,32,32,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,32,32,0.03) 1px, transparent 1px)',
      backgroundSize: '50px 50px'
    }}>

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none" style={{background: 'radial-gradient(circle, rgba(255,20,20,0.08) 0%, transparent 70%)'}} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-red-900/30">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full bg-red-500 transition-opacity duration-1000 ${pulse ? 'opacity-100' : 'opacity-20'}`} />
          <span className="text-xs tracking-[0.3em] text-red-500/70 uppercase font-mono">Dead Man&apos;s Switch</span>
        </div>
        <div className="flex items-center gap-4">
          {connected && (
            <span className="text-xs font-mono text-green-400/70 tracking-wider">● {address}</span>
          )}
          {!connected ? (
            <button onClick={mockConnect} className="border border-red-500/40 text-red-400 text-xs px-4 py-2 font-mono tracking-widest uppercase hover:bg-red-950/30 transition-all">
              Connect Wallet
            </button>
          ) : (
            <span className="text-xs font-mono text-green-400 tracking-wider border border-green-900/40 px-3 py-1">● CONNECTED</span>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
        <div className="mb-8 px-4 py-2 border border-red-900/40 bg-red-950/20">
          <span className="text-xs tracking-[0.4em] text-red-400/60 uppercase font-mono">EVE Frontier · Hackathon 2026</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white leading-none mb-4" style={{textShadow: '0 0 40px rgba(255,32,32,0.6), 0 0 80px rgba(255,32,32,0.2)'}}>
          DEAD MAN&apos;S<br />
          <span className="text-red-500">SWITCH</span>
        </h1>

        <p className="mt-6 max-w-xl text-zinc-400 text-lg leading-relaxed">
          In the void between stars, death comes without warning.{' '}
          <span className="text-zinc-300">Set your final transmission.</span>{' '}
          If you go silent — your assets, your legacy, your last words —{' '}
          <span className="text-red-400">delivered automatically.</span>
        </p>

        <div className="mt-12">
          {!connected ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs text-zinc-600 font-mono tracking-widest uppercase">Connect your wallet to begin</p>
              <button onClick={mockConnect} className="px-10 py-4 text-sm font-mono tracking-widest uppercase text-red-400 border border-red-500/50 hover:bg-red-950/30 transition-all" style={{boxShadow: '0 0 20px rgba(255,32,32,0.1)'}}>
                → Connect Wallet
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-xs text-green-400/60 font-mono tracking-widest uppercase">Authenticated. Set your switch.</p>
              <button className="px-8 py-4 text-sm font-mono tracking-widest uppercase text-red-400 border border-red-500/50 hover:bg-red-950/30 transition-all">
                → Create Your Switch
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-20 flex gap-12 border-t border-zinc-900 pt-8">
          {[
            { label: 'Active Switches', value: '—' },
            { label: 'Assets Protected', value: '—' },
            { label: 'Triggers Fired', value: '—' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-mono font-bold text-red-400">{stat.value}</div>
              <div className="text-xs text-zinc-600 tracking-widest uppercase mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <div className="border border-red-900/20 bg-red-950/5 p-8">
          <h2 className="text-xs tracking-[0.4em] text-red-500/60 uppercase font-mono mb-8">// How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Set Your Switch', desc: 'Define beneficiaries, assets to transfer, and your timeout threshold. Sign with your Sui wallet.' },
              { num: '02', title: 'Stay Active', desc: 'As long as you check in, nothing happens. Your switch monitors your on-chain activity silently.' },
              { num: '03', title: 'Trigger on Silence', desc: 'If you disappear beyond the threshold, your final instructions execute automatically.' },
            ].map(step => (
              <div key={step.num} className="flex flex-col gap-3">
                <span className="text-red-900 font-mono text-4xl font-black">{step.num}</span>
                <h3 className="text-white font-semibold">{step.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}