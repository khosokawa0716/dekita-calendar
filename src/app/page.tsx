'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  setDoc,
  getDoc,
} from 'firebase/firestore'

type Task = {
  id: string
  userId?: string // ユーザーIDはオプションに変更
  title: string
  isCompleted: boolean
}

function getTodayString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])

  const fetchTasks = async () => {
    try {
      const today = getTodayString()
      const q = query(
        collection(db, 'tasks'),
        where('date', '==', today)
      )
      const snapshot = await getDocs(q)
      console.log('Firestore からのデータ:', snapshot.docs)
      // ドキュメントのデータからタスクを抽出
      const taskList: Task[] = snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title as string,
        isCompleted: doc.data().isCompleted as boolean,
        userId: doc.data().userId,
      }))
      setTasks(taskList)
    } catch (error) {
      console.error('Firestore エラー:', error)
    }
  }

  const toggleCompleted = async (task: Task) => {
    try {
      const newCompleted = !task.isCompleted
      const taskRef = doc(db, 'tasks', task.id)
      await updateDoc(taskRef, {
        isCompleted: newCompleted,
      })

      // Achievementsの更新
      const today = getTodayString()
      const achievementRef = doc(db, 'achievements', `${task.userId}_${today}`)
      const achievementSnap = await getDoc(achievementRef)

      const currentCount = achievementSnap.exists()
        ? achievementSnap.data().completedCount || 0
        : 0

      const newCount = newCompleted ? currentCount + 1 : Math.max(currentCount - 1, 0)
      await setDoc(achievementRef, {
        userId: task.userId,
        date: today,
        completedCount: newCount,
      })
      
      fetchTasks() // 更新後に再取得
    } catch (error) {
      console.error('タスクの更新エラー:', error)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-2">テスト表示（tasks一覧）</h1>
      {tasks.length === 0 ? (
        <p className="text-gray-500">今日のタスクはありません。</p>
      ) : (
      <ul className="list-none space-y-2">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={task.isCompleted}
              onChange={() => toggleCompleted(task)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className={`flex-1 ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
              {task.title}
            </span>
          </li>
        ))}
      </ul>)}
    </main>
  )
}
