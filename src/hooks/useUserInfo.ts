'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { userAPI } from '@/lib/api'

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
        const userData = await userAPI.getById(currentUser.uid)

        if (userData) {
          setUserInfo({
            id: currentUser.uid,
            displayName: userData.displayName,
            role: userData.role,
            familyId: userData.familyId,
          })
        }
      }

      setLoading(false)
    })

    return () => unsubscribe() // クリーンアップ関数でリスナーを解除
  }, [])

  return { userInfo, loading }
}
