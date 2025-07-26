'use client'

import { useEffect } from 'react'

type Props = {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

export default function Toast({ message, type = 'success', onClose }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed top-14 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-md text-white z-50
      ${type === 'success' ? 'bg-green-500' : type === 'info' ? 'bg-blue-500' : 'bg-red-500'}`}
    >
      {message}
    </div>
  )
}
