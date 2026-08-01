'use client'

import { Counter } from '@/components/hud'
import { formatCountdown, formatNum } from '@/lib/datapi'
import { cn } from '@/lib/utils'
import { Lock, Zap } from 'lucide-react'

/**
 * The hero mining reactor. Renders an SVG progress ring for the 24h cooldown,
 * multiple counter-rotating orbital rings, a pulsing energy core, and shockwaves.
 */
export function MiningCore({
  ready,
  remaining,
  progress,
  potentialYield,
  rate,
  mining,
  onMine,
}: {
  ready: boolean
  remaining: number
  progress: number
  potentialYield: number
  rate: number
  mining: boolean
  onMine: () => void
}) {
  const { h, m, s } = formatCountdown(remaining)
  const R = 132
  const CIRC = 2 * Math.PI * R

  return (
    <div className="relative mx-auto flex aspect-square w-full max-w-[340px] items-center justify-center">
      {/* ---------- outer glow halo ---------- */}
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-4 rounded-full blur-2xl',
          ready ? 'bg-primary/25' : 'bg-primary/10',
        )}
        style={{ animation: `dp-pulse-glow ${ready ? 2 : 4.5}s ease-in-out infinite` }}
      />

      {/* ---------- shockwaves on mine ---------- */}
      {mining && (
        <>
          {[0, 0.22, 0.44].map((delay) => (
            <span
              key={delay}
              aria-hidden="true"
              className="absolute inset-6 rounded-full border-2 border-primary"
              style={{ animation: `dp-shockwave 1.1s ease-out ${delay}s forwards` }}
            />
          ))}
        </>
      )}

      {/* ---------- rotating orbital rings ---------- */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-full border border-primary/20"
        style={{ animation: 'dp-spin 24s linear infinite' }}
      >
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_2px_oklch(0.82_0.16_195_/_70%)]" />
        <span className="absolute left-1/2 bottom-0 h-1.5 w-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-accent shadow-[0_0_10px_2px_oklch(0.82_0.16_78_/_70%)]" />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-6 rounded-full border border-dashed border-accent/25"
        style={{ animation: 'dp-spin-rev 18s linear infinite' }}
      >
        <span className="absolute right-0 top-1/2 h-1.5 w-1.5 translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
      </div>

      {/* segmented tick ring */}
      <div
        aria-hidden="true"
        className="absolute inset-2"
        style={{ animation: 'dp-spin 40s linear infinite' }}
      >
        <svg viewBox="0 0 320 320" className="h-full w-full">
          <circle
            cx="160"
            cy="160"
            r="150"
            fill="none"
            stroke="oklch(0.82 0.16 195 / 30%)"
            strokeWidth="2"
            strokeDasharray="2 14"
          />
        </svg>
      </div>

      {/* ---------- cooldown progress ring ---------- */}
      <svg
        viewBox="0 0 320 320"
        className="absolute inset-0 h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="dp-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.86 0.17 195)" />
            <stop offset="55%" stopColor="oklch(0.82 0.16 195)" />
            <stop offset="100%" stopColor="oklch(0.84 0.16 78)" />
          </linearGradient>
        </defs>
        <circle
          cx="160"
          cy="160"
          r={R}
          fill="none"
          stroke="oklch(0.24 0.035 252)"
          strokeWidth="10"
        />
        <circle
          cx="160"
          cy="160"
          r={R}
          fill="none"
          stroke="url(#dp-ring)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - progress)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
          style={{ filter: 'drop-shadow(0 0 8px oklch(0.82 0.16 195 / 65%))' }}
        />
      </svg>

      {/* ---------- core button ---------- */}
      <button
        type="button"
        onClick={onMine}
        disabled={!ready || mining}
        aria-label={ready ? `Mine ${potentialYield} DPI tokens` : `Mining locked. Ready in ${h}h ${m}m ${s}s`}
        className={cn(
          'group relative flex h-[62%] w-[62%] flex-col items-center justify-center rounded-full',
          'border transition-all duration-300 outline-none',
          'focus-visible:ring-4 focus-visible:ring-ring',
          ready
            ? 'cursor-pointer border-primary/60 bg-card/80 hover:scale-[1.04] active:scale-95'
            : 'cursor-not-allowed border-border bg-card/50',
        )}
        style={{
          boxShadow: ready
            ? 'inset 0 0 40px oklch(0.82 0.16 195 / 22%), 0 0 40px -6px oklch(0.82 0.16 195 / 55%)'
            : 'inset 0 0 30px oklch(0.13 0.025 250 / 60%)',
          animation: ready && !mining ? 'dp-breathe 2.6s ease-in-out infinite' : undefined,
        }}
      >
        {/* inner conic sweep */}
        <span
          aria-hidden="true"
          className="absolute inset-3 rounded-full opacity-40"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, oklch(0.82 0.16 195 / 45%) 60deg, transparent 130deg)',
            animation: 'dp-spin 3.2s linear infinite',
            maskImage: 'radial-gradient(circle, transparent 58%, black 62%)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 58%, black 62%)',
          }}
        />

        {/* hex plate */}
        <span
          aria-hidden="true"
          className="absolute inset-[22%] bg-primary/5 dp-clip-hex"
          style={{ animation: 'dp-spin-rev 12s linear infinite' }}
        />

        <span className="relative flex flex-col items-center gap-1 px-4">
          {ready ? (
            <>
              <Zap
                className={cn(
                  'h-7 w-7 text-primary transition-transform',
                  'group-hover:scale-110',
                )}
                style={{ filter: 'drop-shadow(0 0 8px oklch(0.82 0.16 195 / 80%))' }}
              />
              <span className="font-display text-2xl font-black tracking-tight text-foreground">
                {mining ? 'MINING' : 'MINE'}
              </span>
              <span className="font-display text-[10px] font-bold tracking-[0.18em] text-primary">
                +{formatNum(potentialYield)} DPI
              </span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="font-display text-[9px] tracking-[0.22em] text-muted-foreground uppercase">
                Recharging
              </span>
              <span className="tnum font-display text-3xl font-black leading-none text-foreground">
                {h}
                <span
                  className="text-primary"
                  style={{ animation: 'dp-blink 1s steps(1) infinite' }}
                >
                  :
                </span>
                {m}
                <span
                  className="text-primary"
                  style={{ animation: 'dp-blink 1s steps(1) infinite' }}
                >
                  :
                </span>
                {s}
              </span>
              <span className="mt-0.5 flex items-center gap-1 font-display text-[9px] tracking-[0.16em] text-muted-foreground uppercase">
                Rate ×<Counter value={rate} format={(n) => n.toFixed(2)} />
              </span>
            </>
          )}
        </span>
      </button>

      {/* ---------- corner brackets ---------- */}
      {[
        'left-0 top-0 border-l-2 border-t-2',
        'right-0 top-0 border-r-2 border-t-2',
        'left-0 bottom-0 border-b-2 border-l-2',
        'right-0 bottom-0 border-b-2 border-r-2',
      ].map((pos) => (
        <span
          key={pos}
          aria-hidden="true"
          className={cn('absolute h-6 w-6 border-primary/50', pos)}
          style={{ animation: 'dp-blink 3s ease-in-out infinite' }}
        />
      ))}
    </div>
  )
}
