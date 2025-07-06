'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'

type FamilyChild = {
  id: string
  displayName: string
  role: 'child'
}

export function useFamilyChildren(familyId: string | undefined) {
  const [children, setChildren] = useState<FamilyChild[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChildren = async () => {
      if (!familyId) {
        setLoading(false)
        return
      }

      try {
        const q = query(
          collection(db, 'users'),
          where('familyId', '==', familyId),
          where('role', '==', 'child')
        )
        const snapshot = await getDocs(q)
        const childrenList = snapshot.docs.map((doc) => ({
          id: doc.id,
          displayName: doc.data().displayName,
          role: doc.data().role,
        })) as FamilyChild[]
        
        setChildren(childrenList)
      } catch (error) {
        console.error('子どもリスト取得エラー:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChildren()
  }, [familyId])

  return { children, loading }
}
