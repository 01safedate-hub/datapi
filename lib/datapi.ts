export const MINE_COOLDOWN_MS = 24 * 60 * 60 * 1000
export const BASE_YIELD = 250

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

export type Booster = {
  id: string
  name: string
  codename: string
  description: string
  /** Multiplier added to the mining rate, e.g. 0.25 => +25% */
  power: number
  cost: number
  rarity: Rarity
  maxStack: number
}

export const BOOSTERS: Booster[] = [
  {
    id: 'coolant',
    name: 'Cryo Coolant',
    codename: 'CRY-01',
    description: 'Sub-zero loop keeps the core stable under sustained load.',
    power: 0.15,
    cost: 400,
    rarity: 'common',
    maxStack: 10,
  },
  {
    id: 'overclock',
    name: 'Overclock Chip',
    codename: 'OVC-22',
    description: 'Pushes clock cycles past factory limits. Runs hot, pays well.',
    power: 0.35,
    cost: 1200,
    rarity: 'rare',
    maxStack: 8,
  },
  {
    id: 'quantum',
    name: 'Quantum Lattice',
    codename: 'QNT-77',
    description: 'Parallel hash resolution across superposed states.',
    power: 0.8,
    cost: 3600,
    rarity: 'epic',
    maxStack: 5,
  },
  {
    id: 'singularity',
    name: 'Singularity Core',
    codename: 'SNG-∞',
    description: 'Folds the datastream in on itself. Yield becomes absurd.',
    power: 2.5,
    cost: 12000,
    rarity: 'legendary',
    maxStack: 3,
  },
]

export const RARITY_STYLES: Record<
  Rarity,
  { label: string; text: string; border: string; glow: string; bg: string }
> = {
  common: {
    label: 'COMMON',
    text: 'text-muted-foreground',
    border: 'border-muted-foreground/30',
    glow: 'oklch(0.7 0.03 240 / 25%)',
    bg: 'bg-muted-foreground/10',
  },
  rare: {
    label: 'RARE',
    text: 'text-primary',
    border: 'border-primary/40',
    glow: 'oklch(0.82 0.16 195 / 35%)',
    bg: 'bg-primary/10',
  },
  epic: {
    label: 'EPIC',
    text: 'text-accent',
    border: 'border-accent/40',
    glow: 'oklch(0.82 0.16 78 / 35%)',
    bg: 'bg-accent/10',
  },
  legendary: {
    label: 'LEGENDARY',
    text: 'text-destructive',
    border: 'border-destructive/50',
    glow: 'oklch(0.64 0.2 22 / 40%)',
    bg: 'bg-destructive/10',
  },
}

export type GameState = {
  balance: number
  credits: number
  lastMinedAt: number | null
  owned: Record<string, number>
  totalMined: number
  streak: number
  xp: number
}

export const INITIAL_STATE: GameState = {
  balance: 1840,
  credits: 5000,
  lastMinedAt: null,
  owned: {},
  totalMined: 4,
  streak: 3,
  xp: 620,
}

/** Total mining multiplier from all owned boosters. */
export function miningRate(owned: Record<string, number>): number {
  return BOOSTERS.reduce((rate, b) => rate + (owned[b.id] ?? 0) * b.power, 1)
}

export function yieldFor(owned: Record<string, number>, streak: number): number {
  const streakBonus = 1 + Math.min(streak, 30) * 0.02
  return Math.floor(BASE_YIELD * miningRate(owned) * streakBonus)
}

export function levelFromXp(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1
  const curFloor = (level - 1) ** 2 * 100
  const nextFloor = level ** 2 * 100
  return {
    level,
    progress: (xp - curFloor) / (nextFloor - curFloor),
    toNext: nextFloor - xp,
  }
}

export function formatNum(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 10_000) return `${(n / 1000).toFixed(1)}K`
  return Math.floor(n).toLocaleString('en-US')
}

export function formatCountdown(ms: number): { h: string; m: string; s: string } {
  const clamped = Math.max(0, ms)
  const totalSec = Math.ceil(clamped / 1000)
  return {
    h: String(Math.floor(totalSec / 3600)).padStart(2, '0'),
    m: String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0'),
    s: String(totalSec % 60).padStart(2, '0'),
  }
}

export const CREDIT_PACKS = [
  { id: 'p1', credits: 2500, price: '2.99', bonus: 0, tag: null },
  { id: 'p2', credits: 8000, price: '7.99', bonus: 12, tag: 'POPULAR' },
  { id: 'p3', credits: 25000, price: '19.99', bonus: 25, tag: 'BEST VALUE' },
]
