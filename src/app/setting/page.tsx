'use client'

import { useUserInfo } from '@/hooks/useUserInfo'
import { auth } from '@/lib/firebase'
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from 'firebase/auth'
import { useState, useEffect } from 'react'
import LogoutButton from '@/components/LogoutButton'
import Toast from '@/components/Toast'
import { RoleGuard } from '@/components/RoleGuard'
import { userAPI } from '@/lib/api'

export default function SettingsPage() {
  const { userInfo } = useUserInfo()
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)
  const [displayName, setDisplayName] = useState(userInfo?.displayName ?? '')
  const [familyId, setFamilyId] = useState(userInfo?.familyId ?? '')

  const handleSubmit = async () => {
    if (!userInfo) return
    try {
      await userAPI.update(userInfo.id, { displayName, familyId })
      setToast({ message: '設定を保存しました', type: 'success' })
    } catch (error) {
      console.error('設定保存エラー:', error)
      setToast({ message: '保存に失敗しました', type: 'error' })
    }
  }

  useEffect(() => {
    if (userInfo) {
      setDisplayName(userInfo.displayName)
      setFamilyId(userInfo.familyId)
    }
  }, [userInfo])

  const handleDeleteAccount = async () => {
    if (!userInfo || !auth.currentUser) return

    const confirmed = window.confirm('本当にアカウントを削除しますか？')
    if (!confirmed) return

    const email = auth.currentUser.email
    if (!email)
      return setToast({
        message: 'ログイン情報が不足しています',
        type: 'error',
      })

    const password = window.prompt('確認のため、パスワードを再入力してください')
    if (!password) return

    try {
      const credential = EmailAuthProvider.credential(email, password)

      // 再認証
      await reauthenticateWithCredential(auth.currentUser, credential)

      // Firestoreのデータ削除
      await userAPI.delete(userInfo.id)

      // Firebase Authから削除
      await deleteUser(auth.currentUser)

      setToast({ message: 'アカウントを削除しました', type: 'success' })
      location.href = '/login'
    } catch (error) {
      console.error('アカウント削除エラー:', error)
      setToast({ message: '削除に失敗しました', type: 'error' })
    }
  }

  return (
    <RoleGuard allowedRoles={['parent', 'child']}>
      <main className="p-4">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
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
          ユーザータイプ:{' '}
          <span className="font-medium">
            {userInfo?.role === 'parent' ? '親' : '子'}
          </span>
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

        <div className="flex flex-col sm:flex-row gap-2 mt-6">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full sm:w-auto"
          >
            保存
          </button>
          <div className="w-full sm:w-auto">
            <LogoutButton />
          </div>
          <button
            onClick={handleDeleteAccount}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full sm:w-auto"
          >
            アカウントを削除する
          </button>
        </div>
      </main>
    </RoleGuard>
  )
}
