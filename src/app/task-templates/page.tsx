'use client'

import { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore'
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

  const handleAddTask = async (template: TaskTemplate) => {
    if (!userInfo) return

    const today = new Date()
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    try {
      await addDoc(collection(db, 'tasks'), {
        title: template.title,
        isCompleted: false,
        date: dateStr,
        userId: userInfo.id,
        createdBy: userInfo.id,
        familyId: userInfo.familyId,
        childComment: '',
      })
      alert('今日のタスクに追加しました')
    } catch (error) {
      console.error('タスク追加エラー:', error)
      alert('追加に失敗しました')
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = confirm('このテンプレートを削除してもよろしいですか？')
    if (!confirmed) return

    try {
      await deleteDoc(doc(db, 'taskTemplates', id))
      alert('テンプレートを削除しました')
      // 一覧の再取得 or ローカルstateから削除
      setTemplates((prev) => prev.filter((t) => t.id !== id))
    } catch (error) {
      console.error('テンプレート削除エラー:', error)
      alert('削除に失敗しました')
    }
  }

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
            <li key={template.id} className="p-2 bg-gray-100 rounded shadow">
              {template.title}
              <button
                onClick={() => handleAddTask(template)}
                className="ml-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                今日のタスクに追加
              </button>
              <Link
                href={`/task-templates/edit/${template.id}`}
                className="text-blue-500 underline hover:text-blue-700"
              >
                編集
              </Link>
              <button
                onClick={() => handleDelete(template.id)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                削除
              </button>
              <div className="text-sm text-gray-500">
                作成者: {template.createdBy} | 作成日:{' '}
                {new Date(
                  template.createdAt.seconds * 1000
                ).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
