'use client';
import { buildCreateSwitch, getFirstCoin } from '@/lib/contract';
import { useSendTx } from '@/hooks/useSendTX';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@mysten/dapp-kit';
import { NavLogo } from '@/components/NavLogo';

const TIMER_OPTIONS = [
  { label: '3 Days', value: 3, desc: 'High alert. For active pilots.' },
  { label: '7 Days', value: 7, desc: 'Standard. One week of silence.' },
  { label: '14 Days', value: 14, desc: 'Patient. Two weeks before trigger.' },
  { label: '30 Days', value: 30, desc: 'Final resort. A month of void.' },
];

const DEPOSIT_OPTIONS = [
  { label: '1 SUI', value: 1 },
  { label: '5 SUI', value: 5 },
  { label: '10 SUI', value: 10 },
  { label: 'Custom', value: 0 },
];

export default function CreateSwitch() {
  const { sendTx } = useSendTx();
  const { isAuthenticated, loginWithPrivy, address } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [armed, setArmed] = useState(false);
  const [customDeposit, setCustomDeposit] = useState('');
  const [selectedDeposit, setSelectedDeposit] = useState(1);
  const [form, setForm] = useState({
    characterName: '',
    beneficiary: '',
    message: '',
    timerDays: 7,
  });

  const update = (field: string, value: string | number) =>
    setForm(f => ({ ...f, [field]: value }));

  const isStep1Valid = form.characterName.trim().length > 0 && form.beneficiary.trim().length > 5;
  const finalDeposit = selectedDeposit === 0 ? parseFloat(customDeposit || '0') : selectedDeposit;

  const handleSubmit = async () => {
    if (!address) { alert('Connect your Slush wallet first!'); return; }
    setIsSubmitting(true);
    try {
      const coinObjectId = await getFirstCoin(address);
      if (!coinObjectId) throw new Error('No SUI found. Get testnet SUI from faucet.sui.io');
      const tx = buildCreateSwitch({
        beneficiary: form.beneficiary,
        timerDays: form.timerDays,
        coinObjectId,
        depositAmountSui: finalDeposit,
        characterName: form.characterName,
        lastMessage: form.message,
      });
      const result = await sendTx(tx);
      const event = (result.events ?? []).find((e: any) => e.type.includes('SwitchCreated'));
      console.log('Switch created! ID:', (event?.parsedJson as any)?.switch_id);
      setArmed(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: any) {
      console.error(err);
      alert(`Failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
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
          <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase mb-8">Authentication required</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex flex-col items-center gap-2">
            <ConnectButton
              style={{
                background: 'transparent',
                border: '1px solid rgba(239,68,68,0.4)',
                color: '#f87171',
                fontSize: '12px',
                padding: '12px 32px',
                fontFamily: 'monospace',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                minWidth: '180px',
                borderRadius: '0',
              }}
            />
            <span className="text-xs text-zinc-700 font-mono">// Sui Wallet</span>
          </div>
          <span className="text-zinc-800 font-mono">or</span>
          <div className="flex flex-col items-center gap-2">
            <button onClick={loginWithPrivy} className="px-8 py-3 font-mono text-sm tracking-widest uppercase border border-red-500/40 text-red-400 hover:bg-red-950/20 transition-all min-w-[180px]">
              → Via Privy
            </button>
            <span className="text-xs text-zinc-700 font-mono">// No wallet needed</span>
          </div>
        </div>
      </main>
    );
  }

  if (armed) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
        <div className="text-7xl animate-pulse">⚡</div>
        <div className="text-center">
          <p className="text-red-400 font-mono text-xl tracking-widest uppercase font-black mb-2">Switch Armed</p>
          <p className="text-zinc-600 font-mono text-xs tracking-widest">{finalDeposit} SUI locked · Redirecting...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden"
      style={{
        backgroundImage: 'linear-gradient(rgba(255,32,32,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,32,32,0.03) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }}>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,20,20,0.05) 0%, transparent 65%)' }} />

      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-red-900/20">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="text-xs text-zinc-600 font-mono tracking-widest uppercase hover:text-zinc-400 transition-colors">← Home</button>
          <span className="text-zinc-800 font-mono text-xs">·</span>
          <NavLogo />
          <span className="text-zinc-800 font-mono text-xs">·</span>
          <button onClick={() => router.push('/dashboard')} className="text-xs text-zinc-700 font-mono tracking-widest uppercase hover:text-zinc-500 transition-colors">Dashboard</button>
        </div>
        <div className="flex gap-1.5 items-center">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full border flex items-center justify-center text-xs font-mono transition-all duration-300" style={{
                borderColor: s <= step ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.08)',
                background: s < step ? 'rgba(239,68,68,0.2)' : s === step ? 'rgba(239,68,68,0.1)' : 'transparent',
                color: s <= step ? '#f87171' : '#3f3f46',
              }}>
                {s < step ? '✓' : s}
              </div>
              {s < 4 && <div className="w-4 h-px" style={{ background: s < step ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.06)' }} />}
            </div>
          ))}
        </div>
      </nav>

      <div className="relative z-10 max-w-xl mx-auto px-6 py-16">

        {step === 1 && (
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-xs text-red-500/40 font-mono tracking-widest uppercase mb-2">// Step 01 — Identity</p>
              <h1 className="text-4xl font-black text-white mb-2">Identify Your Legacy</h1>
              <p className="text-zinc-600 text-sm font-mono">Who are you, and who do you trust with everything?</p>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-red-400/50 font-mono tracking-widest uppercase">EVE Character Name</label>
                <input type="text" placeholder="e.g. Theodhore Vayne" value={form.characterName}
                  onChange={e => update('characterName', e.target.value)}
                  className="bg-transparent border border-red-900/25 focus:border-red-500/40 text-white px-4 py-3 font-mono text-sm focus:outline-none transition-colors placeholder:text-zinc-800" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-red-400/50 font-mono tracking-widest uppercase">Beneficiary Wallet Address</label>
                <input type="text" placeholder="0x... (Sui wallet address)" value={form.beneficiary}
                  onChange={e => update('beneficiary', e.target.value)}
                  className="bg-transparent border border-red-900/25 focus:border-red-500/40 text-white px-4 py-3 font-mono text-sm focus:outline-none transition-colors placeholder:text-zinc-800" />
                <p className="text-xs text-zinc-700 font-mono">This address receives your SUI deposit when the switch triggers.</p>
              </div>
            </div>
            <button onClick={() => isStep1Valid && setStep(2)} disabled={!isStep1Valid}
              className="self-start px-10 py-3 font-mono text-sm tracking-widest uppercase transition-all border"
              style={{
                background: isStep1Valid ? 'rgba(255,32,32,0.08)' : 'transparent',
                borderColor: isStep1Valid ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.05)',
                color: isStep1Valid ? '#f87171' : '#27272a',
                cursor: isStep1Valid ? 'pointer' : 'not-allowed',
              }}>→ Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-xs text-red-500/40 font-mono tracking-widest uppercase mb-2">// Step 02 — Threshold</p>
              <h1 className="text-4xl font-black text-white mb-2">Set the Silence Threshold</h1>
              <p className="text-zinc-600 text-sm font-mono">How long must you be silent before it triggers?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {TIMER_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => update('timerDays', opt.value)}
                  className="p-5 border text-left transition-all cursor-pointer"
                  style={{
                    borderColor: form.timerDays === opt.value ? 'rgba(239,68,68,0.5)' : 'rgba(255,32,32,0.1)',
                    background: form.timerDays === opt.value ? 'rgba(255,32,32,0.08)' : 'transparent',
                  }}>
                  <div className="text-xl font-black font-mono text-red-400 mb-1">{opt.label}</div>
                  <div className="text-xs text-zinc-600">{opt.desc}</div>
                  {form.timerDays === opt.value && <div className="mt-2 text-xs text-red-500/40 font-mono">// SELECTED</div>}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-6 py-3 font-mono text-sm tracking-widest uppercase border border-zinc-900 text-zinc-700 hover:border-zinc-700 transition-all">← Back</button>
              <button onClick={() => setStep(3)} className="px-10 py-3 font-mono text-sm tracking-widest uppercase border border-red-500/40 text-red-400 hover:bg-red-950/20 transition-all">→ Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-xs text-red-500/40 font-mono tracking-widest uppercase mb-2">// Step 03 — Escrow</p>
              <h1 className="text-4xl font-black text-white mb-2">Lock Your Deposit</h1>
              <p className="text-zinc-600 text-sm font-mono">SUI locked in smart contract. Released to beneficiary on trigger.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {DEPOSIT_OPTIONS.map(opt => (
                <button key={opt.label} onClick={() => setSelectedDeposit(opt.value)}
                  className="p-5 border text-left transition-all cursor-pointer"
                  style={{
                    borderColor: selectedDeposit === opt.value ? 'rgba(239,68,68,0.5)' : 'rgba(255,32,32,0.1)',
                    background: selectedDeposit === opt.value ? 'rgba(255,32,32,0.08)' : 'transparent',
                  }}>
                  <div className="text-xl font-black font-mono text-red-400 mb-1">{opt.label}</div>
                  {selectedDeposit === opt.value && <div className="mt-1 text-xs text-red-500/40 font-mono">// SELECTED</div>}
                </button>
              ))}
            </div>
            {selectedDeposit === 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-xs text-red-400/50 font-mono tracking-widest uppercase">Custom Amount (SUI)</label>
                <input type="number" min="0.1" step="0.1" placeholder="e.g. 2.5" value={customDeposit}
                  onChange={e => setCustomDeposit(e.target.value)}
                  className="bg-transparent border border-red-900/25 focus:border-red-500/40 text-white px-4 py-3 font-mono text-sm focus:outline-none transition-colors placeholder:text-zinc-800" />
              </div>
            )}
            <div className="border border-yellow-900/30 bg-yellow-950/10 px-5 py-4">
              <p className="text-xs text-yellow-500/60 font-mono leading-relaxed">
                ⚠ This SUI will be locked in escrow. Only returned if you disarm before timer expires.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-6 py-3 font-mono text-sm tracking-widest uppercase border border-zinc-900 text-zinc-700 hover:border-zinc-700 transition-all">← Back</button>
              <button onClick={() => finalDeposit > 0 && setStep(4)} disabled={finalDeposit <= 0}
                className="px-10 py-3 font-mono text-sm tracking-widest uppercase transition-all border"
                style={{
                  borderColor: finalDeposit > 0 ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.05)',
                  color: finalDeposit > 0 ? '#f87171' : '#27272a',
                  background: finalDeposit > 0 ? 'rgba(255,32,32,0.08)' : 'transparent',
                  cursor: finalDeposit > 0 ? 'pointer' : 'not-allowed',
                }}>→ Continue</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-xs text-red-500/40 font-mono tracking-widest uppercase mb-2">// Step 04 — Final Transmission</p>
              <h1 className="text-4xl font-black text-white mb-2">Last Words</h1>
              <p className="text-zinc-600 text-sm font-mono">Your final message. Stored on-chain forever.</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-red-400/50 font-mono tracking-widest uppercase">Message to Beneficiary <span className="text-zinc-700">(optional)</span></label>
              <textarea rows={4} placeholder="If you're reading this, I didn't make it back from the Frontier..."
                value={form.message} onChange={e => update('message', e.target.value)}
                className="bg-transparent border border-red-900/25 focus:border-red-500/40 text-white px-4 py-3 font-mono text-sm focus:outline-none transition-colors placeholder:text-zinc-800 resize-none" />
            </div>
            <div className="border border-red-900/20 bg-red-950/5 p-6 font-mono text-sm">
              <div className="text-xs text-red-500/30 tracking-widest uppercase mb-4">// Switch Summary</div>
              {[
                { label: 'Character', value: form.characterName },
                { label: 'Beneficiary', value: `${form.beneficiary.slice(0, 10)}...${form.beneficiary.slice(-6)}` },
                { label: 'Trigger After', value: `${form.timerDays} days of silence` },
                { label: 'SUI Deposit', value: `${finalDeposit} SUI` },
                { label: 'Status', value: 'PENDING ARM' },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-zinc-900/80 last:border-0">
                  <span className="text-zinc-600">{row.label}</span>
                  <span className={
                    row.label === 'SUI Deposit' ? 'text-yellow-400 font-black' :
                      row.label === 'Trigger After' ? 'text-red-400' :
                        row.label === 'Status' ? 'text-yellow-500/60' : 'text-white'
                  }>{row.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="px-6 py-3 font-mono text-sm tracking-widest uppercase border border-zinc-900 text-zinc-700 hover:border-zinc-700 transition-all">← Back</button>
              <button onClick={handleSubmit} disabled={isSubmitting}
                className="flex-1 py-4 font-mono text-sm tracking-widest uppercase border border-red-500/50 text-red-400 hover:bg-red-950/20 transition-all disabled:opacity-50"
                style={{ boxShadow: '0 0 40px rgba(255,32,32,0.1)' }}>
                {isSubmitting ? '⏳ SENDING TO BLOCKCHAIN...' : `⚡ ARM THE SWITCH · LOCK ${finalDeposit} SUI`}
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}