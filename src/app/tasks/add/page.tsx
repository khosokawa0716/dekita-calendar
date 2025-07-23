'use client'

import { useState } from 'react'
import { getTodayString } from '@/lib/dateUtils'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import { useUserInfo } from '@/hooks/useUserInfo'
import { useFamilyChildren } from '@/hooks/useFamilyChildren'
import { RoleGuard } from '@/components/RoleGuard'
import Toast from '@/components/Toast'
import { taskAPI } from '@/lib/api'

export default function TaskAddPage() {
  useAuthRedirect()
  const { userInfo } = useUserInfo()
  const { children, loading: childrenLoading } = useFamilyChildren(
    userInfo?.familyId
  )

  const [newTitle, setNewTitle] = useState('')
  const [selectedChildren, setSelectedChildren] = useState<string[]>([])
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  if (!userInfo) return <div>Loading...</div>

  const toggleChildSelection = (childId: string) => {
    setSelectedChildren((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId]
    )
  }

  const addTask = async () => {
    if (newTitle.trim() === '') return
    if (selectedChildren.length === 0) {
      setToast({
        message: 'タスクを割り当てる子どもを選択してください',
        type: 'error',
      })
      return
    }

    try {
      const today = getTodayString()

      // 選択された子どもたちの初期状態を設定
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const initialChildrenStatus: { [childId: string]: any } = {}
      selectedChildren.forEach((childId) => {
        initialChildrenStatus[childId] = {
          isCompleted: false,
          comment: '',
          completedAt: null,
        }
      })

      const taskData = {
        title: newTitle,
        childrenStatus: initialChildrenStatus,
        date: today,
        createdBy: userInfo.id,
        familyId: userInfo.familyId,
      }
      await taskAPI.create(taskData)
      setToast({
        message: 'タスクを登録しました',
        type: 'success',
      })
      setNewTitle('')
      setSelectedChildren([])
    } catch (error) {
      console.error('タスクの追加エラー:', error)
      setToast({
        message: '登録に失敗しました',
        type: 'error',
      })
    }
  }

  return (
    <RoleGuard allowedRoles={['parent']}>
      <main className="p-4">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <h1 className="text-2xl font-bold mb-4">タスクを登録する</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">タスク名</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="タスク名を入力"
              className="border px-3 py-2 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              タスクを割り当てる子ども
            </label>
            {childrenLoading ? (
              <p className="text-gray-500">読み込み中...</p>
            ) : children.length > 0 ? (
              <div className="space-y-2">
                {children.map((child) => (
                  <label key={child.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedChildren.includes(child.id)}
                      onChange={() => toggleChildSelection(child.id)}
                      className="w-4 h-4"
                    />
                    <span>{child.displayName}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                家族に子どもが登録されていません。
              </p>
            )}
          </div>

          <button
            onClick={addTask}
            disabled={newTitle.trim() === '' || selectedChildren.length === 0}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            タスクを追加する
          </button>
        </div>
      </main>
    </RoleGuard>
  )
}
