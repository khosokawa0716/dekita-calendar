'use client'

import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('child')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const uid = userCredential.user.uid

      await setDoc(doc(db, 'users', uid), {
        email,
        role, // ← ここで保存
        familyId: '', // あとで設定できるようにする想定
        createdAt: new Date(),
      })

      alert('登録成功！')
    } catch (error) {
      console.error('登録エラー:', error)
      alert('登録に失敗しました')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold">ユーザー登録</h1>

      <div>
        <label className="block mb-1">メールアドレス</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border px-3 py-2 w-full"
          required
        />
      </div>

      <div>
        <label className="block mb-1">パスワード（6文字以上）</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border px-3 py-2 w-full"
          required
        />
      </div>

      <div>
        <label className="block mb-1">ユーザーの種類</label>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="border px-3 py-2 w-full"
        >
          <option value="parent">保護者</option>
          <option value="child">子ども</option>
        </select>
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        登録する
      </button>
    </form>
  )
}