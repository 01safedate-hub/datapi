'use client'

import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

/* ------------------------------------------------------------------ *
 *  Animated number that eases toward its target value
 * ------------------------------------------------------------------ */
export function Counter({
  value,
  format,
  className,
  duration = 900,
}: {
  value: number
  format?: (n: number) => string
  className?: string
  duration?: number
}) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const startRef = useRef(0)
  const rafRef = useRef(0)

  useEffect(() => {
    const from = fromRef.current
    if (from === value) return
    startRef.current = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - startRef.current) / duration)
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      const next = from + (value - from) * eased
      setDisplay(next)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = value
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])

  return <span className={cn('tnum', className)}>{format ? format(display) : Math.floor(display)}</span>
}

/* ------------------------------------------------------------------ *
 *  Glitchy display heading
 * ------------------------------------------------------------------ */
export function GlitchText({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <span className={cn('relative inline-block font-display', className)}>
      <span
        aria-hidden="true"
        className="absolute inset-0 select-none text-primary/70"
        style={{ transform: 'translate(-2px, 1px)', animation: 'dp-flicker 4s infinite steps(1)' }}
      >
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 select-none text-accent/60"
        style={{ transform: 'translate(2px, -1px)', animation: 'dp-flicker 6.5s infinite steps(1)' }}
      >
        {children}
      </span>
      <span className="relative">{children}</span>
    </span>
  )
}

/* ------------------------------------------------------------------ *
 *  Angular HUD panel with corner brackets + optional shine sweep
 * ------------------------------------------------------------------ */
export function Panel({
  children,
  className,
  shine = false,
  glow = false,
}: {
  children: React.ReactNode
  className?: string
  shine?: boolean
  glow?: boolean
}) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden border border-border bg-card/60 backdrop-blur-md dp-clip-panel',
        glow && 'shadow-[0_0_28px_-8px_oklch(0.82_0.16_195_/_35%)]',
        className,
      )}
    >
      {/* top hairline */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
      />
      {shine && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-primary/12 to-transparent opacity-0 group-hover:opacity-100"
          style={{ animation: 'dp-shine 1.6s ease-in-out infinite' }}
        />
      )}
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ *
 *  Small labelled stat readout
 * ------------------------------------------------------------------ */
export function Stat({
  label,
  children,
  accent,
  icon,
}: {
  label: string
  children: React.ReactNode
  accent?: boolean
  icon?: React.ReactNode
}) {
  return (
    <Panel className="p-3">
      <div className="flex items-center gap-1.5">
        {icon && <span className={accent ? 'text-accent' : 'text-primary'}>{icon}</span>}
        <p className="font-display text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
          {label}
        </p>
      </div>
      <p
        className={cn(
          'mt-1 font-display text-lg font-bold leading-none',
          accent ? 'text-accent' : 'text-foreground',
        )}
      >
        {children}
      </p>
    </Panel>
  )
}

/* ------------------------------------------------------------------ *
 *  Animated equalizer bars — implies "system is live"
 * ------------------------------------------------------------------ */
export function Equalizer({ bars = 5, className }: { bars?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={cn('flex items-end gap-[3px]', className)}>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="w-[3px] origin-bottom rounded-full bg-primary"
          style={{
            height: 14,
            animation: `dp-bar ${0.7 + (i % 3) * 0.28}s ease-in-out ${i * 0.11}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ *
 *  Section heading with animated rule
 * ------------------------------------------------------------------ */
export function SectionTitle({
  title,
  sub,
  right,
}: {
  title: string
  sub?: string
  right?: React.ReactNode
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-3 w-[3px] bg-primary"
            style={{ animation: 'dp-blink 1.4s ease-in-out infinite' }}
          />
          <h2 className="font-display text-sm font-bold tracking-[0.16em] uppercase">{title}</h2>
        </div>
        {sub && <p className="mt-1 truncate text-xs text-muted-foreground">{sub}</p>}
      </div>
      {right}
    </div>
  )
}
