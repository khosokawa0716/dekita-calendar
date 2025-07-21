import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  getDoc,
  serverTimestamp,
  type UpdateData,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Task, CreateTaskInput, UpdateTaskInput } from '@/types/task'

export const taskAPI = {
  /**
   * タスクを作成
   */
  create: async (taskData: CreateTaskInput): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...taskData,
        createdAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error('タスク作成エラー:', error)
      throw new Error('タスクの作成に失敗しました')
    }
  },

  /**
   * 家族IDと日付でタスクを取得
   */
  getByFamilyIdAndDate: async (
    familyId: string,
    date: string
  ): Promise<Task[]> => {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('familyId', '==', familyId),
        where('date', '==', date)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[]
    } catch (error) {
      console.error('タスク取得エラー:', error)
      throw new Error('タスクの取得に失敗しました')
    }
  },

  /**
   * 家族IDでタスクを取得
   */
  getByFamilyId: async (familyId: string): Promise<Task[]> => {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('familyId', '==', familyId)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[]
    } catch (error) {
      console.error('タスク取得エラー:', error)
      throw new Error('タスクの取得に失敗しました')
    }
  },

  /**
   * IDでタスクを取得
   */
  getById: async (id: string): Promise<Task | null> => {
    try {
      const docRef = doc(db, 'tasks', id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Task
      }
      return null
    } catch (error) {
      console.error('タスク取得エラー:', error)
      throw new Error('タスクの取得に失敗しました')
    }
  },

  /**
   * タスクを更新
   */
  update: async (id: string, updates: UpdateTaskInput): Promise<void> => {
    try {
      console.log('Updating task:', id, updates)
      const docRef = doc(db, 'tasks', id)
      await updateDoc(docRef, updates as UpdateData<DocumentData>)
    } catch (error) {
      console.error('タスク更新エラー:', error)
      throw new Error('タスクの更新に失敗しました')
    }
  },

  /**
   * タスクを削除
   */
  delete: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'tasks', id))
    } catch (error) {
      console.error('タスク削除エラー:', error)
      throw new Error('タスクの削除に失敗しました')
    }
  },

  /**
   * 日付範囲でタスクを取得（カレンダー用）
   */
  getByFamilyIdAndDateRange: async (
    familyId: string,
    startDate: string,
    endDate: string
  ): Promise<Task[]> => {
    try {
      const q = query(
        collection(db, 'tasks'),
        where('familyId', '==', familyId),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[]
    } catch (error) {
      console.error('タスク取得エラー:', error)
      throw new Error('タスクの取得に失敗しました')
    }
  },
}
