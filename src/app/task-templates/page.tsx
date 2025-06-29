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
import { getTodayString } from '@/lib/dateUtils'

type TaskTemplate = {
  id: string
  title: string
  createdBy: string
  familyId: string
  repeatType?: 'none' | 'everyday' | 'weekday' | 'custom'
  repeatDays?: number[]
  createdAt: any
}

const repeatTypeLabel = (type: string, days?: number[]) => {
  switch (type) {
    case 'everyday':
      return '毎日'
    case 'weekday':
      return '平日'
    case 'custom':
      if (!days || days.length === 0) return '曜日指定なし'
      const labels = ['日', '月', '火', '水', '木', '金', '土']
      return `曜日指定: ${days.map((d) => labels[d]).join(', ')}`
    default:
      return ''
  }
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
        const list = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
          }
        }) as TaskTemplate[]
        setTemplates(list)
      } catch (error) {
        console.error('テンプレート取得エラー:', error)
      }
    }

    fetchTemplates()
  }, [userInfo])

  if (loading) return <p>読み込み中...</p>

  const handleGenerateTodayTasks = async () => {
    if (!userInfo) {
      console.log('userInfo が未取得のため中断')
      return
    }

    const today = new Date()
    const day = today.getDay() // 0:日曜, 1:月曜...
    const todayStr = getTodayString() // 例: "2025-06-27"
    console.log('本日の日付:', todayStr, '曜日:', day)

    try {
      const templatesRef = collection(db, 'taskTemplates')
      const q = query(
        templatesRef,
        where('createdBy', '==', userInfo.id),
        where('familyId', '==', userInfo.familyId)
      )
      const snapshot = await getDocs(q)
      console.log('テンプレートの取得件数:', snapshot.docs.length)

      const matchedTemplates = snapshot.docs.filter((doc) => {
        const data = doc.data()
        const type = data.repeatType
        console.log('テンプレート:', data.title, 'repeatType:', type)
        if (type === 'everyday') return true
        if (type === 'weekday' && day >= 1 && day <= 5) return true
        if (type === 'custom' && Array.isArray(data.repeatDays)) {
          return data.repeatDays.includes(day)
        }
        return false
      })
      console.log('マッチしたテンプレート数:', matchedTemplates.length)

      for (const template of matchedTemplates) {
        const data = template.data()
        console.log('タスク生成対象テンプレート:', data)
        // 🔒 同じテンプレートIDの今日のタスクが既に存在しているかチェック
        const tasksRef = collection(db, 'tasks')
        const taskQuery = query(
          tasksRef,
          where('createdBy', '==', userInfo.id),
          where('date', '==', todayStr),
          where('title', '==', data.title) // ← タイトルで判別（必要なら他のフィールドも追加）
        )
        const existingTasks = await getDocs(taskQuery)
        if (!existingTasks.empty) {
          console.log(`既にタスクあり: ${data.title}`)
          continue // スキップ
        }

        const taskData = {
          title: data.title,
          isCompleted: false,
          date: todayStr,
          userId: userInfo.id,
          familyId: userInfo.familyId,
          createdBy: userInfo.id,
          childComment: '',
        }

        console.log('登録するタスクデータ:', taskData)
        await addDoc(collection(db, 'tasks'), taskData)
        console.log('タスクを登録しました:', data.title)
      }

      alert('本日のタスクを生成しました🐸')
    } catch (error) {
      console.error('タスク生成エラー:', error)
      alert('生成に失敗しました')
    }
  }

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
      <button
        onClick={handleGenerateTodayTasks}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        本日のタスクを生成
      </button>
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
              <div>
                <div className="font-semibold">{template.title}</div>
                <div className="text-sm text-gray-600">
                  {repeatTypeLabel(
                    template.repeatType || 'none',
                    template.repeatDays
                  )}
                </div>
              </div>
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
