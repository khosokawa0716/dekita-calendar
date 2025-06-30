'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useUserInfo } from '@/hooks/useUserInfo'
import Calendar from '@/components/Calendar'

type TaskData = {
  [dateStr: string]: { total: number; completed: number }
}

export default function CalendarPage() {
  const { userInfo } = useUserInfo()
  const [taskData, setTaskData] = useState<TaskData>({})
  const [currentDate] = useState(new Date()) // 現在の月を保持

  useEffect(() => {
    if (!userInfo) return

    const fetchTasks = async () => {
      const start = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      )
      const end = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      )

      const startStr = formatDate(start, 'yyyy-MM-dd')
      const endStr = formatDate(end, 'yyyy-MM-dd')

      const q = query(
        collection(db, 'tasks'),
        where('familyId', '==', userInfo.familyId),
        where('date', '>=', startStr),
        where('date', '<=', endStr)
      )

      const snapshot = await getDocs(q)

      const data: TaskData = {}

      snapshot.forEach((doc) => {
        const task = doc.data()
        const date = task.date

        if (!data[date]) {
          data[date] = { total: 0, completed: 0 }
        }

        data[date].total += 1
        if (task.isCompleted) {
          data[date].completed += 1
        }
      })

      setTaskData(data)
    }

    fetchTasks()
  }, [userInfo, currentDate])

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">カレンダー表示</h1>
      <Calendar taskData={taskData} />
    </main>
  )
}

// 補助関数（本体と同じ定義に合わせて再掲）
function formatDate(date: Date, format: string): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return format
    .replace('yyyy', year.toString())
    .replace('MM', month.toString().padStart(2, '0'))
    .replace('dd', day.toString().padStart(2, '0'))
    .replace('d', day.toString())
}
