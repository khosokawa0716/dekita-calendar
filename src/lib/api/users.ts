import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { User } from '@/types/task'

// familyIdの重複チェック
async function isFamilyIdUnique(
  familyId: string,
  userId?: string
): Promise<boolean> {
  const q = query(collection(db, 'users'), where('familyId', '==', familyId))
  const snapshot = await getDocs(q)
  // If userId is specified, return true if familyId is exclusively used by the specified user (no duplicate exists).
  // If userId is not specified, return true if familyId is not used at all (no duplicate exists).
  return userId
    ? snapshot.docs.every((doc) => doc.id === userId)
    : snapshot.empty
}

/**
 * familyIdの更新時バリデーション
 */
async function validateFamilyIdForUpdate(
  user: User,
  id: string,
  updates: Partial<Omit<User, 'id'>>,
  isCreatingFamilyId: boolean
): Promise<void> {
  // 親の場合で、isCreatingFamilyIdがtrueの時のみ重複チェック
  if (
    updates.familyId &&
    user.role === 'parent' &&
    isCreatingFamilyId &&
    !(await isFamilyIdUnique(updates.familyId, id))
  ) {
    throw new Error('familyIdは既に使用されています')
  }

  // 子の場合または、親でisCreatingFamilyIdがfalseの時はfamilyIdの存在チェック
  const shouldCheckFamilyIdExists =
    (user.role === 'parent' && !isCreatingFamilyId) || user.role === 'child'

  if (updates.familyId && shouldCheckFamilyIdExists) {
    const q = query(
      collection(db, 'users'),
      where('familyId', '==', updates.familyId)
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) {
      throw new Error('familyIdが存在しません')
    }
  }
}

export const userAPI = {
  /**
   * ユーザーを作成
   */
  create: async (uid: string, userData: Omit<User, 'id'>): Promise<void> => {
    try {
      await setDoc(doc(db, 'users', uid), {
        ...userData,
        createdAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('ユーザー作成エラー:', error)
      throw new Error('ユーザーの作成に失敗しました')
    }
  },

  /**
   * IDでユーザーを取得
   */
  getById: async (id: string): Promise<User | null> => {
    try {
      const docRef = doc(db, 'users', id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as User
      }
      return null
    } catch (error) {
      console.error('ユーザー取得エラー:', error)
      throw new Error('ユーザーの取得に失敗しました')
    }
  },

  /**
   * 家族IDで子どもユーザーを取得
   */
  getChildrenByFamilyId: async (familyId: string): Promise<User[]> => {
    try {
      const q = query(
        collection(db, 'users'),
        where('familyId', '==', familyId),
        where('role', '==', 'child')
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[]
    } catch (error) {
      console.error('子どもユーザー取得エラー:', error)
      throw new Error('子どもユーザーの取得に失敗しました')
    }
  },

  /**
   * ユーザーを更新
   */
  update: async (
    id: string,
    updates: Partial<Omit<User, 'id'>>,
    isCreatingFamilyId: boolean = false
  ): Promise<void> => {
    try {
      // ユーザー情報取得
      const user = await userAPI.getById(id)
      if (!user) throw new Error('ユーザー情報が取得できません')
      // familyIdの更新時バリデーション
      await validateFamilyIdForUpdate(user, id, updates, isCreatingFamilyId)
      const docRef = doc(db, 'users', id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateDoc(docRef, updates as { [x: string]: any })
    } catch (error) {
      console.error('ユーザー更新エラー:', error)
      throw new Error('ユーザーの更新に失敗しました')
    }
  },

  /**
   * ユーザーを削除
   */
  delete: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'users', id))
    } catch (error) {
      console.error('ユーザー削除エラー:', error)
      throw new Error('ユーザーの削除に失敗しました')
    }
  },
}
