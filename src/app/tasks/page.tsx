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
import { ChildTaskList } from '@/components/pages/ChildTaskList'
import Toast from '@/components/Toast'

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

  const [loading, setLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  // タスクの完了状態を更新
  const updateTaskStatus = async (
    taskId: string,
    isCompleted: boolean,
    comment: string
  ) => {
    if (!userInfo || userInfo.role !== 'child') {
      setToastType('error')
      setToastMessage('タスクの編集権限がありません')
      return
    }

    setLoading(true)
    try {
      // 現在のタスクを取得
      const currentTask = tasks.find((task) => task.id === taskId)
      if (!currentTask) return

      // 新構造での更新: childrenStatusを更新
      const updatedChildrenStatus = {
        ...currentTask.childrenStatus,
        [userInfo.id]: {
          isCompleted,
          comment,
          ...(isCompleted && {
            completedAt: Timestamp.fromDate(new Date()),
          }),
        },
      }

      // ローカルstateを更新
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              childrenStatus: updatedChildrenStatus,
            }
          }
          return task
        })
      )

      setToastType('success')
      setToastMessage('タスクを保存しました')
    } catch (error) {
      console.error('保存エラー:', error)
      setToastType('error')
      setToastMessage('タスクの保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // 表示されている全てのタスクの完了状態とコメントを更新する関数
  const updateAllTasks = async () => {
    if (!userInfo || userInfo.role !== 'child') {
      setToastType('error')
      setToastMessage('タスクの一括更新権限がありません')
      return
    }
    setLoading(true)
    try {
      const updatedTasks = tasks.map((task) => {
        const currentStatus = task.childrenStatus?.[userInfo.id] || {
          isCompleted: false,
          comment: '',
        }
        return {
          ...task,
          childrenStatus: {
            ...task.childrenStatus,
            [userInfo.id]: {
              isCompleted: currentStatus.isCompleted,
              comment: currentStatus.comment,
              ...(currentStatus.isCompleted && {
                completedAt: Timestamp.fromDate(new Date()),
              }),
            },
          },
        }
      })
      await Promise.all(
        updatedTasks.map((task) =>
          taskAPI.update(task.id, { childrenStatus: task.childrenStatus })
        )
      )
      // ローカルstateを更新
      setTasks(updatedTasks)
      setToastType('success')
      setToastMessage('全てのタスクを更新しました')
    } catch (error) {
      console.error('一括更新エラー:', error)
      setToastType('error')
      setToastMessage('タスクの一括更新に失敗しました')
    } finally {
      setLoading(false)
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
      ) : userInfo.role === 'child' ? (
        <ChildTaskList
          todayTasks={tasks}
          updateTaskStatus={updateTaskStatus}
          updateAllTasks={updateAllTasks}
          loading={loading}
          userInfo={userInfo}
        />
      ) : (
        <></>
      )}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </main>
  )
}
