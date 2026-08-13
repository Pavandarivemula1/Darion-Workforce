'use client'

import { useEffect } from 'react'

interface LiveTabTitleProps {
  count: number
  defaultTitle?: string
}

export function LiveTabTitle({ count, defaultTitle = 'Darion Workforce' }: LiveTabTitleProps) {
  useEffect(() => {
    const setFavicon = (color: string) => {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${color}"/><g stroke="white" stroke-width="5" fill="none"><path d="M5,50 h90 M14,25 h72 M14,75 h72" /><path d="M50,0 v100" /><path d="M50,0 A 30,50 0 0,1 50,100" /><path d="M50,0 A 30,50 0 0,0 50,100" /><circle cx="50" cy="50" r="47.5" /></g></svg>`
      link.href = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
    }

    if (count > 0) {
      document.title = `(${count}) ${defaultTitle}`
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
      if (link) link.href = '/icon.svg'
    } else {
      document.title = defaultTitle
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
      if (link) link.href = '/icon.svg'
    }
    
    return () => {
      document.title = defaultTitle
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
      if (link) link.href = '/icon.svg'
    }
  }, [count, defaultTitle])

  return null
}
