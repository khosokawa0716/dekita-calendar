'use client'

import { useEffect, useState } from 'react'
import { useUserInfo } from '@/hooks/useUserInfo'
import { useFamilyChildren } from '@/hooks/useFamilyChildren'
import Link from 'next/link'
import { getTodayString } from '@/lib/dateUtils'
import { RoleGuard } from '@/components/RoleGuard'
import { taskTemplateAPI, taskAPI } from '@/lib/api'
import type { TaskTemplate } from '@/types/task'

const repeatTypeLabel = (type: string, days?: number[]) => {
  switch (type) {
    case 'everyday':
      return '毎日'
    case 'weekday':
      return '平日'
    case 'custom':
      if (!days || days.length === 0) return '曜日指定なし'
      const labels = ['日', '月', '火', '水', '木', '金', '土']
      return `曜日指定: ${days.map((d) => labels[d]).join(', ')}`
    default:
      return ''
  }
}

export default function TaskTemplateListPage() {
  const { userInfo, loading } = useUserInfo()
  const { children, loading: childrenLoading } = useFamilyChildren(
    userInfo?.familyId
  )
  const [templates, setTemplates] = useState<TaskTemplate[]>([])
  const [showChildSelection, setShowChildSelection] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(
    null
  )
  const [selectedChildren, setSelectedChildren] = useState<string[]>([])

  const toggleChildSelection = (childId: string) => {
    setSelectedChildren((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId]
    )
  }

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!userInfo) return

      try {
        const list = await taskTemplateAPI.getByFamilyId(userInfo.familyId)
        setTemplates(list)
      } catch (error) {
        console.error('テンプレート取得エラー:', error)
      }
    }

    fetchTemplates()
  }, [userInfo])

  if (loading) return <p>読み込み中...</p>

  const handleGenerateTodayTasks = async () => {
    if (!userInfo) {
      console.log('userInfo が未取得のため中断')
      return
    }

    if (children.length === 0) {
      alert('家族に子どもが登録されていません。まず子どもを登録してください。')
      return
    }

    // 全ての子どもを選択した状態で一括生成するか確認
    const confirmed = confirm(
      `本日のタスクを家族の全ての子ども（${children.map((c) => c.displayName).join(', ')}）に一括生成しますか？`
    )
    if (!confirmed) return

    const today = new Date()
    const day = today.getDay() // 0:日曜, 1:月曜...
    const todayStr = getTodayString() // 例: "2025-06-27"
    console.log('本日の日付:', todayStr, '曜日:', day)

    try {
      const allTemplates = await taskTemplateAPI.getByCreatedBy(
        userInfo.id,
        userInfo.familyId
      )
      console.log('テンプレートの取得件数:', allTemplates.length)

      const matchedTemplates = allTemplates.filter((template) => {
        const type = template.repeatType
        console.log('テンプレート:', template.title, 'repeatType:', type)
        if (type === 'everyday') return true
        if (type === 'weekday' && day >= 1 && day <= 5) return true
        if (type === 'custom' && Array.isArray(template.repeatDays)) {
          return template.repeatDays.includes(day)
        }
        return false
      })
      console.log('マッチしたテンプレート数:', matchedTemplates.length)

      let createdTasksCount = 0

      for (const template of matchedTemplates) {
        console.log('タスク生成対象テンプレート:', template)

        // 🔒 同じテンプレートIDの今日のタスクが既に存在しているかチェック
        const existingTasks = await taskAPI.getByFamilyIdAndDate(
          userInfo.familyId,
          todayStr
        )
        const duplicateTask = existingTasks.find(
          (task) => task.title === template.title
        )

        if (duplicateTask) {
          console.log(`既にタスクあり: ${template.title}`)
          continue // スキップ
        }

        // 全ての子どもに対してタスクを生成
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const initialChildrenStatus: { [childId: string]: any } = {}
        children.forEach((child) => {
          initialChildrenStatus[child.id] = {
            isCompleted: false,
            comment: '',
            completedAt: null,
          }
        })

        const taskData = {
          title: template.title,
          childrenStatus: initialChildrenStatus,
          date: todayStr,
          familyId: userInfo.familyId,
          createdBy: userInfo.id,
        }

        console.log('登録するタスクデータ:', taskData)
        await taskAPI.create(taskData)
        console.log('タスクを登録しました:', template.title)
        createdTasksCount++
      }

      alert(`本日のタスクを${createdTasksCount}個生成しました🐸`)
    } catch (error) {
      console.error('タスク生成エラー:', error)
      alert('生成に失敗しました')
    }
  }

  const handleAddTask = async (template: TaskTemplate) => {
    if (!userInfo) return

    if (children.length === 0) {
      alert('家族に子どもが登録されていません。')
      return
    }

    // 子ども選択モーダルを表示
    setSelectedTemplate(template)
    setSelectedChildren([]) // 選択をリセット
    setShowChildSelection(true)
  }

  const executeAddTask = async () => {
    if (!selectedTemplate || !userInfo || selectedChildren.length === 0) {
      alert('タスクを割り当てる子どもを選択してください')
      return
    }

    const today = new Date()
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    try {
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

      await taskAPI.create({
        title: selectedTemplate.title,
        childrenStatus: initialChildrenStatus,
        date: dateStr,
        createdBy: userInfo.id,
        familyId: userInfo.familyId,
      })

      alert(
        `${selectedChildren.length}人の子どもに「${selectedTemplate.title}」を割り当てました`
      )
      setShowChildSelection(false)
      setSelectedTemplate(null)
      setSelectedChildren([])
    } catch (error) {
      console.error('タスク追加エラー:', error)
      alert('追加に失敗しました')
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = confirm('このテンプレートを削除してもよろしいですか？')
    if (!confirmed) return

    try {
      await taskTemplateAPI.delete(id)
      alert('テンプレートを削除しました')
      // 一覧の再取得 or ローカルstateから削除
      setTemplates((prev) => prev.filter((t) => t.id !== id))
    } catch (error) {
      console.error('テンプレート削除エラー:', error)
      alert('削除に失敗しました')
    }
  }

  return (
    <RoleGuard allowedRoles={['parent']}>
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">テンプレート一覧</h1>
        <button
          onClick={handleGenerateTodayTasks}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          本日のタスクを生成
        </button>
        <Link
          href="/task-templates/create"
          className="text-blue-500 underline mb-4 block"
        >
          新しいテンプレートを作成
        </Link>
        {templates.length === 0 ? (
          <p>テンプレートがありません。</p>
        ) : (
          <ul className="space-y-2">
            {templates.map((template) => (
              <li key={template.id} className="p-2 bg-gray-100 rounded shadow">
                <div>
                  <div className="font-semibold">{template.title}</div>
                  <div className="text-sm text-gray-600">
                    {repeatTypeLabel(
                      template.repeatType || 'none',
                      template.repeatDays
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleAddTask(template)}
                  className="ml-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  今日のタスクに追加
                </button>
                <Link
                  href={`/task-templates/edit/${template.id}`}
                  className="text-blue-500 underline hover:text-blue-700"
                >
                  編集
                </Link>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  削除
                </button>
                <div className="text-sm text-gray-500">
                  作成者: {template.createdBy} | 作成日:{' '}
                  {new Date(
                    template.createdAt.seconds * 1000
                  ).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* 子ども選択モーダル */}
        {showChildSelection && selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4">
                「{selectedTemplate.title}」を割り当てる子どもを選択
              </h3>

              {childrenLoading ? (
                <p className="text-gray-500">読み込み中...</p>
              ) : children.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {children.map((child) => (
                    <label
                      key={child.id}
                      className="flex items-center space-x-3"
                    >
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
                <p className="text-gray-500 mb-6">
                  家族に子どもが登録されていません。
                </p>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={executeAddTask}
                  disabled={selectedChildren.length === 0}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  追加する ({selectedChildren.length}人)
                </button>
                <button
                  onClick={() => {
                    setShowChildSelection(false)
                    setSelectedTemplate(null)
                    setSelectedChildren([])
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </RoleGuard>
  )
}
