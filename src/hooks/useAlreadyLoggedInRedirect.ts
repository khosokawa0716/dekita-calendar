'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export function useAlreadyLoggedInRedirect() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/')
      }
    })
    return () => unsubscribe()
  }, [router])
}
// このフックは、ユーザーが既にログインしている場合にトップページにリダイレクトします。
// 例えば、サインアップやログインページで使用されます。
