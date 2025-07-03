'use client'

import { useUserInfo } from '@/hooks/useUserInfo'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { userInfo, loading } = useUserInfo()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return // ユーザー情報がまだ読み込まれていない

    // /setting ページと /login では何もしない
    if (
      pathname === '/setting' ||
      pathname === '/signup' ||
      pathname === '/login'
    )
      return

    // role または familyId が未設定なら /setting へ強制移動
    if (!userInfo?.role || !userInfo?.familyId) {
      router.push('/setting')
    }
  }, [userInfo, loading, pathname, router])

  return <>{children}</>
}
