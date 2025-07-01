// モーダルで表示されるタスク編集コンポーネント（子ども用）
'use client'

import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useUserInfo } from '@/hooks/useUserInfo'
import Toast from '@/components/Toast'

export type Task = {
  id: string
  title: string
  isCompleted: boolean
  comment?: string
}

type Props = {
  task: Task
  onClose: () => void
}

export default function TaskEditModal({ task, onClose }: Props) {
  const { userInfo } = useUserInfo()
  const [isCompleted, setIsCompleted] = useState(task.isCompleted)
  const [comment, setComment] = useState(task.comment || '')
  const [loading, setLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')

  const handleSave = async () => {
    if (!userInfo || userInfo.role !== 'child') return

    setLoading(true)
    try {
      const taskRef = doc(db, 'tasks', task.id)
      await updateDoc(taskRef, {
        isCompleted,
        comment,
      })
      setToastType('success')
      setToastMessage('タスクを保存しました')
      onClose()
    } catch (error) {
      console.error('保存エラー:', error)
      setToastType('error')
      setToastMessage('タスクの保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded shadow-md w-80">
          <h2 className="text-xl font-bold mb-4">タスク編集</h2>
          <p className="mb-2 font-semibold">{task.title}</p>

          <label className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
            />
            完了した
          </label>

          <textarea
            className="w-full border rounded p-2 mb-4"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="コメントを入力（任意）"
          />

          <div className="flex justify-end gap-2">
            <button
              className="bg-gray-300 text-black px-4 py-2 rounded"
              onClick={onClose}
              disabled={loading}
            >
              閉じる
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
