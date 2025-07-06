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
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { TaskTemplate, CreateTaskTemplateInput } from '@/types/task'

export const taskTemplateAPI = {
  /**
   * タスクテンプレートを作成
   */
  create: async (templateData: CreateTaskTemplateInput): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'taskTemplates'), {
        ...templateData,
        createdAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error('テンプレート作成エラー:', error)
      throw new Error('テンプレートの作成に失敗しました')
    }
  },

  /**
   * 家族IDでタスクテンプレートを取得
   */
  getByFamilyId: async (familyId: string): Promise<TaskTemplate[]> => {
    try {
      const q = query(
        collection(db, 'taskTemplates'),
        where('familyId', '==', familyId)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TaskTemplate[]
    } catch (error) {
      console.error('テンプレート取得エラー:', error)
      throw new Error('テンプレートの取得に失敗しました')
    }
  },

  /**
   * 作成者IDでタスクテンプレートを取得
   */
  getByCreatedBy: async (
    createdBy: string,
    familyId: string
  ): Promise<TaskTemplate[]> => {
    try {
      const q = query(
        collection(db, 'taskTemplates'),
        where('createdBy', '==', createdBy),
        where('familyId', '==', familyId)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TaskTemplate[]
    } catch (error) {
      console.error('テンプレート取得エラー:', error)
      throw new Error('テンプレートの取得に失敗しました')
    }
  },

  /**
   * IDでタスクテンプレートを取得
   */
  getById: async (id: string): Promise<TaskTemplate | null> => {
    try {
      const docRef = doc(db, 'taskTemplates', id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as TaskTemplate
      }
      return null
    } catch (error) {
      console.error('テンプレート取得エラー:', error)
      throw new Error('テンプレートの取得に失敗しました')
    }
  },

  /**
   * タスクテンプレートを更新
   */
  update: async (
    id: string,
    updates: Partial<CreateTaskTemplateInput>
  ): Promise<void> => {
    try {
      const docRef = doc(db, 'taskTemplates', id)
      await updateDoc(docRef, updates)
    } catch (error) {
      console.error('テンプレート更新エラー:', error)
      throw new Error('テンプレートの更新に失敗しました')
    }
  },

  /**
   * タスクテンプレートを削除
   */
  delete: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'taskTemplates', id))
    } catch (error) {
      console.error('テンプレート削除エラー:', error)
      throw new Error('テンプレートの削除に失敗しました')
    }
  },
}
