'use client'

import { useEffect, useState } from 'react'
import { useUserInfo } from '@/hooks/useUserInfo'
import Calendar from '@/components/Calendar'
import { RoleGuard } from '@/components/RoleGuard'
import { getTodayString } from '@/lib/dateUtils'
import Toast from '@/components/Toast'
import { Task } from '@/types/task'
import { taskAPI } from '@/lib/api'
import { Timestamp } from 'firebase/firestore'

type TaskData = {
  [dateStr: string]: { total: number; completed: number }
}

// 個別のタスクアイテムコンポーネント
function TaskItem({
  task,
  onUpdate,
  canEdit,
  loading,
  currentUserId,
}: {
  task: Task
  onUpdate: (taskId: string, isCompleted: boolean, comment: string) => void
  canEdit: boolean
  loading: boolean
  currentUserId?: string
}) {
  // 現在のユーザーの状態を取得
  const getUserStatus = () => {
    if (
      currentUserId &&
      task.childrenStatus &&
      task.childrenStatus[currentUserId]
    ) {
      return task.childrenStatus[currentUserId]
    }
    // デフォルト値
    return {
      isCompleted: false,
      comment: '',
    }
  }

  const userStatus = getUserStatus()

  return (
    <div className="bg-white p-2 rounded-lg border shadow-sm">
      <div className="flex items-start gap-3">
        <label className="flex items-center gap-2 min-w-0 flex-1">
          <input
            type="checkbox"
            checked={userStatus.isCompleted}
            onChange={(e) =>
              onUpdate(task.id, e.target.checked, userStatus.comment)
            }
            disabled={!canEdit || loading}
            className="w-4 h-4"
          />
          <span
            className={`font-medium ${userStatus.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}
          >
            {task.title}
          </span>
        </label>
        {/* 個別のタスクを保存するボタンは一旦コメントアウトしています */}
        {/* {canEdit && (
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存'}
          </button>
        )} */}
      </div>

      {canEdit && (
        <div className="mt-3">
          <textarea
            value={userStatus.comment || ''}
            onChange={(e) => {
              onUpdate(task.id, userStatus.isCompleted, e.target.value)
            }}
            placeholder="コメントを入力（任意）"
            disabled={loading}
            className="w-full border rounded p-2 text-sm resize-none h-10"
          />
        </div>
      )}

      {!canEdit && userStatus.comment && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
          コメント: {userStatus.comment}
        </div>
      )}

      {/* 複数子どもの完了状況表示（親向け） */}
      {!canEdit &&
        task.childrenStatus &&
        Object.keys(task.childrenStatus).length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            完了状況:{' '}
            {
              Object.values(task.childrenStatus).filter(
                (status) => status.isCompleted
              ).length
            }{' '}
            / {Object.keys(task.childrenStatus).length} 人
          </div>
        )}
    </div>
  )
}

export default function CalendarPage() {
  const { userInfo } = useUserInfo()
  const [taskData, setTaskData] = useState<TaskData>({})
  const [currentDate] = useState(new Date()) // 現在の月を保持
  const [todayTasks, setTodayTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

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

  // 本日のタスクを取得
  useEffect(() => {
    if (!userInfo) return

    const fetchTodayTasks = async () => {
      const today = getTodayString()
      let tasks = await taskAPI.getByFamilyIdAndDate(userInfo.familyId, today)

      // 子どもユーザーの場合は、自分に関連するタスクのみフィルタリング
      if (userInfo.role === 'child') {
        tasks = tasks.filter((task) => {
          // 新構造: childrenStatusに自分のIDがある
          return task.childrenStatus && task.childrenStatus[userInfo.id]
        })
      }

      setTodayTasks(tasks)
    }

    fetchTodayTasks()
  }, [userInfo])

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
      const currentTask = todayTasks.find((task) => task.id === taskId)
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
      setTodayTasks((prev) =>
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
      const updatedTasks = todayTasks.map((task) => {
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
      setTodayTasks(updatedTasks)
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

  return (
    <RoleGuard allowedRoles={['parent', 'child']}>
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
      <main className="p-2">
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border">
          {todayTasks.length > 0 ? (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onUpdate={updateTaskStatus}
                  canEdit={userInfo?.role === 'child'}
                  loading={loading}
                  currentUserId={userInfo?.id}
                />
              ))}

              <button
                onClick={updateAllTasks}
                disabled={loading}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? '保存中...' : '保存する'}
              </button>
            </div>
          ) : (
            <p className="text-gray-600">今日のタスクはありません</p>
          )}
        </div>
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
