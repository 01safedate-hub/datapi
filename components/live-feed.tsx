'use client'

import { Panel } from '@/components/hud'
import { formatNum } from '@/lib/datapi'
import { cn } from '@/lib/utils'
import { Crown, Radio } from 'lucide-react'
import { useEffect, useState } from 'react'

const HANDLES = [
  'v0id_runner',
  'hexcalibur',
  'null_ptr',
  'zer0cool',
  'ghostbyte',
  'neon_ronin',
  'sh4dowfax',
  'quantum_kid',
  'bitwraith',
  'axiom_09',
]

/**
 * Static event list. These are intentionally hardcoded rather than randomised
 * so the server and client render byte-identical HTML (no hydration mismatch).
 */
const TICKER_EVENTS = [
  { user: HANDLES[0], amount: 8029 },
  { user: HANDLES[1], amount: 3084 },
  { user: HANDLES[2], amount: 5417 },
  { user: HANDLES[3], amount: 1962 },
  { user: HANDLES[4], amount: 7305 },
  { user: HANDLES[5], amount: 2648 },
  { user: HANDLES[6], amount: 6193 },
  { user: HANDLES[7], amount: 4471 },
] as const

/* ------------------------------------------------------------------ *
 *  Scrolling marquee of global mining events
 * ------------------------------------------------------------------ */
export function EventTicker() {
  const events = TICKER_EVENTS

  const row = (
    <div className="flex shrink-0 items-center gap-8 pr-8">
      {events.map((e, i) => (
        <span key={i} className="flex shrink-0 items-center gap-1.5 text-[11px] whitespace-nowrap">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
            style={{ animation: 'dp-blink 1.2s ease-in-out infinite' }}
          />
          <span className="font-display tracking-wide text-muted-foreground">{e.user}</span>
          <span className="text-muted-foreground">mined</span>
          <span className="tnum font-display font-bold text-primary">
            +{formatNum(e.amount)} DPI
          </span>
        </span>
      ))}
    </div>
  )

  return (
    <div className="relative flex items-center gap-2 overflow-hidden border-y border-border bg-card/40 py-2 backdrop-blur-sm">
      <span className="flex shrink-0 items-center gap-1.5 border-r border-border pr-2 pl-3 font-display text-[9px] font-bold tracking-[0.16em] text-accent">
        <Radio className="h-3 w-3" style={{ animation: 'dp-blink 1.6s ease-in-out infinite' }} />
        LIVE
      </span>
      <div className="flex overflow-hidden">
        <div className="flex" style={{ animation: 'dp-marquee 26s linear infinite' }}>
          {row}
          {row}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 *  Global hashrate leaderboard
 * ------------------------------------------------------------------ */
export function Leaderboard({ you }: { you: number }) {
  const [rows, setRows] = useState<{ user: string; score: number }[]>(() => [
    { user: HANDLES[0], score: 99842 },
    { user: HANDLES[1], score: 86930 },
    { user: HANDLES[2], score: 74215 },
    { user: HANDLES[3], score: 61508 },
    { user: HANDLES[4], score: 49377 },
    { user: HANDLES[5], score: 36104 },
  ])

  // Rivals keep grinding — small live score drift
  useEffect(() => {
    const id = setInterval(() => {
      setRows((prev) =>
        [...prev]
          .map((r) => ({ ...r, score: r.score + Math.floor(Math.random() * 320) }))
          .sort((a, b) => b.score - a.score),
      )
    }, 3200)
    return () => clearInterval(id)
  }, [])

  const all = [...rows, { user: 'YOU', score: you }].sort((a, b) => b.score - a.score)

  return (
    <Panel className="divide-y divide-border">
      {all.map((r, i) => {
        const isYou = r.user === 'YOU'
        return (
          <div
            key={r.user}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 transition-colors',
              isYou && 'bg-primary/10',
            )}
          >
            <span
              className={cn(
                'tnum flex h-6 w-6 shrink-0 items-center justify-center font-display text-[10px] font-bold dp-clip-hex',
                i === 0
                  ? 'bg-accent/20 text-accent'
                  : isYou
                    ? 'bg-primary/25 text-primary'
                    : 'bg-muted text-muted-foreground',
              )}
            >
              {i + 1}
            </span>

            {i === 0 && <Crown className="h-3.5 w-3.5 shrink-0 text-accent" />}

            <span
              className={cn(
                'flex-1 truncate font-display text-xs tracking-wide',
                isYou ? 'font-bold text-primary' : 'text-foreground',
              )}
            >
              {r.user}
            </span>

            <span className="tnum shrink-0 font-display text-xs font-bold text-muted-foreground">
              {formatNum(r.score)}
            </span>
          </div>
        )
      })}
    </Panel>
  )
}
