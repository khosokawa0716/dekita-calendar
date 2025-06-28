'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useUserInfo } from '@/hooks/useUserInfo'
import { serverTimestamp } from 'firebase/firestore'

export default function TaskTemplateCreatePage() {
  const router = useRouter()
  const { userInfo } = useUserInfo() // ユーザー情報を取得するカスタムフックを使用
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    console.log('テンプレート登録処理開始')
    console.log('ユーザー情報:', userInfo)
    console.log('テンプレートタイトル:', title)
    if (!userInfo) return
    if (!title.trim()) {
      alert('タイトルは必須です')
      return
    }

    setLoading(true)
    try {
      await addDoc(collection(db, 'taskTemplates'), {
        title,
        createdBy: userInfo.id,
        familyId: userInfo.familyId, // ユーザーのファミリーIDを使用
        createdAt: serverTimestamp(), // 作成日時を自動で設定
      })
      alert('テンプレートを追加しました')
      router.push('/tasks') // 登録後に一覧などへ遷移（必要に応じて変更）
    } catch (error) {
      console.error('テンプレート追加エラー:', error)
      alert('登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">テンプレート作成</h1>
      <input
        type="text"
        placeholder="テンプレート名"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border px-2 py-1 rounded w-full mb-4"
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? '登録中...' : '登録する'}
      </button>
    </main>
  )
}
