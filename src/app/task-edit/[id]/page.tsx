'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export default function TaskEditPage() {
  const { id } = useParams()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true)
      if (!id || typeof id !== 'string') return

      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          router.push('/login')
          return
        }

        const taskRef = doc(db, 'tasks', id)
        const taskSnap = await getDoc(taskRef)

        if (!taskSnap.exists()) {
          alert('タスクが見つかりません')
          router.push('/tasks')
          return
        }

        const data = taskSnap.data()
        if (data.createdBy !== user.uid) {
          alert('このタスクを編集する権限がありません')
          router.push('/tasks')
          return
        }

        setTitle(data.title || '')
        setLoading(false)
      })

      const taskRef = doc(db, 'tasks', id)
      const taskSnap = await getDoc(taskRef)
      if (taskSnap.exists()) {
        const data = taskSnap.data()
        setTitle(data.title || '')
      }
      setLoading(false)
    }
    fetchTask()
  }, [id])

  const handleUpdate = async () => {
    if (!id || typeof id !== 'string') return
    const taskRef = doc(db, 'tasks', id)
    await updateDoc(taskRef, { title })
    router.push('/tasks') // 保存後に一覧へ戻る
  }

  if (loading) return <p>読み込み中...</p>

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">タスク編集</h1>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border px-2 py-1 rounded w-full"
      />
      <button
        onClick={handleUpdate}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        保存する
      </button>
    </main>
  )
}
