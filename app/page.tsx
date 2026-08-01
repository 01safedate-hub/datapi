'use client'

import { BoostShop } from '@/components/boost-shop'
import { CreditStore } from '@/components/credit-store'
import { FxBackground } from '@/components/fx-background'
import { Counter, Equalizer, GlitchText, Panel, SectionTitle, Stat } from '@/components/hud'
import { EventTicker, Leaderboard } from '@/components/live-feed'
import { MiningCore } from '@/components/mining-core'
import {
  INITIAL_STATE,
  MINE_COOLDOWN_MS,
  type Booster,
  type GameState,
  formatNum,
  levelFromXp,
  miningRate,
  yieldFor,
} from '@/lib/datapi'
import { cn } from '@/lib/utils'
import { Activity, Coins, Cpu, Flame, Gauge, Layers, Trophy } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

type Floater = { id: number; text: string; accent?: boolean }
type Toast = { id: number; title: string; body: string }

export default function Page() {
  const [state, setState] = useState<GameState>(INITIAL_STATE)
  // Starts at 0 so the server and client agree on the first render; the real
  // clock is set once we're mounted on the client.
  const [now, setNow] = useState(0)
  const [mining, setMining] = useState(false)
  const [shake, setShake] = useState(false)
  const [floaters, setFloaters] = useState<Floater[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  const [booted, setBooted] = useState(false)
  const idRef = useRef(0)

  /* ---------------- clock ---------------- */
  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  /* ---------------- boot-in ---------------- */
  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 60)
    return () => clearTimeout(t)
  }, [])

  const pushFloater = useCallback((text: string, accent?: boolean) => {
    const id = ++idRef.current
    setFloaters((f) => [...f, { id, text, accent }])
    setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 1500)
  }, [])

  const pushToast = useCallback((title: string, body: string) => {
    const id = ++idRef.current
    setToasts((t) => [...t, { id, title, body }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400)
  }, [])

  /* ---------------- derived ---------------- */
  const elapsed = state.lastMinedAt === null ? MINE_COOLDOWN_MS : now - state.lastMinedAt
  const remaining = Math.max(0, MINE_COOLDOWN_MS - elapsed)
  const ready = remaining === 0
  const progress = ready ? 1 : elapsed / MINE_COOLDOWN_MS
  const rate = miningRate(state.owned)
  const potential = yieldFor(state.owned, state.streak)
  const { level, progress: xpProgress, toNext } = levelFromXp(state.xp)
  const modules = Object.values(state.owned).reduce((a, b) => a + b, 0)

  /* ---------------- actions ---------------- */
  const handleMine = useCallback(() => {
    if (!ready || mining) return
    const gained = potential

    setMining(true)
    setShake(true)
    setTimeout(() => setShake(false), 520)

    pushFloater(`+${formatNum(gained)} DPI`)
    setTimeout(() => pushFloater(`+${Math.floor(gained / 8)} XP`, true), 200)

    setTimeout(() => {
      setState((s) => ({
        ...s,
        balance: s.balance + gained,
        lastMinedAt: Date.now(),
        totalMined: s.totalMined + 1,
        streak: s.streak + 1,
        xp: s.xp + Math.floor(gained / 8),
      }))
      setMining(false)
      pushToast('EXTRACTION COMPLETE', `${formatNum(gained)} DPI secured. Core recharging.`)
    }, 900)
  }, [ready, mining, potential, pushFloater, pushToast])

  const handleBuyBooster = useCallback(
    (b: Booster) => {
      const count = state.owned[b.id] ?? 0
      if (count >= b.maxStack || state.credits < b.cost) return

      setState((s) => ({
        ...s,
        credits: s.credits - b.cost,
        owned: { ...s.owned, [b.id]: (s.owned[b.id] ?? 0) + 1 },
      }))
      pushFloater(`+${Math.round(b.power * 100)}% RATE`, true)
      pushToast('MODULE INSTALLED', `${b.name} online. Rate +${Math.round(b.power * 100)}%.`)
    },
    [state.owned, state.credits, pushFloater, pushToast],
  )

  const handleBuyCredits = useCallback(
    (credits: number) => {
      setState((s) => ({ ...s, credits: s.credits + credits }))
      pushToast('CREDITS ADDED', `${formatNum(credits)} CR loaded into your wallet.`)
    },
    [pushToast],
  )

  return (
    <div
      className="relative min-h-svh"
      style={shake ? { animation: 'dp-shake 0.5s ease-in-out' } : undefined}
    >
      <FxBackground intensity={mining ? 3 : 1} />

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center bg-primary/15 dp-clip-hex">
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-primary/20 dp-clip-hex"
                style={{ animation: 'dp-pulse-glow 2.8s ease-in-out infinite' }}
              />
              <Cpu className="relative h-4 w-4 text-primary" />
            </span>
            <div>
              <GlitchText className="text-base font-black tracking-[0.18em]">DATAPI</GlitchText>
              <p className="font-display text-[8px] tracking-[0.24em] text-muted-foreground uppercase">
                Mining Protocol
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Panel className="flex items-center gap-1.5 px-2.5 py-1.5">
              <Coins className="h-3.5 w-3.5 text-accent" />
              <Counter
                value={state.credits}
                format={formatNum}
                className="font-display text-xs font-bold text-accent"
              />
              <span className="font-display text-[9px] text-muted-foreground">CR</span>
            </Panel>
            <Equalizer className="hidden sm:flex" />
          </div>
        </div>
      </header>

      <EventTicker />

      {/* ================= MAIN ================= */}
      <main
        className={cn(
          'relative z-10 mx-auto max-w-5xl px-4 pb-16 transition-all duration-700',
          booted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        )}
      >
        {/* ---------- holdings ---------- */}
        <section className="pt-7 pb-2 text-center">
          <p className="font-display text-[9px] tracking-[0.28em] text-muted-foreground uppercase">
            Total Holdings
          </p>
          <div className="mt-1.5 flex items-baseline justify-center gap-2">
            <Counter
              value={state.balance}
              format={formatNum}
              className="font-display text-5xl font-black tracking-tight sm:text-6xl"
            />
            <span className="font-display text-lg font-bold text-primary">DPI</span>
          </div>

          <div className="mx-auto mt-4 max-w-xs">
            <div className="mb-1 flex items-center justify-between font-display text-[9px] tracking-[0.14em] text-muted-foreground">
              <span className="text-primary">LVL {level}</span>
              <span>{formatNum(toNext)} XP TO NEXT</span>
            </div>
            <div className="relative h-1.5 overflow-hidden bg-muted">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent transition-[width] duration-700 ease-out"
                style={{
                  width: `${Math.max(3, xpProgress * 100)}%`,
                  boxShadow: '0 0 10px oklch(0.82 0.16 195 / 70%)',
                }}
              />
              <span
                aria-hidden="true"
                className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-foreground/40 to-transparent"
                style={{ animation: 'dp-shine 2.6s ease-in-out infinite' }}
              />
            </div>
          </div>
        </section>

        {/* ---------- reactor ---------- */}
        <section className="relative py-4">
          <MiningCore
            ready={ready}
            remaining={remaining}
            progress={progress}
            potentialYield={potential}
            rate={rate}
            mining={mining}
            onMine={handleMine}
          />

          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 z-20">
            {floaters.map((f) => (
              <span
                key={f.id}
                className={cn(
                  'absolute left-1/2 font-display text-xl font-black whitespace-nowrap',
                  f.accent ? 'text-accent' : 'text-primary',
                )}
                style={{
                  animation: 'dp-float-up 1.5s ease-out forwards',
                  filter: 'drop-shadow(0 0 10px oklch(0.82 0.16 195 / 60%))',
                }}
              >
                {f.text}
              </span>
            ))}
          </div>

          <p
            aria-live="polite"
            className="mt-2 text-center font-display text-[10px] tracking-[0.18em] text-muted-foreground uppercase"
          >
            {ready ? 'Datastream aligned — extraction available' : 'Core cooling down'}
          </p>
        </section>

        {/* ---------- stats ---------- */}
        <section className="grid grid-cols-2 gap-2.5 pt-2 sm:grid-cols-4">
          <Stat label="Hash Rate" icon={<Gauge className="h-3 w-3" />}>
            ×<Counter value={rate} format={(n) => n.toFixed(2)} />
          </Stat>
          <Stat label="Streak" accent icon={<Flame className="h-3 w-3" />}>
            <Counter value={state.streak} />d
          </Stat>
          <Stat label="Extractions" icon={<Activity className="h-3 w-3" />}>
            <Counter value={state.totalMined} />
          </Stat>
          <Stat label="Modules" icon={<Layers className="h-3 w-3" />}>
            <Counter value={modules} />
          </Stat>
        </section>

        {/* ---------- boost modules ---------- */}
        <section className="pt-9">
          <SectionTitle
            title="Boost Modules"
            sub="Install hardware to permanently raise your extraction rate"
            right={
              <span className="shrink-0 font-display text-[10px] tracking-wide text-muted-foreground">
                RATE ×<span className="font-bold text-primary">{rate.toFixed(2)}</span>
              </span>
            }
          />
          <BoostShop owned={state.owned} credits={state.credits} onBuy={handleBuyBooster} />
        </section>

        {/* ---------- credit packs ---------- */}
        <section className="pt-9">
          <SectionTitle title="Credit Packs" sub="Top up credits to install more modules" />
          <CreditStore onBuy={handleBuyCredits} />
        </section>

        {/* ---------- leaderboard ---------- */}
        <section className="pt-9">
          <SectionTitle
            title="Global Hashrate"
            sub="Top operators on the network"
            right={<Trophy className="h-3.5 w-3.5 shrink-0 text-accent" />}
          />
          <Leaderboard you={state.balance} />
        </section>

        <p className="mt-10 text-center font-display text-[9px] tracking-[0.2em] text-muted-foreground/60 uppercase">
          Datapi Protocol — Simulated Environment
        </p>
      </main>

      {/* ================= TOASTS ================= */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <Panel key={t.id} glow className="w-full max-w-sm px-3 py-2.5">
            <div
              className="flex items-center gap-2.5"
              style={{ animation: 'dp-rise 0.35s ease-out both' }}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-primary/15 dp-clip-hex">
                <Cpu className="h-3.5 w-3.5 text-primary" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-[10px] font-bold tracking-[0.14em] text-primary">
                  {t.title}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">{t.body}</p>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  )
}
