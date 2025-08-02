'use client'

import Link from 'next/link'
import { useUserInfo } from '@/hooks/useUserInfo'
import { useState } from 'react'

export function Navigation() {
  const { userInfo, loading } = useUserInfo()
  const [menuOpen, setMenuOpen] = useState(false)

  // handler for Link click to close the menu
  const handleLinkClick = () => {
    setMenuOpen(false)
  }

  // ローディング中は何も表示しない
  if (loading) {
    return (
      <nav className="p-4 bg-gray-100 flex gap-4">
        <div>読み込み中...</div>
      </nav>
    )
  }

  return (
    <nav className="p-4 bg-gray-100 flex items-center justify-between">
      {/* ハンバーガーボタン（モバイルのみ表示） */}
      <button
        className="md:hidden flex flex-col gap-1"
        aria-label="メニューを開く"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span
          className={`block w-6 h-0.5 bg-gray-800 transition-transform ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}
        ></span>
        <span
          className={`block w-6 h-0.5 bg-gray-800 transition-opacity ${menuOpen ? 'opacity-0' : 'opacity-100'}`}
        ></span>
        <span
          className={`block w-6 h-0.5 bg-gray-800 transition-transform ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}
        ></span>
      </button>

      {/* メニュー本体 */}
      <div
        className={`
          flex-col gap-4 text-xs
          absolute top-12 left-0 w-full bg-gray-100 p-4 z-10
          md:static md:flex md:flex-row md:items-center md:gap-4 md:p-0 md:bg-gray-100
          ${menuOpen ? 'flex' : 'hidden'}
          md:flex
        `}
      >
        {/* ログイン済みの場合のみ表示 */}
        {userInfo && (
          <>
            {/* 保護者のみ表示 */}
            {userInfo.role === 'parent' && (
              <>
                <Link href="/" onClick={handleLinkClick}>
                  トップ
                </Link>
                <Link href="/tasks/add" onClick={handleLinkClick}>
                  タスク作成
                </Link>
                <Link href="/task-templates" onClick={handleLinkClick}>
                  テンプレート
                </Link>
              </>
            )}

            {/* 親子共通で表示 */}
            <Link href="/tasks" onClick={handleLinkClick}>
              タスク一覧
            </Link>
            <Link href="/tasks/calendar" onClick={handleLinkClick}>
              カレンダー
            </Link>
            <Link href="/setting" onClick={handleLinkClick}>
              設定
            </Link>
          </>
        )}

        {/* 未ログインの場合のみ表示 */}
        {!userInfo && (
          <>
            <Link href="/login" onClick={handleLinkClick}>
              ログイン
            </Link>
            <Link href="/signup" onClick={handleLinkClick}>
              新規登録
            </Link>
          </>
        )}

        {/* ユーザーの情報 */}
        {userInfo && (
          <div className="text-sm text-blue-700 font-semibold border-t border-gray-300 pt-3 mt-2 md:mt-0 md:ml-6 md:border-t-0 md:border-l md:pl-6 md:pt-0">
            {userInfo.displayName} ({userInfo.role})
          </div>
        )}
      </div>
    </nav>
  )
}
