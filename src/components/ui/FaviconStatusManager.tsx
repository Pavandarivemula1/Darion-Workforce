'use client'

import { useEffect, useRef } from 'react'

export type FaviconStatus = 'active' | 'break' | 'overshift' | 'offline'

const STATUS_CONFIG: Record<FaviconStatus, { color: string; label: string; ping: boolean }> = {
  active:    { color: '#10b981', label: 'Active',    ping: true  },
  overshift: { color: '#3b82f6', label: 'Overshift', ping: true  },
  break:     { color: '#f59e0b', label: 'Break',     ping: true  },
  offline:   { color: '#9ca3af', label: 'Offline',   ping: false },
}

const SIZE = 64

/**
 * Draws a briefcase-shaped favicon with a coloured status dot in the
 * bottom-right corner, directly on a canvas — no external image loading needed.
 */
function drawFrame(
  ctx: CanvasRenderingContext2D,
  statusColor: string,
  pingScale: number // 0..1 → outer ring expands then fades
) {
  ctx.clearRect(0, 0, SIZE, SIZE)

  // ── Briefcase body ───────────────────────────────────────────────────────
  const s = SIZE
  const p = 4  // padding

  ctx.strokeStyle = '#009dff'
  ctx.lineWidth = 5
  ctx.lineJoin = 'miter'
  ctx.lineCap = 'square'
  ctx.fillStyle = 'transparent'

  // Scale factor: original viewBox 512 → our canvas size
  const sc = s / 512

  ctx.save()
  ctx.scale(sc, sc)

  // Handle
  ctx.beginPath()
  ctx.moveTo(144, 144)
  ctx.lineTo(144, 48)
  ctx.lineTo(368, 48)
  ctx.lineTo(368, 144)
  ctx.stroke()

  // Body trapezoid
  ctx.beginPath()
  ctx.moveTo(16, 144)
  ctx.lineTo(496, 144)
  ctx.lineTo(464, 480)
  ctx.lineTo(48, 480)
  ctx.closePath()
  ctx.stroke()

  // Envelope V line
  ctx.beginPath()
  ctx.moveTo(16, 144)
  ctx.lineTo(256, 352)
  ctx.lineTo(496, 144)
  ctx.stroke()

  ctx.restore()

  // ── Status dot (bottom-right corner) ─────────────────────────────────────
  const cx = s * 0.80
  const cy = s * 0.80
  const r  = s * 0.155

  // Ping ring
  if (pingScale > 0) {
    const pingR = r + r * 1.5 * pingScale
    const alpha = (1 - pingScale) * 0.65
    ctx.beginPath()
    ctx.arc(cx, cy, pingR, 0, Math.PI * 2)
    ctx.fillStyle = statusColor
    ctx.globalAlpha = alpha
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // White border
  ctx.beginPath()
  ctx.arc(cx, cy, r + 2.5, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()

  // Solid dot
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = statusColor
  ctx.fill()
}

function setFaviconPng(dataUrl: string) {
  document
    .querySelectorAll("link[rel~='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']")
    .forEach(el => el.remove())

  const link = document.createElement('link')
  link.rel  = 'icon'
  link.type = 'image/png'
  link.href = dataUrl
  document.head.appendChild(link)
}

interface Props {
  status: FaviconStatus
}

export function FaviconStatusManager({ status }: Props) {
  const statusRef = useRef<FaviconStatus>(status)
  const rafRef    = useRef<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Keep ref in sync with latest prop on every render
  statusRef.current = status

  useEffect(() => {
    // Create an off-screen canvas once
    const canvas = document.createElement('canvas')
    canvas.width  = SIZE
    canvas.height = SIZE
    canvasRef.current = canvas
    const ctx = canvas.getContext('2d')!

    let destroyed = false
    const start = performance.now()

    const animate = (now: number) => {
      if (destroyed) return

      const cfg = STATUS_CONFIG[statusRef.current]
      const elapsed = (now - start) % 2000   // 2-second ping cycle
      const pingScale = cfg.ping ? elapsed / 2000 : 0

      drawFrame(ctx, cfg.color, pingScale)
      setFaviconPng(canvas.toDataURL('image/png'))

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      destroyed = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])  // Run once; status changes handled via statusRef

  return null
}
