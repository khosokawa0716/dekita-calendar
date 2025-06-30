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

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState<any[]>([])

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

  // 日付がクリックされたときにタスクを取得してモーダル表示
  const handleDateClick = async (dateStr: string) => {
    if (!userInfo) return

    const tasksRef = collection(db, 'tasks')
    const q = query(
      tasksRef,
      where('date', '==', dateStr),
      where('userId', '==', userInfo.id),
      where('familyId', '==', userInfo.familyId)
    )
    const snapshot = await getDocs(q)
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    setTasksForSelectedDate(tasks)
    setSelectedDate(dateStr)
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">カレンダー表示</h1>
      <Calendar taskData={taskData} onDateClick={handleDateClick} />
      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-2">{selectedDate} のタスク</h2>
            <ul className="max-h-60 overflow-y-auto">
              {tasksForSelectedDate.length > 0 ? (
                tasksForSelectedDate.map((task) => (
                  <li key={task.id} className="py-1 border-b last:border-none">
                    ✅ {task.title}
                  </li>
                ))
              ) : (
                <li className="text-gray-500">タスクはありません</li>
              )}
            </ul>
            <button
              onClick={() => setSelectedDate(null)}
              className="mt-4 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
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
