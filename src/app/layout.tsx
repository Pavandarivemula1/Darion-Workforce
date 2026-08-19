import type { Metadata, Viewport } from 'next'
import './globals.css'
import { getTenantBranding } from '@/lib/branding/getBranding'
import { generateThemeCssString } from '@/lib/branding/palette'
import { BrandingProvider } from '@/components/providers/BrandingProvider'

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getTenantBranding()

  return {
    title: {
      default: branding.appTitle,
      template: `%s | ${branding.appTitle}`,
    },
    description: branding.tagline || 'Enterprise-grade workforce time tracking, attendance, shift scheduling, and payroll system.',
    icons: branding.faviconUrl
      ? {
          icon: branding.faviconUrl,
          apple: branding.iconUrl || branding.faviconUrl,
        }
      : undefined,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: branding.appTitle,
    },
    formatDetection: {
      telephone: false,
    },
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0B57D0' },
    { media: '(prefers-color-scheme: dark)', color: '#111318' },
  ],
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const branding = await getTenantBranding()
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
      <body className="antialiased font-sans">
        <BrandingProvider initialBranding={branding}>
          {children}
        </BrandingProvider>
      </body>
    </html>
  )
}
