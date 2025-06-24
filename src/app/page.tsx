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
  addDoc,
  setDoc,
  getDoc,
} from 'firebase/firestore'

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

function getTodayString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTitle, setNewTitle] = useState('')

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
      const taskList: Task[] = snapshot.docs.map(doc => {
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
      console.error('Firestore エラー:', error)
    }
  }

  const addTask = async () => {
    const testUserId = "test_user_1" // ユーザーIDは適宜変更
    if (newTitle.trim() === '') return

    try {
      const today = getTodayString()
      const taskData: Omit<Task, 'id'> = {
        title: newTitle,
        isCompleted: false,
        date: today,
        userId: testUserId, // ユーザーIDを追加
        childComment: "",
        createdBy: "parent_001",
        familyId: "family_test_1",
      }
      const docRef = await addDoc(collection(db, 'tasks'), taskData)
      console.log('新しいタスクが追加されました:', docRef.id)

      setNewTitle('')
      fetchTasks() // タスクを再取得
    } catch (error) {
      console.error('タスクの追加エラー:', error)
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
      <div className="mb-4">
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
      </div>
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
