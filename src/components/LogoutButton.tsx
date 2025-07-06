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
      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full sm:w-auto"
    >
      ログアウト
    </button>
  )
}
