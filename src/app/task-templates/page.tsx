'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useUserInfo } from '@/hooks/useUserInfo'
import Link from 'next/link'

type TaskTemplate = {
  id: string
  title: string
  createdBy: string
  familyId: string
  createdAt: any
}

export default function TaskTemplateListPage() {
  const { userInfo, loading } = useUserInfo()
  const [templates, setTemplates] = useState<TaskTemplate[]>([])

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!userInfo) return

      try {
        const q = query(
          collection(db, 'taskTemplates'),
          where('familyId', '==', userInfo.familyId)
        )
        const snapshot = await getDocs(q)
        const list: TaskTemplate[] = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            title: data.title,
            createdBy: data.createdBy,
            familyId: data.familyId,
            createdAt: data.createdAt,
          }
        })
        setTemplates(list)
      } catch (error) {
        console.error('テンプレート取得エラー:', error)
      }
    }

    fetchTemplates()
  }, [userInfo])

  if (loading) return <p>読み込み中...</p>

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">テンプレート一覧</h1>
      <Link
        href="/task-templates/create"
        className="text-blue-500 underline mb-4 block"
      >
        新しいテンプレートを作成
      </Link>
      {templates.length === 0 ? (
        <p>テンプレートがありません。</p>
      ) : (
        <ul className="space-y-2">
          {templates.map((template) => (
            <li key={template.id} className="p-2 border rounded">
              {template.title}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
