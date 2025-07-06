'use client'

import Link from 'next/link'
import { useUserInfo } from '@/hooks/useUserInfo'

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
          {/* 保護者のみ表示 */}
          {userInfo.role === 'parent' && (
            <>
              <Link href="/">トップ</Link>
              <Link href="/tasks">タスク一覧</Link>
              <Link href="/tasks/add">タスク作成</Link>
              <Link href="/task-templates">テンプレート</Link>
            </>
          )}

          {/* 親子共通で表示 */}
          <Link href="/tasks/calendar">カレンダー</Link>
          <Link href="/setting">設定</Link>
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
