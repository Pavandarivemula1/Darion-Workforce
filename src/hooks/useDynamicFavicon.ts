import { useEffect } from 'react'

export type FaviconStatus = 'active' | 'break' | 'offline'

export function useDynamicFavicon(status: FaviconStatus) {
  useEffect(() => {
    const updateFavicons = () => {
      const iconUrl = `/api/favicon?status=${status}`

      // Update standard favicon
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = iconUrl
      
      // Also update apple-touch-icon if it exists
      let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement
      if (appleLink) {
        appleLink.href = iconUrl
      }
    }

    updateFavicons()
  }, [status])
}
