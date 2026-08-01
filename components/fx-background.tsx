'use client'

import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  z: number
  vy: number
  size: number
  hue: number
}

/**
 * Ambient animated backdrop: drifting particle field + falling data streaks
 * on a single canvas, layered under an animated CSS grid and vignette.
 */
export function FxBackground({ intensity = 1 }: { intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intensityRef = useRef(intensity)

  useEffect(() => {
    intensityRef.current = intensity
  }, [intensity])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let dpr = 1
    let particles: Particle[] = []
    let streaks: { x: number; y: number; len: number; v: number; a: number }[] = []
    let raf = 0

    const build = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.round(Math.min(110, (width * height) / 9000))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: 0.3 + Math.random() * 0.7,
        vy: 0.08 + Math.random() * 0.35,
        size: 0.6 + Math.random() * 1.8,
        hue: Math.random() > 0.82 ? 68 : 188,
      }))

      const streakCount = Math.round(Math.min(26, width / 26))
      streaks = Array.from({ length: streakCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        len: 40 + Math.random() * 130,
        v: 1.2 + Math.random() * 3.4,
        a: 0.05 + Math.random() * 0.22,
      }))
    }

    build()

    const ro = new ResizeObserver(build)
    ro.observe(canvas)

    if (reduce) {
      // Draw one static frame and stop.
      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        ctx.beginPath()
        ctx.fillStyle = `oklch(0.82 0.16 ${p.hue} / ${0.35 * p.z})`
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
      return () => ro.disconnect()
    }

    const render = () => {
      const boost = intensityRef.current
      ctx.clearRect(0, 0, width, height)

      // Falling data streaks
      for (const s of streaks) {
        const grad = ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.len)
        grad.addColorStop(0, 'oklch(0.82 0.16 195 / 0)')
        grad.addColorStop(1, `oklch(0.86 0.17 195 / ${s.a * boost})`)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x, s.y + s.len)
        ctx.stroke()

        s.y += s.v * boost
        if (s.y > height + s.len) {
          s.y = -s.len - Math.random() * 200
          s.x = Math.random() * width
        }
      }

      // Particle field
      for (const p of particles) {
        const alpha = (0.25 + p.z * 0.5) * Math.min(boost, 2)
        ctx.beginPath()
        ctx.fillStyle = `oklch(0.86 0.16 ${p.hue} / ${alpha})`
        ctx.arc(p.x, p.y, p.size * p.z, 0, Math.PI * 2)
        ctx.fill()

        if (p.size > 1.6) {
          ctx.beginPath()
          ctx.fillStyle = `oklch(0.86 0.16 ${p.hue} / ${alpha * 0.14})`
          ctx.arc(p.x, p.y, p.size * p.z * 4, 0, Math.PI * 2)
          ctx.fill()
        }

        p.y -= p.vy * p.z * boost
        if (p.y < -8) {
          p.y = height + 8
          p.x = Math.random() * width
        }
      }

      raf = requestAnimationFrame(render)
    }

    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* deep base wash */}
      <div className="absolute inset-0 bg-background" />

      {/* radial energy pools */}
      <div
        className="absolute -top-1/4 left-1/2 h-[70vh] w-[130vw] -translate-x-1/2 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse at center, oklch(0.82 0.16 195 / 16%) 0%, transparent 65%)',
          animation: 'dp-pulse-glow 7s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-0 left-1/2 h-[45vh] w-[110vw] -translate-x-1/2 opacity-50"
        style={{
          background:
            'radial-gradient(ellipse at bottom, oklch(0.82 0.16 78 / 12%) 0%, transparent 70%)',
          animation: 'dp-pulse-glow 9s ease-in-out infinite reverse',
        }}
      />

      {/* animated perspective grid */}
      <div
        className="absolute inset-x-0 bottom-0 h-[55vh] opacity-[0.28]"
        style={{
          backgroundImage:
            'linear-gradient(oklch(0.82 0.16 195 / 45%) 1px, transparent 1px), linear-gradient(90deg, oklch(0.82 0.16 195 / 45%) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          animation: 'dp-grid-move 2.6s linear infinite',
          maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          transform: 'perspective(340px) rotateX(62deg)',
          transformOrigin: 'bottom',
        }}
      />

      {/* particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* scanlines */}
      <div
        className="absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, oklch(0.96 0.01 240) 0px, oklch(0.96 0.01 240) 1px, transparent 1px, transparent 3px)',
        }}
      />

      {/* sweeping scan bar */}
      <div
        className="absolute inset-x-0 top-0 h-24 opacity-30"
        style={{
          background:
            'linear-gradient(to bottom, transparent, oklch(0.82 0.16 195 / 22%), transparent)',
          animation: 'dp-scan 8s linear infinite',
        }}
      />

      {/* vignette keeps text legible */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 35%, oklch(0.13 0.025 250 / 82%) 100%)',
        }}
      />
    </div>
  )
}
