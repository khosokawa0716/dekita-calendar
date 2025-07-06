'use client'

import { useEffect, useState } from 'react'
import { userAPI } from '@/lib/api'

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
        const users = await userAPI.getChildrenByFamilyId(familyId)
        const childrenList = users.map((user) => ({
          id: user.id,
          displayName: user.displayName,
          role: user.role,
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
