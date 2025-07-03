import './globals.css'
import Link from 'next/link'
import { AuthGuard } from '@/components/AuthGuard'
import { Navigation } from '@/components/Navigation'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <AuthGuard>
          <Navigation />
          <main className="p-4">{children}</main>
        </AuthGuard>
      </body>
    </html>
  )
}
