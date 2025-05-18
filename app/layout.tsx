import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AT-Infinity | Circular Glowing Logo',
  description: 'Digital art museum by ARTERRII',
  viewport: 'width=device-width, initial-scale=1.0',
  other: {
    'http-equiv': 'Cache-Control',
    content: 'no-store, no-cache, must-revalidate, max-age=0'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta http-equiv="Pragma" content="no-cache" />
        <meta http-equiv="Expires" content="0" />
      </head>
      <body>{children}</body>
    </html>
  )
}
