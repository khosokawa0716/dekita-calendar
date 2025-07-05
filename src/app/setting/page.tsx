'use client'

import { useUserInfo } from '@/hooks/useUserInfo'
import { auth, db } from '@/lib/firebase'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from 'firebase/auth'
import { useState, useEffect } from 'react'
import { RoleGuard } from '@/components/RoleGuard'

export default function SettingsPage() {
  const { userInfo } = useUserInfo()
  console.log('userInfo:', userInfo)
  console.log('userInfo?.role:', userInfo?.role)
  const [displayName, setDisplayName] = useState(userInfo?.displayName ?? '')
  const [role, setRole] = useState<'parent' | 'child'>(
    userInfo?.role ?? 'parent'
  )
  const [familyId, setFamilyId] = useState(userInfo?.familyId ?? '')

  const handleSubmit = async () => {
    if (!userInfo) return
    const userRef = doc(db, 'users', userInfo.id)
    await updateDoc(userRef, { displayName, role, familyId })
    alert('設定を保存しました')
    // router.refresh() など必要に応じて
  }

  useEffect(() => {
    if (userInfo) {
      setDisplayName(userInfo.displayName)
      setRole(userInfo.role)
      setFamilyId(userInfo.familyId)
    }
  }, [userInfo])

  const handleDeleteAccount = async () => {
    if (!userInfo || !auth.currentUser) return

    const confirmed = window.confirm('本当にアカウントを削除しますか？')
    if (!confirmed) return

    const email = auth.currentUser.email
    if (!email) return alert('ログイン情報が不足しています')

    const password = window.prompt('確認のため、パスワードを再入力してください')
    if (!password) return

    try {
      const credential = EmailAuthProvider.credential(email, password)

      // 再認証
      await reauthenticateWithCredential(auth.currentUser, credential)

      // Firestoreのデータ削除
      await deleteDoc(doc(db, 'users', userInfo.id))

      // Firebase Authから削除
      await deleteUser(auth.currentUser)

      alert('アカウントを削除しました')
      location.href = '/login'
    } catch (error) {
      console.error('アカウント削除エラー:', error)
      alert('削除に失敗しました')
    }
  }

  return (
    <RoleGuard allowedRoles={['parent', 'child']}>
      <main className="p-4">
        <h1 className="text-xl font-bold mb-4">アカウント設定</h1>

        <label className="block mb-2">
          ニックネーム:
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="border px-2 py-1 w-full"
          />
        </label>

        <div className="mb-2">
          ロール:
          <label className="ml-2">
            <input
              type="radio"
              value="parent"
              checked={role === 'parent'}
              onChange={() => setRole('parent')}
            />
            親
          </label>
          <label className="ml-4">
            <input
              type="radio"
              value="child"
              checked={role === 'child'}
              onChange={() => setRole('child')}
            />
            子
          </label>
        </div>

        <label className="block mb-4">
          ファミリーID:
          <input
            type="text"
            value={familyId}
            onChange={(e) => setFamilyId(e.target.value)}
            className="border px-2 py-1 w-full"
          />
        </label>

        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          保存
        </button>

        <button
          onClick={handleDeleteAccount}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          アカウントを削除する
        </button>
      </main>
    </RoleGuard>
  )
}
