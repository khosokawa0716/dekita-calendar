'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

function getTodayString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function Home() {
  const [tasks, setTasks] = useState<string[]>([])

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const today = getTodayString()
        const q = query(
          collection(db, 'tasks'),
          where('date', '==', today)
        )
        const snapshot = await getDocs(q)
        console.log('Firestore からのデータ:', snapshot.docs)
        // ドキュメントのデータからタイトルを抽出
        const titles = snapshot.docs.map(doc => doc.data().title as string)
        setTasks(titles)
      } catch (error) {
        console.error('Firestore エラー:', error)
      }
    }

    fetchTasks()
  }, [])

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-2">テスト表示（tasks一覧）</h1>
      {tasks.length === 0 ? (
        <p className="text-gray-500">今日のタスクはありません。</p>
      ) : (
      <ul className="list-disc list-inside">
        {tasks.map((task, idx) => (
          <li key={idx}>{task}</li>
        ))}
      </ul>)}
    </main>
  )
}
