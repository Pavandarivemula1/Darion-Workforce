import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Candidate Time Tracking System',
  description: 'Material Design 3 time-tracking application for Admins and Candidates.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
