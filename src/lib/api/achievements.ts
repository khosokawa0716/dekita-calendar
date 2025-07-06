import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Achievement } from '@/types/task'

export const achievementAPI = {
  /**
   * 達成記録を取得
   */
  getById: async (
    userId: string,
    date: string
  ): Promise<Achievement | null> => {
    try {
      const achievementId = `${userId}_${date}`
      const docRef = doc(db, 'achievements', achievementId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Achievement
      }
      return null
    } catch (error) {
      console.error('達成記録取得エラー:', error)
      throw new Error('達成記録の取得に失敗しました')
    }
  },

  /**
   * 達成記録を作成または更新
   */
  createOrUpdate: async (
    userId: string,
    date: string,
    completedCount: number
  ): Promise<void> => {
    try {
      const achievementId = `${userId}_${date}`
      const docRef = doc(db, 'achievements', achievementId)

      await setDoc(
        docRef,
        {
          userId,
          date,
          completedCount,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    } catch (error) {
      console.error('達成記録更新エラー:', error)
      throw new Error('達成記録の更新に失敗しました')
    }
  },

  /**
   * 達成カウントを増加
   */
  incrementCount: async (userId: string, date: string): Promise<void> => {
    try {
      const achievementId = `${userId}_${date}`
      const docRef = doc(db, 'achievements', achievementId)

      // ドキュメントが存在するかチェック
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        // 存在する場合は増加
        await updateDoc(docRef, {
          completedCount: increment(1),
          updatedAt: serverTimestamp(),
        })
      } else {
        // 存在しない場合は新規作成
        await setDoc(docRef, {
          userId,
          date,
          completedCount: 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }
    } catch (error) {
      console.error('達成カウント増加エラー:', error)
      throw new Error('達成カウントの増加に失敗しました')
    }
  },

  /**
   * 達成カウントを減少
   */
  decrementCount: async (userId: string, date: string): Promise<void> => {
    try {
      const achievementId = `${userId}_${date}`
      const docRef = doc(db, 'achievements', achievementId)

      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const currentCount = docSnap.data().completedCount || 0
        const newCount = Math.max(0, currentCount - 1)

        await updateDoc(docRef, {
          completedCount: newCount,
          updatedAt: serverTimestamp(),
        })
      }
    } catch (error) {
      console.error('達成カウント減少エラー:', error)
      throw new Error('達成カウントの減少に失敗しました')
    }
  },
}
