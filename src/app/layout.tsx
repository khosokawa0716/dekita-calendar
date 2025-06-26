import Link from 'next/link'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <nav className="p-4 bg-gray-100 flex gap-4">
          <Link href="/">トップ</Link>
          <Link href="/tasks">タスク一覧</Link>
          <Link href="/tasks/add">タスク作成</Link>
          <Link href="/login">ログイン</Link>
          <Link href="/signup">新規登録</Link>
        </nav>
        <main className="p-4">{children}</main>
      </body>
    </html>
  )
}
