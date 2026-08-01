'use client'

import { Panel } from '@/components/hud'
import { BOOSTERS, RARITY_STYLES, formatNum, type Booster } from '@/lib/datapi'
import { cn } from '@/lib/utils'
import { Check, Cpu, Plus, TrendingUp } from 'lucide-react'

function BoosterCard({
  booster,
  count,
  credits,
  onBuy,
}: {
  booster: Booster
  count: number
  credits: number
  onBuy: (b: Booster) => void
}) {
  const style = RARITY_STYLES[booster.rarity]
  const maxed = count >= booster.maxStack
  const affordable = credits >= booster.cost
  const disabled = maxed || !affordable

  return (
    <Panel
      shine
      className={cn('flex flex-col p-3 transition-colors', style.border, maxed && 'opacity-70')}
      glow={booster.rarity === 'legendary'}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'relative flex h-9 w-9 shrink-0 items-center justify-center dp-clip-hex',
              style.bg,
            )}
            style={{ boxShadow: `0 0 16px -2px ${style.glow}` }}
          >
            <Cpu className={cn('h-4 w-4', style.text)} />
            <span
              aria-hidden="true"
              className={cn('absolute inset-0 dp-clip-hex', style.bg)}
              style={{ animation: 'dp-pulse-glow 3s ease-in-out infinite' }}
            />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-xs font-bold tracking-wide">{booster.name}</p>
            <p className="font-display text-[9px] tracking-[0.16em] text-muted-foreground">
              {booster.codename}
            </p>
          </div>
        </div>

        <span
          className={cn(
            'shrink-0 border px-1.5 py-0.5 font-display text-[8px] font-bold tracking-[0.14em]',
            style.border,
            style.text,
            style.bg,
          )}
        >
          {style.label}
        </span>
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{booster.description}</p>

      {/* stack pips */}
      <div className="mt-2.5 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-[3px]">
          {Array.from({ length: booster.maxStack }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1 flex-1 transition-colors duration-300',
                i < count ? 'bg-primary' : 'bg-muted',
              )}
              style={
                i < count
                  ? { boxShadow: '0 0 6px oklch(0.82 0.16 195 / 60%)' }
                  : undefined
              }
            />
          ))}
        </div>
        <span className="tnum font-display text-[9px] text-muted-foreground">
          {count}/{booster.maxStack}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 font-display text-[10px] font-bold tracking-wide text-primary">
          <TrendingUp className="h-3 w-3" />+{Math.round(booster.power * 100)}% RATE
        </span>

        <button
          type="button"
          onClick={() => onBuy(booster)}
          disabled={disabled}
          className={cn(
            'group/btn relative flex items-center gap-1 overflow-hidden border px-2.5 py-1.5 font-display text-[10px] font-bold tracking-[0.1em] transition-all dp-clip-notch',
            'outline-none focus-visible:ring-2 focus-visible:ring-ring',
            disabled
              ? 'cursor-not-allowed border-border text-muted-foreground'
              : 'cursor-pointer border-primary/60 bg-primary/15 text-primary hover:bg-primary/30 active:scale-95',
          )}
        >
          {maxed ? (
            <>
              <Check className="h-3 w-3" /> MAXED
            </>
          ) : (
            <>
              <Plus className="h-3 w-3" />
              {formatNum(booster.cost)} CR
            </>
          )}
          {!disabled && (
            <span
              aria-hidden="true"
              className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover/btn:opacity-100"
              style={{ animation: 'dp-shine 1.2s ease-in-out infinite' }}
            />
          )}
        </button>
      </div>

      {!affordable && !maxed && (
        <p className="mt-1.5 font-display text-[9px] tracking-wide text-destructive">
          INSUFFICIENT CREDITS
        </p>
      )}
    </Panel>
  )
}

export function BoostShop({
  owned,
  credits,
  onBuy,
}: {
  owned: Record<string, number>
  credits: number
  onBuy: (b: Booster) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {BOOSTERS.map((b, i) => (
        <div key={b.id} style={{ animation: `dp-rise 0.5s ease-out ${i * 0.07}s both` }}>
          <BoosterCard booster={b} count={owned[b.id] ?? 0} credits={credits} onBuy={onBuy} />
        </div>
      ))}
    </div>
  )
}
