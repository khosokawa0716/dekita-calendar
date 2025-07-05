import React from 'react'
import { useUserInfo } from '@/hooks/useUserInfo'

type UserRole = 'parent' | 'child'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
  loadingComponent?: React.ReactNode
  unauthorizedComponent?: React.ReactNode
}

export function RoleGuard({
  allowedRoles,
  children,
  loadingComponent,
  unauthorizedComponent,
}: RoleGuardProps) {
  const { userInfo } = useUserInfo()

  // ユーザー情報がまだ読み込まれていない場合
  if (!userInfo) {
    return <>{loadingComponent || <div>Loading...</div>}</>
  }

  // 権限チェック
  const isAuthorized = allowedRoles.includes(userInfo.role)

  if (!isAuthorized) {
    return (
      <>
        {unauthorizedComponent || (
          <div>
            このページは{allowedRoles.includes('parent') ? '保護者' : '子ども'}
            のみアクセス可能です
          </div>
        )}
      </>
    )
  }

  return <>{children}</>
}
