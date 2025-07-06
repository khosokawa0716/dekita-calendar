'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserInfo } from '@/hooks/useUserInfo'
import { RoleGuard } from '@/components/RoleGuard'
import { taskTemplateAPI } from '@/lib/api'

export default function TaskTemplateCreatePage() {
  const router = useRouter()
  const { userInfo } = useUserInfo() // ユーザー情報を取得するカスタムフックを使用
  const [title, setTitle] = useState('')
  const [repeatType, setRepeatType] = useState<
    'none' | 'everyday' | 'weekday' | 'custom'
  >('none')
  const [customDays, setCustomDays] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  const toggleDay = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleSubmit = async () => {
    console.log('テンプレート登録処理開始')
    console.log('ユーザー情報:', userInfo)
    console.log('テンプレートタイトル:', title)
    if (!userInfo) return
    if (!title.trim()) {
      alert('タイトルは必須です')
      return
    }

    if (repeatType === 'custom' && customDays.length === 0) {
      alert('曜日を1つ以上選択してください')
      return
    }

    setLoading(true)
    try {
      const templateData = {
        title,
        createdBy: userInfo.id,
        familyId: userInfo.familyId,
        repeatType,
        ...(repeatType === 'custom' ? { repeatDays: customDays } : {}),
      }
      await taskTemplateAPI.create(templateData)
      alert('テンプレートを追加しました')
      router.push('/task-templates')
    } catch (error) {
      console.error('テンプレート追加エラー:', error)
      alert('登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <RoleGuard allowedRoles={['parent']}>
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">テンプレート作成</h1>
        <input
          type="text"
          placeholder="テンプレート名"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border px-2 py-1 rounded w-full mb-4"
        />

        <div>
          <label className="block font-semibold mb-1">繰り返し設定</label>
          <select
            value={repeatType}
            onChange={(e) => setRepeatType(e.target.value as any)}
            className="border px-2 py-1 rounded w-full"
          >
            <option value="none">繰り返しなし</option>
            <option value="everyday">毎日</option>
            <option value="weekday">平日のみ</option>
            <option value="custom">曜日を指定</option>
          </select>
        </div>

        {repeatType === 'custom' && (
          <div>
            <label className="block font-semibold mb-1">曜日を選択</label>
            <div className="flex gap-2 flex-wrap">
              {['日', '月', '火', '水', '木', '金', '土'].map(
                (label, index) => (
                  <label key={index} className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={customDays.includes(index)}
                      onChange={() => toggleDay(index)}
                    />
                    <span>{label}</span>
                  </label>
                )
              )}
            </div>
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '登録中...' : '登録する'}
        </button>
      </main>
    </RoleGuard>
  )
}
