'use client'

import { useEffect, useState } from 'react'
import { useUserInfo } from '@/hooks/useUserInfo'
import Calendar from '@/components/Calendar'
import { RoleGuard } from '@/components/RoleGuard'
import { taskAPI } from '@/lib/api'

type TaskData = {
  [dateStr: string]: {
    total: number
    completed: number
  }
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

      const tasks = await taskAPI.getByFamilyIdAndDateRange(
        userInfo.familyId,
        startStr,
        endStr
      )
      const data: TaskData = {}

      tasks.forEach((task) => {
        const date = task.date

        if (!data[date]) {
          data[date] = { total: 0, completed: 0 }
        }

        // カレンダーに表示するためのタスクデータを構築
        // 親の場合は、全ての子どもが完了しているかを確認
        // 子どもの場合は、自分のIDで完了状態を確認
        if (userInfo.role === 'parent') {
          data[date].total += 1
          const allCompleted = Object.values(task.childrenStatus).every(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (status: any) => status.isCompleted
          )
          if (allCompleted) {
            data[date].completed += 1
          }
        } else if (userInfo.role === 'child') {
          // 子どもユーザーの場合は、自分のIDで完了状態を確認
          const childStatus = task.childrenStatus[userInfo.id]
          if (childStatus) {
            // 自分に割り当てられているタスクのみカウント
            data[date].total += 1
            if (childStatus.isCompleted) {
              data[date].completed += 1
            }
          }
        }
      })
      setTaskData(data)
    }

    fetchTasks()
  }, [userInfo, currentDate])

  return (
    <RoleGuard allowedRoles={['parent', 'child']}>
      <main className="p-2">
        <Calendar taskData={taskData} />
      </main>
    </RoleGuard>
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
