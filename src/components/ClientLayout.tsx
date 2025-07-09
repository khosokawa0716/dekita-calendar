'use client'

import dynamic from 'next/dynamic'

// SSRを無効にしてクライアント専用でレンダリング
const AuthGuard = dynamic(
  () =>
    import('@/components/AuthGuard').then((mod) => ({
      default: mod.AuthGuard,
    })),
  {
    ssr: false,
    loading: () => <div>読み込み中...</div>,
  }
)

const Navigation = dynamic(
  () =>
    import('@/components/Navigation').then((mod) => ({
      default: mod.Navigation,
    })),
  {
    ssr: false,
  }
)

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <Navigation />
      {children}
    </AuthGuard>
  )
}
