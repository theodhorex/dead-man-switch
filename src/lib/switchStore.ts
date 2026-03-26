export interface DeadSwitch {
  id: string;
  characterName: string;
  beneficiary: string;
  message: string;
  timerDays: number;
  depositAmount: number;
  createdAt: string;
  lastSeen: string;
  status: 'ARMED' | 'DANGER' | 'TRIGGERED';
  owner: string;
}

const KEY = 'dms_switches';

export const switchStore = {
  getAll(): DeadSwitch[] {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  },

  getByOwner(address: string): DeadSwitch[] {
    return this.getAll().filter(s => s.owner === address);
  },

  create(data: Omit<DeadSwitch, 'id' | 'createdAt' | 'lastSeen' | 'status'>): DeadSwitch {
    const sw: DeadSwitch = {
      ...data,
      id: `sw_${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      status: 'ARMED',
    };
    const all = this.getAll();
    all.push(sw);
    localStorage.setItem(KEY, JSON.stringify(all));
    return sw;
  },

  checkIn(id: string): void {
    const all = this.getAll().map(s =>
      s.id === id ? { ...s, lastSeen: new Date().toISOString(), status: 'ARMED' as const } : s
    );
    localStorage.setItem(KEY, JSON.stringify(all));
  },

  delete(id: string): void {
    const all = this.getAll().filter(s => s.id !== id);
    localStorage.setItem(KEY, JSON.stringify(all));
  },

  computeStatus(sw: DeadSwitch): 'ARMED' | 'DANGER' | 'TRIGGERED' {
    const elapsed = (Date.now() - new Date(sw.lastSeen).getTime()) / (1000 * 60 * 60 * 24);
    if (elapsed >= sw.timerDays) return 'TRIGGERED';
    if (elapsed >= sw.timerDays * 0.7) return 'DANGER';
    return 'ARMED';
  },

  getDaysRemaining(sw: DeadSwitch): number {
    const elapsed = (Date.now() - new Date(sw.lastSeen).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, sw.timerDays - elapsed);
  },
};