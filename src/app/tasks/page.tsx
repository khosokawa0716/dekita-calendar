'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import { getTodayString } from '@/lib/dateUtils'
import { Task } from '@/types/task'
import { useFamilyChildren } from '@/hooks/useFamilyChildren'
import { taskAPI, achievementAPI } from '@/lib/api'
import { useUserInfo } from '@/hooks/useUserInfo'
import { Timestamp } from 'firebase/firestore'
import { ParentTaskList } from '@/components/pages/ParentTaskList'

export default function TaskListPage() {
  useAuthRedirect()
  const { userInfo } = useUserInfo()
  const { children } = useFamilyChildren(userInfo?.familyId)
  const [tasks, setTasks] = useState<Task[]>([])

  const fetchTasks = useCallback(async () => {
    if (!userInfo) return

    try {
      const today = getTodayString()
      const taskList = await taskAPI.getByFamilyIdAndDate(
        userInfo.familyId,
        today
      )
      setTasks(taskList)
    } catch (error) {
      console.error('タスク取得エラー:', error)
    }
  }, [userInfo])

  const toggleCompleted = async (task: Task, childId: string) => {
    try {
      const currentStatus = task.childrenStatus[childId]
      const newCompleted = !currentStatus.isCompleted

      const updatedChildrenStatus = {
        ...task.childrenStatus,
        [childId]: {
          ...currentStatus,
          isCompleted: newCompleted,
          completedAt: newCompleted
            ? Timestamp.fromDate(new Date())
            : undefined,
        },
      }

      await taskAPI.update(task.id, { childrenStatus: updatedChildrenStatus })

      const today = getTodayString()
      if (newCompleted) {
        await achievementAPI.incrementCount(childId, today)
      } else {
        await achievementAPI.decrementCount(childId, today)
      }

      fetchTasks()
    } catch (error) {
      console.error('更新エラー:', error)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [userInfo, fetchTasks])
  if (!userInfo) return null

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">今日のタスク一覧</h1>
      {tasks.length === 0 ? (
        <p className="text-gray-500">今日のタスクはありません。</p>
      ) : userInfo.role === 'parent' ? (
        <ParentTaskList
          tasks={tasks}
          childrenData={children}
          toggleCompleted={toggleCompleted}
        />
      ) : (
        <></>
      )}
    </main>
  )
}
