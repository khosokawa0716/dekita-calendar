'use client'

import { useState } from 'react'

/**
 * カレンダーコンポーネントのProps型定義
 * @param taskData - 日付をキーとしたタスクの完了状況データ
 */
type Props = {
  taskData?: {
    [dateStr: string]: { total: number; completed: number }
  }
}

/**
 * 日付を指定されたフォーマットで文字列に変換する
 * @param date - フォーマットする日付
 * @param format - フォーマット文字列（yyyy: 年、MM: 月、dd: 日、d: 日）
 * @returns フォーマットされた日付文字列
 */
const formatDate = (date: Date, format: string): string => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1 // getMonth()は0から始まるため+1
  const day = date.getDate()

  return format
    .replace('yyyy', year.toString()) // 4桁年
    .replace('MM', month.toString().padStart(2, '0')) // 2桁月（先頭0埋め）
    .replace('dd', day.toString().padStart(2, '0')) // 2桁日（先頭0埋め）
    .replace('d', day.toString()) // 日（先頭0埋めなし）
}

/**
 * 指定された日付の月の初日（1日）を取得する
 * @param date - 基準となる日付
 * @returns その月の1日のDateオブジェクト
 */
const getMonthStart = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

/**
 * 指定された日付の月の最終日を取得する
 * @param date - 基準となる日付
 * @returns その月の最終日のDateオブジェクト
 */
const getMonthEnd = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

/**
 * 指定された日付を含む週の開始日を取得する
 * @param date - 基準となる日付
 * @param weekStartsOn - 週の開始曜日（0: 日曜日, 1: 月曜日）
 * @returns その週の開始日のDateオブジェクト
 */
const getWeekStart = (date: Date, weekStartsOn: number = 0): Date => {
  const day = date.getDay() // 曜日を取得（0: 日曜日）
  const diff = (day - weekStartsOn + 7) % 7 // 週の開始日からの差分を計算
  const result = new Date(date)
  result.setDate(date.getDate() - diff) // 差分だけ前の日付にする
  return result
}

/**
 * 指定された日付を含む週の終了日を取得する
 * @param date - 基準となる日付
 * @param weekStartsOn - 週の開始曜日（0: 日曜日, 1: 月曜日）
 * @returns その週の終了日のDateオブジェクト
 */
const getWeekEnd = (date: Date, weekStartsOn: number = 0): Date => {
  const day = date.getDay() // 曜日を取得（0: 日曜日）
  const diff = (6 - day + weekStartsOn) % 7 // 週の終了日までの差分を計算
  const result = new Date(date)
  result.setDate(date.getDate() + diff) // 差分だけ後の日付にする
  return result
}

/**
 * 指定された日付に指定された日数を加算する
 * @param date - 基準となる日付
 * @param days - 加算する日数（負の値も可）
 * @returns 加算後のDateオブジェクト
 */
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(date.getDate() + days)
  return result
}

/**
 * 2つの日付が同じ月かどうかを判定する
 * @param date1 - 比較する日付1
 * @param date2 - 比較する日付2
 * @returns 同じ月の場合はtrue、異なる場合はfalse
 */
const isSameMonth = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  )
}

/**
 * カレンダー表示に必要な全ての日付を取得する
 * 表示対象月の前後の週も含めて、カレンダーグリッドに表示される全日付を返す
 * @param currentDate - 表示対象月を含む日付
 * @returns カレンダーに表示される全日付の配列
 */
const getDaysInCalendar = (currentDate: Date): Date[] => {
  const monthStart = getMonthStart(currentDate) // 月の開始日
  const monthEnd = getMonthEnd(currentDate) // 月の終了日
  const startDate = getWeekStart(monthStart, 0) // カレンダー開始日（月初を含む週の日曜日）
  const endDate = getWeekEnd(monthEnd, 0) // カレンダー終了日（月末を含む週の土曜日）

  // 開始日から終了日までの総日数を計算
  const totalDays =
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1

  // 開始日から順番に日付を生成して配列にする
  return Array.from({ length: totalDays }, (_, i) => addDays(startDate, i))
}

export default function Calendar({ taskData = {} }: Props) {
  // 現在表示している月の日付を管理するstate
  const [currentDate, setCurrentDate] = useState(new Date())

  // カレンダーに表示する全ての日付を取得（前後の月の日付も含む）
  const calendarDays = getDaysInCalendar(currentDate)
  // 現在表示中の月の開始日を取得
  const monthStart = getMonthStart(currentDate)

  // 取得した日付を週ごとに分割（7日ずつのグループに分ける）
  const weeks = Array.from(
    { length: Math.ceil(calendarDays.length / 7) }, // 必要な週数を計算
    (_, weekIndex) => calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7) // 各週の日付を切り出し
  )

  /**
   * 個別の日付セルを描画する関数
   * @param day - 表示する日付
   * @param index - 配列内でのインデックス
   * @returns JSX要素
   */
  const renderDay = (day: Date, index: number) => {
    const dateKey = formatDate(day, 'yyyy-MM-dd') // taskDataのキーとして使用する日付文字列
    const isCurrentMonth = isSameMonth(day, monthStart) // 現在の月かどうかを判定
    const dayNumber = formatDate(day, 'd') // 表示する日の数字

    return (
      <div
        key={`${day.getTime()}-${index}`} // 一意なキーを生成
        className={`border h-20 p-1 text-xs ${
          isCurrentMonth ? 'bg-white' : 'bg-gray-100 text-gray-400' // 現在月とそれ以外で色を変える
        }`}
      >
        <div className="font-bold">{dayNumber}</div>
        {/* この日付にタスクデータがある場合は完了状況を表示 */}
        {taskData[dateKey] && (
          <div className="mt-1 text-green-600">
            ✅ {taskData[dateKey].completed}/{taskData[dateKey].total}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* 月年の表示 */}
      <div className="text-xl font-bold mb-2">
        {formatDate(currentDate, 'yyyy年MM月')}
      </div>

      {/* 曜日のヘッダー */}
      <div className="grid grid-cols-7 text-center font-semibold">
        {['日', '月', '火', '水', '木', '金', '土'].map((dayName) => (
          <div key={dayName}>{dayName}</div>
        ))}
      </div>

      {/* 週ごとの日付を表示 */}
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7">
          {week.map((day, dayIndex) => renderDay(day, dayIndex))}
        </div>
      ))}
    </div>
  )
}
