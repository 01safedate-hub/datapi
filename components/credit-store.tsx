'use client'

import { Panel } from '@/components/hud'
import { CREDIT_PACKS, formatNum } from '@/lib/datapi'
import { cn } from '@/lib/utils'
import { Coins, Sparkles } from 'lucide-react'

export function CreditStore({ onBuy }: { onBuy: (credits: number) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {CREDIT_PACKS.map((pack, i) => {
        const total = pack.credits + Math.round((pack.credits * pack.bonus) / 100)
        const featured = pack.tag === 'POPULAR'

        return (
          <Panel
            key={pack.id}
            shine
            glow={featured}
            className={cn(
              'flex flex-col items-center p-4 text-center',
              featured && 'border-accent/50',
            )}
          >
            <div style={{ animation: `dp-rise 0.5s ease-out ${i * 0.08}s both` }} className="w-full">
              {pack.tag && (
                <span
                  className={cn(
                    'mb-2 inline-block border px-2 py-0.5 font-display text-[8px] font-bold tracking-[0.16em]',
                    featured
                      ? 'border-accent/50 bg-accent/15 text-accent'
                      : 'border-primary/50 bg-primary/15 text-primary',
                  )}
                >
                  {pack.tag}
                </span>
              )}

              <div className="relative mx-auto mb-2 flex h-12 w-12 items-center justify-center">
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-0 rounded-full blur-md',
                    featured ? 'bg-accent/30' : 'bg-primary/20',
                  )}
                  style={{ animation: 'dp-pulse-glow 3s ease-in-out infinite' }}
                />
                <Coins
                  className={cn('relative h-6 w-6', featured ? 'text-accent' : 'text-primary')}
                />
              </div>

              <p className="font-display text-xl font-black leading-none">{formatNum(total)}</p>
              <p className="mt-0.5 font-display text-[9px] tracking-[0.18em] text-muted-foreground uppercase">
                Credits
              </p>

              {pack.bonus > 0 && (
                <p className="mt-1 flex items-center justify-center gap-1 font-display text-[9px] font-bold tracking-wide text-accent">
                  <Sparkles className="h-2.5 w-2.5" />+{pack.bonus}% BONUS
                </p>
              )}

              <button
                type="button"
                onClick={() => onBuy(total)}
                className={cn(
                  'mt-3 w-full cursor-pointer border py-2 font-display text-[11px] font-bold tracking-[0.12em] transition-all active:scale-95 dp-clip-notch',
                  'outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  featured
                    ? 'border-accent/60 bg-accent/20 text-accent hover:bg-accent/35'
                    : 'border-primary/60 bg-primary/15 text-primary hover:bg-primary/30',
                )}
              >
                ${pack.price}
              </button>
            </div>
          </Panel>
        )
      })}
    </div>
  )
}
