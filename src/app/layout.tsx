import './globals.css'
import Link from 'next/link'
import { AuthGuard } from '@/components/AuthGuard'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <AuthGuard>
          <nav className="p-4 bg-gray-100 flex gap-4">
            <Link href="/">トップ</Link>
            <Link href="/tasks">タスク一覧</Link>
            <Link href="/tasks/add">タスク作成</Link>
            <Link href="/login">ログイン</Link>
            <Link href="/signup">新規登録</Link>
            <Link href="/task-templates">テンプレート</Link>
            <Link href="/tasks/calendar">カレンダー</Link>
            <Link href="/setting">設定</Link>
          </nav>
          <main className="p-4">{children}</main>
        </AuthGuard>
      </body>
    </html>
  )
}
