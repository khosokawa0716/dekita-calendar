// タスク関連の型定義

export interface ChildStatus {
  isCompleted: boolean
  comment: string
  completedAt?: Date
}

export interface Task {
  id: string
  title: string
  date: string
  createdBy: string
  familyId: string
  
  // 既存フィールド（下位互換性のため残す）
  isCompleted?: boolean
  userId?: string
  childComment?: string
  comment?: string
  
  // 新しい複数子ども対応フィールド
  childrenStatus: { [childId: string]: ChildStatus }
}

// タスクの集計結果
export interface TaskSummary {
  total: number
  completed: number
  children: {
    [childId: string]: {
      completed: number
      total: number
    }
  }
}
