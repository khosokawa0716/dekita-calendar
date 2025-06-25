'use client'

import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Firestoreにユーザー情報を保存（仮：親として登録）
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'parent', // 仮にparent固定（後で選択UIを追加予定）
        familyId: `family_${user.uid}`,
      })

      alert('登録完了しました！')
    } catch (error) {
      console.error('登録エラー:', error)
      alert('登録に失敗しました')
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">ユーザー登録</h1>
      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full"
      />
      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full"
      />
      <button
        onClick={handleSignup}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        登録
      </button>
    </div>
  )
}