'use client'

import { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useUserInfo } from '@/hooks/useUserInfo'
import Calendar from '@/components/Calendar'
import { RoleGuard } from '@/components/RoleGuard'
import { getTodayString } from '@/lib/dateUtils'
import Toast from '@/components/Toast'
import { Task, ChildStatus } from '@/types/task'

type TaskData = {
  [dateStr: string]: { total: number; completed: number }
}

// Task型をインポートするため、ローカル定義を削除
// export type Task = {
//   id: string
//   title: string
//   isCompleted: boolean
//   comment?: string
// }

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
  // 現在のユーザーの状態を取得（新構造 or 旧構造から）
  const getUserStatus = () => {
    if (currentUserId && task.childrenStatus && task.childrenStatus[currentUserId]) {
      return task.childrenStatus[currentUserId]
    }
    // 旧構造との互換性
    return {
      isCompleted: task.isCompleted ?? false,
      comment: task.comment || task.childComment || ''
    }
  }

  const userStatus = getUserStatus()
  const [isCompleted, setIsCompleted] = useState(userStatus.isCompleted)
  const [comment, setComment] = useState(userStatus.comment)

  const handleSave = () => {
    onUpdate(task.id, isCompleted, comment)
  }

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex items-start gap-3">
        <label className="flex items-center gap-2 min-w-0 flex-1">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={(e) => setIsCompleted(e.target.checked)}
            disabled={!canEdit || loading}
            className="w-4 h-4"
          />
          <span
            className={`font-medium ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}
          >
            {task.title}
          </span>
        </label>
        {canEdit && (
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存'}
          </button>
        )}
      </div>

      {canEdit && (
        <div className="mt-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="コメントを入力（任意）"
            disabled={loading}
            className="w-full border rounded p-2 text-sm resize-none h-20"
          />
        </div>
      )}

      {!canEdit && userStatus.comment && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
          コメント: {userStatus.comment}
        </div>
      )}

      {/* 複数子どもの完了状況表示（親向け） */}
      {!canEdit && task.childrenStatus && Object.keys(task.childrenStatus).length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          完了状況: {Object.values(task.childrenStatus).filter(status => status.isCompleted).length} / {Object.keys(task.childrenStatus).length} 人
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
        
        // 新構造での完了判定: childrenStatus内に完了した子どもがいるかチェック
        let isCompleted = false
        if (task.childrenStatus && Object.keys(task.childrenStatus).length > 0) {
          // 少なくとも一人の子どもが完了していれば「完了」とみなす
          isCompleted = Object.values(task.childrenStatus).some((status: any) => status.isCompleted)
        } else {
          // 旧構造との互換性
          isCompleted = task.isCompleted
        }
        
        if (isCompleted) {
          data[date].completed += 1
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
      const tasksRef = collection(db, 'tasks')
      const q = query(
        tasksRef,
        where('date', '==', today),
        where('familyId', '==', userInfo.familyId)
      )
      const snapshot = await getDocs(q)
      let tasks = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Task
      )

      // 子どもユーザーの場合は、自分に関連するタスクのみフィルタリング
      if (userInfo.role === 'child') {
        tasks = tasks.filter(task => {
          // 新構造: childrenStatusに自分のIDがある
          if (task.childrenStatus && task.childrenStatus[userInfo.id]) {
            return true
          }
          // 旧構造: userIdが自分のID
          return task.userId === userInfo.id
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
      const taskRef = doc(db, 'tasks', taskId)
      
      // 新構造での更新: childrenStatusに現在のユーザーの状態を保存
      const updateData = {
        [`childrenStatus.${userInfo.id}`]: {
          isCompleted,
          comment,
          completedAt: isCompleted ? new Date() : null
        },
        // 下位互換性のため、旧フィールドも更新
        isCompleted,
        comment,
      }
      
      await updateDoc(taskRef, updateData)

      // ローカルstateを更新
      setTodayTasks((prev) =>
        prev.map((task) => {
          if (task.id === taskId) {
            const newChildrenStatus = {
              ...task.childrenStatus,
              [userInfo.id]: { isCompleted, comment, completedAt: isCompleted ? new Date() : undefined }
            }
            return { 
              ...task, 
              isCompleted, 
              comment,
              childrenStatus: newChildrenStatus
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

  return (
    <RoleGuard allowedRoles={['parent', 'child']}>
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">カレンダー表示</h1>

        {/* 本日のタスクセクション */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border">
          <h2 className="text-xl font-bold mb-4 text-blue-800">
            今日のタスク ({getTodayString()})
          </h2>
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
