'use client'

import Link from 'next/link'
import { useUserInfo } from '@/hooks/useUserInfo'
import LogoutButton from '@/components/LogoutButton'

export function Navigation() {
  const { userInfo, loading } = useUserInfo()

  // ローディング中は何も表示しない
  if (loading) {
    return (
      <nav className="p-4 bg-gray-100 flex gap-4">
        <div>読み込み中...</div>
      </nav>
    )
  }

  return (
    <nav className="p-4 bg-gray-100 flex gap-4">
      {/* ログイン済みの場合のみ表示 */}
      {userInfo && (
        <>
          <Link href="/">トップ</Link>
          <Link href="/tasks">タスク一覧</Link>
          <Link href="/tasks/add">タスク作成</Link>
          <Link href="/task-templates">テンプレート</Link>
          <Link href="/tasks/calendar">カレンダー</Link>
          <Link href="/setting">設定</Link>
          <LogoutButton />
        </>
      )}

      {/* 未ログインの場合のみ表示 */}
      {!userInfo && (
        <>
          <Link href="/login">ログイン</Link>
          <Link href="/signup">新規登録</Link>
        </>
      )}
    </nav>
  )
}
