'use client'

import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/') // ログイン後トップページに遷移
    } catch (err: any) {
      console.error('ログインエラー:', err)
      setError('メールアドレスまたはパスワードが正しくありません')
    }
  }

  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">ログイン</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block mb-1">メールアドレス</label>
          <input
            type="email"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1">パスワード</label>
          <input
            type="password"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          ログイン
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        アカウントをお持ちでない方は{' '}
        <a href="/signup" className="text-blue-500 hover:underline">
          新規登録はこちら
        </a>
      </p>
    </main>
  )
}
