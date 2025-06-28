'use client'

import { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

type UserInfo = {
  id: string
  displayName: string
  role: 'parent' | 'child'
  familyId: string
}

export function useUserInfo() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          const data = userSnap.data()
          setUserInfo({
            id: currentUser.uid,
            displayName: data.displayName,
            role: data.role,
            familyId: data.familyId,
          })
        }
      }

      setLoading(false)
    })

    return () => unsubscribe() // クリーンアップ関数でリスナーを解除
  }, [])

  return { userInfo, loading }
}
