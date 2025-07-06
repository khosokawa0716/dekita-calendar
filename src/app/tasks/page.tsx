'use client'

import { useEffect, useState } from 'react'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import { getTodayString } from '@/lib/dateUtils'
import Link from 'next/link'
import { RoleGuard } from '@/components/RoleGuard'
import { Task } from '@/types/task'
import { useFamilyChildren } from '@/hooks/useFamilyChildren'
import { taskAPI, achievementAPI } from '@/lib/api'
import { useUserInfo } from '@/hooks/useUserInfo'

export default function TaskListPage() {
  useAuthRedirect()
  const { userInfo } = useUserInfo()
  const { children } = useFamilyChildren(userInfo?.familyId)
  const [tasks, setTasks] = useState<Task[]>([])

  const fetchTasks = async () => {
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
  }

  const toggleCompleted = async (task: Task, childId: string) => {
    try {
      const currentStatus = task.childrenStatus[childId]
      const newCompleted = !currentStatus.isCompleted

      const updatedChildrenStatus = {
        ...task.childrenStatus,
        [childId]: {
          ...currentStatus,
          isCompleted: newCompleted,
          completedAt: newCompleted ? new Date() : undefined,
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
  }, [userInfo])

  // 子どもの名前を取得するヘルパー関数
  const getChildName = (childId: string) => {
    const child = children.find((c) => c.id === childId)
    return child ? child.displayName : 'Unknown'
  }

  // タスクの完了状況を取得
  const getTaskCompletionStatus = (task: Task) => {
    const completed = Object.values(task.childrenStatus).filter(
      (status) => status.isCompleted
    ).length
    const total = Object.keys(task.childrenStatus).length
    return { completed, total }
  }

  return (
    <RoleGuard allowedRoles={['parent']}>
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">今日のタスク一覧</h1>
        {tasks.length === 0 ? (
          <p className="text-gray-500">今日のタスクはありません。</p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const { completed, total } = getTaskCompletionStatus(task)
              return (
                <div
                  key={task.id}
                  className="bg-white p-4 rounded-lg border shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{task.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        完了状況: {completed}/{total} 人
                      </p>

                      {/* 子どもごとの詳細状況 */}
                      {task.childrenStatus &&
                        Object.keys(task.childrenStatus).length > 0 && (
                          <div className="mt-3 space-y-2">
                            {Object.entries(task.childrenStatus).map(
                              ([childId, status]) => (
                                <div
                                  key={childId}
                                  className="flex items-center space-x-2 text-sm cursor-pointer"
                                  onClick={() => toggleCompleted(task, childId)}
                                >
                                  <span
                                    className={`w-4 h-4 rounded-full ${status.isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}
                                  ></span>
                                  <span>{getChildName(childId)}</span>
                                  {status.isCompleted && (
                                    <span className="text-green-600">
                                      ✓ 完了
                                    </span>
                                  )}
                                  {status.comment && (
                                    <span className="text-gray-500">
                                      - {status.comment}
                                    </span>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </div>

                    <Link
                      href={`/tasks/edit/${task.id}`}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      編集する
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </RoleGuard>
  )
}
