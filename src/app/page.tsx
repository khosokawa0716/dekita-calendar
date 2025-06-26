'use client'

import LogoutButton from '@/components/LogoutButton'
import Link from 'next/link'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'

export default function Home() {
  useAuthRedirect()

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">できたよカレンダー</h1>

      <nav className="space-y-2">
        <Link href="/tasks" className="text-blue-600 underline block">
          ✅ 今日のタスク一覧へ
        </Link>
        <Link href="/tasks/add" className="text-blue-600 underline block">
          ➕ タスクを登録する
        </Link>
      </nav>

      <div className="mt-4">
        <LogoutButton />
      </div>
    </main>
  )
}
