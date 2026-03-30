'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { NavLogo } from '@/components/NavLogo';

export default function NotFound() {
  const router = useRouter();
  const [pulse, setPulse] = useState(true);
  const [glitch, setGlitch] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const id = setInterval(() => setPulse(p => !p), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 120);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { router.push('/'); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [router]);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: 'linear-gradient(rgba(255,32,32,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,32,32,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }}>

      {/* Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,20,20,0.06) 0%, transparent 65%)' }} />

      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,1) 2px, rgba(0,0,0,1) 4px)' }} />

      <div className="relative z-10 text-center px-6">

        {/* Signal lost badge */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className={`w-1.5 h-1.5 rounded-full bg-red-500 transition-opacity duration-700 ${pulse ? 'opacity-100' : 'opacity-10'}`} />
          <span className="text-xs tracking-[0.45em] text-red-500/50 uppercase font-mono">Signal Lost</span>
          <div className={`w-1.5 h-1.5 rounded-full bg-red-500 transition-opacity duration-700 ${pulse ? 'opacity-10' : 'opacity-100'}`} />
        </div>

        {/* 404 */}
        <div className="relative mb-4">
          <div
            className="text-[12rem] font-black leading-none select-none"
            style={{
              color: 'transparent',
              WebkitTextStroke: '1px rgba(239,68,68,0.3)',
              transform: glitch ? 'translateX(3px) skewX(-1deg)' : 'translateX(0)',
              transition: 'transform 0.05s',
              filter: glitch ? 'hue-rotate(30deg)' : 'none',
            }}
          >
            404
          </div>
          <div
            className="absolute inset-0 text-[12rem] font-black leading-none select-none"
            style={{
              color: '#ef4444',
              opacity: 0.15,
              transform: glitch ? 'translateX(-3px)' : 'translateX(0)',
              transition: 'transform 0.05s',
            }}
          >
            404
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-black text-white mb-3 tracking-tight">
          Pilot Not Found
        </h1>
        <p className="text-zinc-600 font-mono text-sm max-w-sm mx-auto leading-relaxed mb-2">
          This sector of space doesn&apos;t exist — or the pilot has already been declared dead.
        </p>
        <p className="text-zinc-700 font-mono text-xs mb-12">
          // ERROR_CODE: SECTOR_NULL · COORDINATES_VOID
        </p>

        {/* Auto redirect */}
        <div className="flex flex-col items-center gap-5">
          <div className="flex items-center gap-3 text-xs font-mono text-zinc-700 tracking-widest uppercase">
            <div className="h-px w-8 bg-zinc-800" />
            Auto-returning to base in {countdown}s
            <div className="h-px w-8 bg-zinc-800" />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="px-8 py-3 font-mono text-sm tracking-widest uppercase border border-red-500/40 text-red-400 hover:bg-red-950/20 transition-all cursor-pointer"
              style={{ boxShadow: '0 0 20px rgba(255,32,32,0.06)' }}
            >
              → Return to Base
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3 font-mono text-sm tracking-widest uppercase border border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400 transition-all cursor-pointer"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="fixed top-4 left-6 opacity-30">
        <NavLogo />
      </div>
      <div className="fixed bottom-6 right-6 text-xs text-zinc-900 font-mono tracking-widest">
        EVE FRONTIER · 2026
      </div>
    </main>
  );
}