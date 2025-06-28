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
  getDoc,
  setDoc,
} from 'firebase/firestore'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import { getTodayString } from '@/lib/dateUtils' // 共通化していればこちらを使用
import Link from 'next/link'

type Task = {
  id: string
  title: string
  isCompleted: boolean
  date: string
  userId: string
  childComment: string
  createdBy: string
  familyId: string
}

export default function TaskListPage() {
  useAuthRedirect()
  const [tasks, setTasks] = useState<Task[]>([])

  const fetchTasks = async () => {
    try {
      const today = getTodayString()
      const q = query(collection(db, 'tasks'), where('date', '==', today))
      const snapshot = await getDocs(q)
      const taskList: Task[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          title: data.title,
          isCompleted: data.isCompleted,
          date: data.date,
          userId: data.userId,
          childComment: data.childComment,
          createdBy: data.createdBy,
          familyId: data.familyId,
        }
      })
      setTasks(taskList)
    } catch (error) {
      console.error('タスク取得エラー:', error)
    }
  }

  const toggleCompleted = async (task: Task) => {
    try {
      const newCompleted = !task.isCompleted
      const taskRef = doc(db, 'tasks', task.id)
      await updateDoc(taskRef, {
        isCompleted: newCompleted,
      })

      const today = getTodayString()
      const achievementRef = doc(db, 'achievements', `${task.userId}_${today}`)
      const achievementSnap = await getDoc(achievementRef)

      const currentCount = achievementSnap.exists()
        ? achievementSnap.data().completedCount || 0
        : 0

      const newCount = newCompleted
        ? currentCount + 1
        : Math.max(currentCount - 1, 0)

      await setDoc(achievementRef, {
        userId: task.userId,
        date: today,
        completedCount: newCount,
      })

      fetchTasks()
    } catch (error) {
      console.error('更新エラー:', error)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">今日のタスク一覧</h1>
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
              <span
                className={`flex-1 ${task.isCompleted ? 'line-through text-gray-500' : ''}`}
              >
                {task.title}
              </span>
              <Link
                href={`/task-edit/${task.id}`}
                className="text-blue-500 underline text-sm"
              >
                編集する
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
