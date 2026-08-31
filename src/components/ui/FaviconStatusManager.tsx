'use client'

import { useEffect, useRef } from 'react'

export type FaviconStatus = 'active' | 'break' | 'overshift' | 'offline'

const STATUS_COLORS: Record<FaviconStatus, string> = {
  active: '#10b981',     // green
  overshift: '#3b82f6', // blue
  break: '#f59e0b',      // yellow/orange
  offline: '#9ca3af',    // gray
}

const CANVAS_SIZE = 128
const ICON_SVG_PATH = '/icon.svg'

/**
 * Draws the briefcase icon from the SVG onto a canvas, then overlays a
 * coloured status dot in the bottom-right corner.  Returns a PNG data URL.
 */
function drawFaviconFrame(
  img: HTMLImageElement,
  statusColor: string,
  pingScale: number // 0..1  — outer ring radius multiplier
): string {
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_SIZE
  canvas.height = CANVAS_SIZE
  const ctx = canvas.getContext('2d')!

  // Draw the base briefcase SVG
  ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE)

  const cx = CANVAS_SIZE * 0.82
  const cy = CANVAS_SIZE * 0.82
  const r = CANVAS_SIZE * 0.18 // solid dot radius

  // Outer ping ring (animated)
  if (pingScale > 0) {
    const pingR = r + (r * 1.4) * pingScale
    const alpha = (1 - pingScale) * 0.7
    ctx.beginPath()
    ctx.arc(cx, cy, pingR, 0, Math.PI * 2)
    ctx.fillStyle = statusColor
    ctx.globalAlpha = alpha
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // White border circle
  ctx.beginPath()
  ctx.arc(cx, cy, r + 2, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()

  // Solid dot
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = statusColor
  ctx.fill()

  return canvas.toDataURL('image/png')
}

function setFaviconHref(href: string) {
  // Remove ALL existing favicon link tags
  document
    .querySelectorAll("link[rel~='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']")
    .forEach(el => el.remove())

  const link = document.createElement('link')
  link.rel = 'icon'
  link.type = 'image/png'
  link.href = href
  document.head.appendChild(link)
}

interface FaviconStatusManagerProps {
  status: FaviconStatus
}

export function FaviconStatusManager({ status }: FaviconStatusManagerProps) {
  const rafRef = useRef<number | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const statusRef = useRef<FaviconStatus>(status)

  // Keep statusRef up to date
  useRef(() => { statusRef.current = status })
  statusRef.current = status

  useEffect(() => {
    let destroyed = false

    // Load the base SVG icon once
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = ICON_SVG_PATH
    imgRef.current = img

    img.onload = () => {
      if (destroyed) return

      let startTime = performance.now()

      const animate = (now: number) => {
        if (destroyed) return

        const color = STATUS_COLORS[statusRef.current]
        const elapsed = (now - startTime) % 2000 // 2s cycle
        // pingScale goes 0→1 over 2s (then resets)
        const pingScale = statusRef.current === 'offline' ? 0 : elapsed / 2000

        const dataUrl = drawFaviconFrame(img, color, pingScale)
        setFaviconHref(dataUrl)

        rafRef.current = requestAnimationFrame(animate)
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    img.onerror = () => {
      // Fallback: static dot only, no base icon
      if (destroyed) return
      const color = STATUS_COLORS[status]
      const canvas = document.createElement('canvas')
      canvas.width = CANVAS_SIZE
      canvas.height = CANVAS_SIZE
      const ctx = canvas.getContext('2d')!
      ctx.beginPath()
      ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 2, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      setFaviconHref(canvas.toDataURL('image/png'))
    }

    // MutationObserver to fight Next.js re-injecting its own favicon tags
    let lastHref = ''
    const observer = new MutationObserver(() => {
      const ourLink = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null
      if (!ourLink || ourLink.href !== lastHref) {
        // Something reset our favicon — flag the animation loop to rewrite it
        // The animation loop already runs via rAF so it will fix it next frame
      }
    })
    observer.observe(document.head, { childList: true, subtree: false, attributes: true, attributeFilter: ['href'] })

    return () => {
      destroyed = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      observer.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only mount/unmount — status changes handled via statusRef

  return null
}
