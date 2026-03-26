'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { switchStore } from '@/lib/switchStore';
import { ConnectButton } from '@mysten/dapp-kit';

const TIMER_OPTIONS = [
  { label: '3 Days', value: 3, desc: 'High alert. For active pilots.' },
  { label: '7 Days', value: 7, desc: 'Standard. One week of silence.' },
  { label: '14 Days', value: 14, desc: 'Patient. Two weeks before trigger.' },
  { label: '30 Days', value: 30, desc: 'Final resort. A month of void.' },
];

export default function CreateSwitch() {
  const router = useRouter();
  const { isAuthenticated, loginWithPrivy, address } = useAuth();
  const [step, setStep] = useState(1);
  const [armed, setArmed] = useState(false);
  const [form, setForm] = useState({
    characterName: '',
    beneficiary: '',
    message: '',
    timerDays: 7,
  });

  const update = (field: string, value: string | number) =>
    setForm(f => ({ ...f, [field]: value }));

  const isStep1Valid = form.characterName.trim().length > 0 && form.beneficiary.trim().length > 2;

  const handleSubmit = () => {
    if (!address) return;
    switchStore.create({
      characterName: form.characterName,
      beneficiary: form.beneficiary,
      message: form.message,
      timerDays: form.timerDays,
      owner: address,
    });
    setArmed(true);
    setTimeout(() => router.push('/dashboard'), 2000);
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
          <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase mb-8">Authentication required to arm a switch</p>
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

  if (armed) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <div className="text-6xl animate-pulse">⚡</div>
        <p className="text-red-400 font-mono text-lg tracking-widest uppercase">Switch Armed</p>
        <p className="text-zinc-600 font-mono text-xs tracking-widest">Redirecting to Mission Control...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden"
      style={{
        backgroundImage: 'linear-gradient(rgba(255,32,32,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,32,32,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }}>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{
        background: 'radial-gradient(circle, rgba(255,20,20,0.05) 0%, transparent 65%)'
      }} />

      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-red-900/20">
        <button onClick={() => router.push('/')} className="flex items-center gap-3 hover:opacity-60 transition-opacity">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-xs tracking-[0.3em] text-red-500/60 uppercase font-mono">Dead Man&apos;s Switch</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-700 tracking-widest">STEP {step} / 3</span>
          <div className="flex gap-1">
            {[1,2,3].map(s => (
              <div key={s} className="w-6 h-0.5 transition-all duration-500" style={{
                background: s <= step ? '#ef4444' : 'rgba(255,255,255,0.08)'
              }} />
            ))}
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-xl mx-auto px-6 py-16">

        {/* STEP 1 */}
        {step === 1 && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            <div>
              <p className="text-xs text-red-500/50 font-mono tracking-widest uppercase mb-2">// Step 01</p>
              <h1 className="text-4xl font-black text-white mb-2">Identify Your Legacy</h1>
              <p className="text-zinc-600 text-sm font-mono">Who are you, and who do you trust with everything?</p>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-red-400/60 font-mono tracking-widest uppercase">EVE Character Name</label>
                <input
                  type="text"
                  placeholder="e.g. Theodhore Vayne"
                  value={form.characterName}
                  onChange={e => update('characterName', e.target.value)}
                  className="bg-transparent border border-red-900/30 focus:border-red-500/50 text-white px-4 py-3 font-mono text-sm focus:outline-none transition-colors placeholder:text-zinc-800"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-red-400/60 font-mono tracking-widest uppercase">Beneficiary Wallet Address</label>
                <input
                  type="text"
                  placeholder="0x... (Sui wallet address)"
                  value={form.beneficiary}
                  onChange={e => update('beneficiary', e.target.value)}
                  className="bg-transparent border border-red-900/30 focus:border-red-500/50 text-white px-4 py-3 font-mono text-sm focus:outline-none transition-colors placeholder:text-zinc-800"
                />
                <p className="text-xs text-zinc-700 font-mono">This address receives everything when the switch triggers.</p>
              </div>
            </div>

            <button
              onClick={() => isStep1Valid && setStep(2)}
              disabled={!isStep1Valid}
              className="self-start px-10 py-3 font-mono text-sm tracking-widest uppercase transition-all border"
              style={{
                background: isStep1Valid ? 'rgba(255,32,32,0.08)' : 'transparent',
                borderColor: isStep1Valid ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.06)',
                color: isStep1Valid ? '#f87171' : '#27272a',
                cursor: isStep1Valid ? 'pointer' : 'not-allowed',
              }}
            >
              → Continue
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            <div>
              <p className="text-xs text-red-500/50 font-mono tracking-widest uppercase mb-2">// Step 02</p>
              <h1 className="text-4xl font-black text-white mb-2">Set the Silence Threshold</h1>
              <p className="text-zinc-600 text-sm font-mono">How long must you be silent before it triggers?</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {TIMER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => update('timerDays', opt.value)}
                  className="p-5 border text-left transition-all cursor-pointer group"
                  style={{
                    borderColor: form.timerDays === opt.value ? 'rgba(239,68,68,0.6)' : 'rgba(255,32,32,0.12)',
                    background: form.timerDays === opt.value ? 'rgba(255,32,32,0.08)' : 'transparent',
                  }}
                >
                  <div className="text-xl font-black font-mono text-red-400 mb-1">{opt.label}</div>
                  <div className="text-xs text-zinc-600 group-hover:text-zinc-500 transition-colors">{opt.desc}</div>
                  {form.timerDays === opt.value && (
                    <div className="mt-3 text-xs text-red-500/50 font-mono">// SELECTED</div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-6 py-3 font-mono text-sm tracking-widest uppercase border border-zinc-900 text-zinc-700 hover:border-zinc-700 hover:text-zinc-500 transition-all cursor-pointer">
                ← Back
              </button>
              <button onClick={() => setStep(3)} className="px-10 py-3 font-mono text-sm tracking-widest uppercase border border-red-500/40 text-red-400 hover:bg-red-950/20 transition-all cursor-pointer">
                → Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            <div>
              <p className="text-xs text-red-500/50 font-mono tracking-widest uppercase mb-2">// Step 03</p>
              <h1 className="text-4xl font-black text-white mb-2">Final Transmission</h1>
              <p className="text-zinc-600 text-sm font-mono">Your last words. Optional, but permanent.</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-red-400/60 font-mono tracking-widest uppercase">Message to Beneficiary</label>
              <textarea
                rows={5}
                placeholder="If you're reading this, I didn't make it back from the Frontier..."
                value={form.message}
                onChange={e => update('message', e.target.value)}
                className="bg-transparent border border-red-900/30 focus:border-red-500/50 text-white px-4 py-3 font-mono text-sm focus:outline-none transition-colors placeholder:text-zinc-800 resize-none"
              />
            </div>

            {/* Summary card */}
            <div className="border border-red-900/25 bg-red-950/8 p-6 font-mono text-sm space-y-3">
              <div className="text-xs text-red-500/40 tracking-widest uppercase mb-4">// Switch Summary</div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                <span className="text-zinc-600">Character</span>
                <span className="text-white">{form.characterName}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                <span className="text-zinc-600">Beneficiary</span>
                <span className="text-zinc-400 text-xs">{form.beneficiary.slice(0, 10)}...{form.beneficiary.slice(-6)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                <span className="text-zinc-600">Trigger After</span>
                <span className="text-red-400 font-black">{form.timerDays} days of silence</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-zinc-600">Status</span>
                <span className="text-yellow-500/70">PENDING ARM</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-6 py-3 font-mono text-sm tracking-widest uppercase border border-zinc-900 text-zinc-700 hover:border-zinc-700 hover:text-zinc-500 transition-all cursor-pointer">
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-4 font-mono text-sm tracking-widest uppercase border border-red-500/50 text-red-400 hover:bg-red-950/20 transition-all cursor-pointer relative overflow-hidden group"
                style={{ boxShadow: '0 0 30px rgba(255,32,32,0.1)' }}
              >
                <span className="relative z-10">⚡ ARM THE SWITCH</span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                  background: 'radial-gradient(ellipse at center, rgba(255,32,32,0.08) 0%, transparent 70%)'
                }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}