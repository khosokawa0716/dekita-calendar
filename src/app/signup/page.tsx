'use client'

import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAlreadyLoggedInRedirect } from '@/hooks/useAlreadyLoggedInRedirect'
import Link from 'next/link'
import { userAPI } from '@/lib/api'

export default function SignupPage() {
  // 既にログインしている場合はトップページにリダイレクト
  useAlreadyLoggedInRedirect()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('child')
  const [error, setError] = useState('')
  const [modalMessage, setModalMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // バリデーション
    if (!email.includes('@')) {
      setError('メールアドレスの形式が正しくありません')
      return
    }
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      return
    }
    if (role !== 'parent' && role !== 'child') {
      setError('ロールの選択が正しくありません')
      return
    }

    setError('')
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      const uid = userCredential.user.uid

      await userAPI.create(uid, {
        email,
        displayName: email.split('@')[0], // メールアドレスの@マーク前を初期名に
        role: role as 'parent' | 'child',
        familyId: '', // あとで設定できるようにする想定
      })

      setModalMessage('登録に成功しました！')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setModalMessage(`登録に失敗しました: ${error.message}`)
    }
  }

  return (
    <main>
      <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold">ユーザー登録</h1>

        <div>
          <label className="block mb-1">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border px-3 py-2 w-full"
            required
          />
        </div>

        <div>
          <label className="block mb-1">パスワード（6文字以上）</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border px-3 py-2 w-full"
            required
          />
        </div>

        <div>
          <label className="block mb-1">ユーザーの種類</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border px-3 py-2 w-full"
          >
            <option value="parent">保護者</option>
            <option value="child">子ども</option>
          </select>
        </div>

        {error && <p className="text-red-500 font-semibold">{error}</p>}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          登録する
        </button>

        {modalMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded p-6 shadow-lg text-center w-80">
              <p className="mb-4">{modalMessage}</p>
              <button
                onClick={() => setModalMessage(null)}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </form>
      <p className="text-center mt-4">
        すでにアカウントをお持ちですか？{' '}
        <Link href="/login" className="text-blue-500 hover:underline">
          ログインはこちら
        </Link>
      </p>
    </main>
  )
}
