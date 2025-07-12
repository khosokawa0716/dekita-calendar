// タスク関連の型定義

import { Timestamp } from 'firebase/firestore'

export interface ChildStatus {
  isCompleted: boolean
  comment: string
  completedAt?: Timestamp
}

export interface Task {
  id: string
  title: string
  date: string
  createdBy: string
  familyId: string
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

// API層で使用する型定義
export interface TaskTemplate {
  id: string
  title: string
  createdBy: string
  familyId: string
  createdAt: Timestamp // Firestore Timestamp
  repeatType: 'none' | 'everyday' | 'weekday' | 'custom'
  repeatDays?: number[]
}

export interface CreateTaskTemplateInput {
  title: string
  createdBy: string
  familyId: string
  repeatType: 'none' | 'everyday' | 'weekday' | 'custom'
  repeatDays?: number[]
}

export interface CreateTaskInput {
  title: string
  date: string
  createdBy: string
  familyId: string
  childrenStatus: { [childId: string]: ChildStatus }
}

export interface UpdateTaskInput {
  title?: string
  childrenStatus?: { [childId: string]: ChildStatus }
}

export interface User {
  id: string
  email: string
  displayName: string
  role: 'parent' | 'child'
  familyId: string
}

export interface Achievement {
  id: string
  userId: string
  date: string
  completedCount: number
}
