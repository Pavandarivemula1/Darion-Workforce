import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'offline'

  let color = '#9ca3af' // gray (offline/default)
  let includePing = false

  switch (status) {
    case 'active':
      color = '#10b981' // green
      includePing = true
      break
    case 'overshift':
      color = '#3b82f6' // blue
      includePing = true
      break
    case 'break':
      color = '#f59e0b' // yellow/orange
      includePing = true
      break
    case 'offline':
    default:
      color = '#9ca3af' // gray
      includePing = false
      break
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <g fill="none" stroke="#009dff" stroke-width="40" stroke-linejoin="miter" stroke-linecap="square">
    <polyline points="144,144 144,48 368,48 368,144" />
    <polygon points="16,144 496,144 464,480 48,480" />
    <polyline points="16,144 256,352 496,144" />
  </g>
  ${
    includePing
      ? `<circle cx="450" cy="450" r="40" fill="${color}" opacity="0.8">
    <animate attributeName="r" values="40; 80; 40" dur="2s" repeatCount="indefinite" />
    <animate attributeName="opacity" values="0.8; 0; 0" dur="2s" repeatCount="indefinite" />
  </circle>`
      : ''
  }
  <circle cx="450" cy="450" r="40" fill="${color}" stroke="#ffffff" stroke-width="16" />
</svg>`

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  })
}
