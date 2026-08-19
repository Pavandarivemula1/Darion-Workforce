'use client'

import { useEffect } from 'react'
import { useBranding } from '@/components/providers/BrandingProvider'

interface LiveTabTitleProps {
  count: number
  defaultTitle?: string
}

export function LiveTabTitle({ count, defaultTitle }: LiveTabTitleProps) {
  const branding = useBranding()
  const title = defaultTitle || branding.appTitle || 'Workforce'

  useEffect(() => {
    if (!branding.featureFlags?.live_tab_counter) return

    if (count > 0) {
      document.title = `(${count}) ${title}`
    } else {
      document.title = title
    }
    
    return () => {
      document.title = title
    }
  }, [count, title, branding.featureFlags?.live_tab_counter])

  return null
}
