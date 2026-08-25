import type { Metadata, Viewport } from 'next'
import './globals.css'
import { getTenantBranding } from '@/lib/branding/getBranding'
import { generateThemeCssString } from '@/lib/branding/palette'
import { BrandingProvider } from '@/components/providers/BrandingProvider'
import { GlobalCallManager } from '@/components/calls/GlobalCallManager'
import { GlobalPushNotificationManager } from '@/components/notifications/GlobalPushNotificationManager'
import { getCurrentUserFast } from '@/lib/supabase/server'
import NextTopLoader from 'nextjs-toploader'

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getTenantBranding()

  return {
    title: {
      default: branding.appTitle || 'Darion Workforce',
      template: `%s | ${branding.appTitle || 'Darion Workforce'}`,
    },
    description:
      branding.tagline ||
      'Enterprise-grade workforce time tracking, attendance, shift scheduling, and payroll system.',
    icons: {
      icon: [{ url: branding.faviconUrl || '/icon.svg', type: 'image/svg+xml' }],
      shortcut: branding.faviconUrl || '/icon.svg',
      apple: branding.iconUrl || branding.faviconUrl || '/icon.svg',
    },
    manifest: '/manifest.json',
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#0B57D0',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [user, branding] = await Promise.all([
    getCurrentUserFast().catch(() => null),
    getTenantBranding(),
  ])

  const themeCss = generateThemeCssString(
    branding.primaryColor,
    branding.secondaryColor,
    branding.accentColor,
    branding.borderRadiusStyle,
    branding.fontFamily
  )

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style
          id="branding-theme-variables"
          dangerouslySetInnerHTML={{ __html: themeCss }}
        />
      </head>
      <body className="antialiased bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] font-sans selection:bg-[var(--md-sys-color-primary)] selection:text-white min-h-screen overflow-x-hidden">
        <BrandingProvider initialBranding={branding}>
          <NextTopLoader color="var(--md-sys-color-primary)" showSpinner={false} />
          {children}
          <GlobalCallManager currentUserId={user?.id} />
          <GlobalPushNotificationManager userId={user?.id} />
        </BrandingProvider>
      </body>
    </html>
  )
}
