# ☠️ Dead Man's Switch — EVE Frontier Hackathon 2026

> *"In the void between stars, death comes without warning."*

A decentralized dead man's switch for EVE Frontier pilots. If you go silent — your assets, your legacy, your last words — delivered automatically.

🔗 **Live Demo:** https://dead-mans-switch-gilt.vercel.app

---

## 🎯 What It Does

Dead Man's Switch lets EVE Frontier players create an automated "final transmission" — a digital will that executes if they disappear beyond a set threshold.

1. **Set Your Switch** — Define a beneficiary wallet, a timeout duration, and an optional last message
2. **Stay Active** — As long as you check in, nothing happens
3. **Trigger on Silence** — If you go dark beyond the threshold, your instructions execute automatically

---

## ✨ Features

- 🔐 **Privy Auth** — Login via email, Google, or crypto wallet. No extension required
- 🔗 **Sui Blockchain Integration** — Real on-chain activity detection via Sui RPC
- ⏱️ **Configurable Timer** — 3, 7, 14, or 30 days of silence before trigger
- 📡 **Mission Control Dashboard** — Live countdown, danger indicators, check-in system
- 🌑 **EVE Frontier UI** — Dark, atmospheric, lore-accurate design
- ⚡ **Auto Check-in Detection** — Reads wallet's last on-chain transaction timestamp

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Auth & Wallet | Privy |
| Blockchain | Sui Mainnet (via JSON-RPC) |
| Sui SDK | @mysten/dapp-kit + @mysten/sui |
| Styling | Tailwind CSS |
| Deployment | Vercel |

---

## 🚀 Run Locally
```bash
git clone https://github.com/theodhorex/dead-man-switch
cd dead-man-switch
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏆 Hackathon Track

**Weirdest Idea** — A digital last will for space pilots. Dark, unique, and deeply aligned with EVE Frontier's brutal lore where death is permanent and assets matter.

---

## 🔮 Roadmap (Post-Hackathon)

- [ ] On-chain storage of switches (Move smart contract on Sui)
- [ ] NFT-based "Last Will" certificates
- [ ] Auto-trigger via Sui automation / cron oracle
- [ ] Multi-beneficiary support
- [ ] EVE Frontier API integration for in-game activity detection

---