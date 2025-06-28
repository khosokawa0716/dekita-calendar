'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useUserInfo } from '@/hooks/useUserInfo'

export default function TaskTemplateEditPage() {
  const router = useRouter()

  const { id } = useParams()
  const templateId = id as string

  const { userInfo, loading } = useUserInfo()
  const [title, setTitle] = useState('')
  const [templateLoaded, setTemplateLoaded] = useState(false)

  useEffect(() => {
    console.log(
      'useEffect called with userInfo:',
      userInfo,
      'templateId:',
      templateId,
      'loading:',
      loading
    )
    const fetchTemplate = async () => {
      if (loading || !userInfo || !templateId) {
        console.log('まだ準備ができていません:', {
          loading,
          userInfo,
          templateId,
        })
        return
      }

      const templateRef = doc(db, 'taskTemplates', templateId)
      const templateSnap = await getDoc(templateRef)
      console.log(
        'Fetched template:',
        templateSnap.exists(),
        templateSnap.data()
      )
      if (!templateSnap.exists()) {
        alert('テンプレートが見つかりません🐸')
        router.push('/tasks')
        return
      }
      console.log('ユーザー情報:', userInfo, 'テンプレートID:', templateId)
      const data = templateSnap.data()
      if (data.createdBy !== userInfo.id) {
        alert('このテンプレートを編集する権限がありません')
        router.push('/tasks')
        return
      }

      setTitle(data.title)
      setTemplateLoaded(true)
    }

    fetchTemplate()
  }, [loading, userInfo, templateId, router])

  const handleUpdate = async () => {
    if (!title.trim()) {
      alert('タイトルを入力してください')
      return
    }

    try {
      const templateRef = doc(db, 'taskTemplates', templateId!)
      await updateDoc(templateRef, {
        title,
      })
      alert('テンプレートを更新しました')
      router.push('/tasks')
    } catch (error) {
      console.error('テンプレート更新エラー:', error)
      alert('更新に失敗しました')
    }
  }

  if (loading || !templateLoaded) return <p className="p-4">読み込み中...</p>

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">テンプレート編集</h1>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border px-2 py-1 rounded w-full mb-4"
        placeholder="テンプレート名"
      />
      <button
        onClick={handleUpdate}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        更新する
      </button>
    </main>
  )
}
