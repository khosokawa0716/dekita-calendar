'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUserInfo } from '@/hooks/useUserInfo'
import { RoleGuard } from '@/components/RoleGuard'
import { taskTemplateAPI } from '@/lib/api'

const nextPage = '/task-templates'

export default function TaskTemplateEditPage() {
  const router = useRouter()

  const { id } = useParams()
  const templateId = id as string

  const { userInfo, loading } = useUserInfo()
  const [title, setTitle] = useState('')
  const [repeatType, setRepeatType] = useState<
    'none' | 'everyday' | 'weekday' | 'custom'
  >('none')
  const [repeatDays, setRepeatDays] = useState<number[]>([])
  const [templateLoaded, setTemplateLoaded] = useState(false)

  const toggleDay = (day: number) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  useEffect(() => {
    const fetchTemplate = async () => {
      if (loading || !userInfo || !templateId) {
        console.log('まだ準備ができていません:', {
          loading,
          userInfo,
          templateId,
        })
        return
      }

      const template = await taskTemplateAPI.getById(templateId)
      console.log('Fetched template:', template ? true : false, template)
      if (!template) {
        alert('テンプレートが見つかりません')
        router.push(nextPage)
        return
      }
      console.log('ユーザー情報:', userInfo, 'テンプレートID:', templateId)
      if (template.createdBy !== userInfo.id) {
        alert('このテンプレートを編集する権限がありません')
        router.push(nextPage)
        return
      }

      setTitle(template.title)
      setRepeatType(template.repeatType || 'none')
      setRepeatDays(template.repeatDays || [])
      setTemplateLoaded(true)
    }

    fetchTemplate()
  }, [loading, userInfo, templateId, router])

  const handleUpdate = async () => {
    if (!title.trim()) {
      alert('タイトルを入力してください')
      return
    }

    try {
      await taskTemplateAPI.update(templateId!, {
        title,
        repeatType,
        repeatDays: repeatType === 'custom' ? repeatDays : [],
      })
      alert('テンプレートを更新しました')
      router.push(nextPage)
    } catch (error) {
      console.error('テンプレート更新エラー:', error)
      alert('更新に失敗しました')
    }
  }

  if (loading || !templateLoaded) return <p className="p-4">読み込み中...</p>

  return (
    <RoleGuard allowedRoles={['parent']}>
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">テンプレート編集</h1>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border px-2 py-1 rounded w-full mb-4"
          placeholder="テンプレート名"
        />
        <div>
          <label className="font-semibold block mb-1">繰り返し設定</label>
          <select
            value={repeatType}
            onChange={(e) => setRepeatType(e.target.value as any)}
            className="border px-2 py-1 rounded"
          >
            <option value="none">繰り返しなし</option>
            <option value="everyday">毎日</option>
            <option value="weekday">平日</option>
            <option value="custom">曜日指定</option>
          </select>
        </div>

        {repeatType === 'custom' && (
          <div className="flex gap-2 flex-wrap">
            {['日', '月', '火', '水', '木', '金', '土'].map((label, i) => (
              <label key={i} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={repeatDays.includes(i)}
                  onChange={() => toggleDay(i)}
                />
                {label}
              </label>
            ))}
          </div>
        )}
        <button
          onClick={handleUpdate}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          更新する
        </button>
      </main>
    </RoleGuard>
  )
}
