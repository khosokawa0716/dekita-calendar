'use client'

import Link from 'next/link'
import { useUserInfo } from '@/hooks/useUserInfo'
import { useState } from 'react'

// CSSクラスの定義
// 変数を使ってクラス名を定義することで、可読性を向上させる
// 変数名はクラス名の意味を反映するように命名
// 例: NAV_BASE_CLASS はナビゲーションの基本クラスを表す
// 例: MENU_CONTAINER_BASE_CLASS はメニューコンテナの基本クラスを表す
const NAV_BASE_CLASS = 'p-4 bg-gray-100 flex items-center justify-between h-[var(--header-height)]'
const MENU_CONTAINER_BASE_CLASS = `
  flex-col gap-4 text-xs
  absolute left-0 w-full bg-gray-100 p-4 z-10
  [top:var(--header-height)]
  md:static md:flex md:flex-row md:items-center md:gap-4 md:p-0 md:bg-gray-100
`
function getMenuContainerClass(menuOpen: boolean) {
  return MENU_CONTAINER_BASE_CLASS + ` ${menuOpen ? 'flex' : 'hidden'} md:flex`
}
const HAMBURGER_BUTTON_CLASS = 'md:hidden flex flex-col gap-1'
const HAMBURGER_ICON_CLASS = (menuOpen: boolean) => `
  block w-6 h-0.5 bg-gray-800 transition-transform ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}
`
const HAMBURGER_ICON_MIDDLE_CLASS = (menuOpen: boolean) => `
  block w-6 h-0.5 bg-gray-800 transition-opacity ${menuOpen ? 'opacity-0' : 'opacity-100'}
`
const HAMBURGER_ICON_BOTTOM_CLASS = (menuOpen: boolean) => `
  block w-6 h-0.5 bg-gray-800 transition-transform ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}
`
const USER_INFO_CLASS =
  'text-sm text-blue-700 font-semibold border-t border-gray-300 pt-3 mt-2 md:mt-0 md:ml-6 md:border-t-0 md:border-l md:pl-6 md:pt-0'

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
    <nav className={NAV_BASE_CLASS}>
      {/* ハンバーガーボタン（モバイルのみ表示） */}
      <button
        className={HAMBURGER_BUTTON_CLASS}
        type="button"
        aria-label="メニューを開く"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span className={HAMBURGER_ICON_CLASS(menuOpen)}></span>
        <span className={HAMBURGER_ICON_MIDDLE_CLASS(menuOpen)}></span>
        <span className={HAMBURGER_ICON_BOTTOM_CLASS(menuOpen)}></span>
      </button>

      {/* メニュー本体 */}
      <div className={getMenuContainerClass(menuOpen)}>
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

        {/* ユーザーの情報 ログイン中 */}
        {userInfo && (
          <div className={USER_INFO_CLASS}>
            {userInfo.displayName} ({userInfo.role})
          </div>
        )}
      </div>
    </nav>
  )
}
