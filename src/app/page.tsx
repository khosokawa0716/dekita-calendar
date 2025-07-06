'use client'

import LogoutButton from '@/components/LogoutButton'
import Link from 'next/link'
import { useUserInfo } from '@/hooks/useUserInfo'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { RoleGuard } from '@/components/RoleGuard'

export default function Home() {
  const { userInfo, loading } = useUserInfo()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !userInfo) {
      router.push('/login')
    } else if (!loading && userInfo && userInfo.role === 'child') {
      router.push('/tasks/calendar')
    }
  }, [userInfo, loading, router])

  // ローディング中は何も表示しない
  if (loading) {
    return (
      <main className="p-4">
        <div>読み込み中...</div>
      </main>
    )
  }

  // 未ログインの場合は何も表示しない（リダイレクト処理中）
  if (!userInfo) {
    return (
      <main className="p-4">
        <div>リダイレクト中...</div>
      </main>
    )
  }

  // ログイン済みの場合のみコンテンツを表示（parentロールのみ）
  return (
    <RoleGuard
      allowedRoles={['parent']}
      loadingComponent={
        <main className="p-4">
          <div>読み込み中...</div>
        </main>
      }
      unauthorizedComponent={
        <main className="p-4">
          <div>このページは保護者のみアクセス可能です</div>
        </main>
      }
    >
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">できたよカレンダー</h1>

        <nav className="space-y-2">
          <Link href="/tasks" className="text-blue-600 underline block">
            ✅ 今日のタスク一覧へ
          </Link>
          <Link
            href="/tasks/calendar"
            className="text-blue-600 underline block"
          >
            📅 カレンダー表示へ
          </Link>
          <Link href="/tasks/add" className="text-blue-600 underline block">
            ➕ タスクを登録する
          </Link>
          <Link
            href="/task-templates"
            className="text-blue-600 underline block"
          >
            🗒️ テンプレート一覧へ
          </Link>
        </nav>

        <div className="mt-4">
          <LogoutButton />
        </div>
      </main>
    </RoleGuard>
  )
}
