'use client'

import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/login') // ログアウト後はログイン画面へ
    } catch (error) {
      console.error('ログアウト失敗:', error)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      ログアウト
    </button>
  )
}
