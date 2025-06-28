'use client'

import { useState } from 'react'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getTodayString } from '@/lib/dateUtils'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import { useUserInfo } from '@/hooks/useUserInfo'

export default function TaskAddPage() {
  useAuthRedirect()
  const { userInfo } = useUserInfo()

  const [newTitle, setNewTitle] = useState('')
  if (!userInfo) return <div>Loading...</div>

  const addTask = async () => {
    if (newTitle.trim() === '') return

    try {
      const today = getTodayString()
      const taskData = {
        title: newTitle,
        isCompleted: false,
        date: today,
        userId: userInfo.id,
        childComment: '',
        createdBy: userInfo.id,
        familyId: userInfo.familyId,
      }
      await addDoc(collection(db, 'tasks'), taskData)
      alert('タスクを登録しました')
      setNewTitle('')
    } catch (error) {
      console.error('タスクの追加エラー:', error)
      alert('登録に失敗しました')
    }
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">タスクを登録する</h1>
      <input
        type="text"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        placeholder="タスク名を入力"
        className="border px-2 py-1 rounded w-full"
      />
      <button
        onClick={addTask}
        className="mt-2 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
      >
        追加する
      </button>
    </main>
  )
}
