import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { DevContextSwitcher } from '@/components/dev/DevContextSwitcher'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Brewly - Coffee Shop Management',
  description: 'Complete multi-tenant coffee shop management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isDev = process.env.NODE_ENV === 'development'
  
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        {isDev && <DevContextSwitcher />}
      </body>
    </html>
  )
}

