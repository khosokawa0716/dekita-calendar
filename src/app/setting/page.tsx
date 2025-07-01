'use client'

import { useUserInfo } from '@/hooks/useUserInfo'
import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { useState, useEffect, use } from 'react'

export default function SettingsPage() {
  const { userInfo } = useUserInfo()
  console.log('userInfo:', userInfo)
  console.log('userInfo?.role:', userInfo?.role)
  const [name, setName] = useState(userInfo?.displayName ?? '')
  const [role, setRole] = useState<'parent' | 'child'>(
    userInfo?.role ?? 'parent'
  )
  const [familyId, setFamilyId] = useState(userInfo?.familyId ?? '')

  const handleSubmit = async () => {
    if (!userInfo) return
    const userRef = doc(db, 'users', userInfo.id)
    await updateDoc(userRef, { name, role, familyId })
    alert('設定を保存しました')
    // router.refresh() など必要に応じて
  }

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.displayName)
      setRole(userInfo.role)
      setFamilyId(userInfo.familyId)
    }
  }, [userInfo])

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">アカウント設定</h1>

      <label className="block mb-2">
        ニックネーム:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
    </main>
  )
}
