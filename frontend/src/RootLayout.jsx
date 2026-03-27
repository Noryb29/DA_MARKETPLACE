import React, { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import useUserStore from './store/UserStore'

const RootLayout = () => {
  const checkAuth = useUserStore((state) => state.checkAuth)
  const isCheckingAuth = useUserStore((state) => state.isCheckingAuth)

  useEffect(() => {
    // Restore authentication state on app load
    checkAuth()
  }, [checkAuth])

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return <div className="min-h-screen bg-gray-50" />
  }

  return <RouterProvider router={router} />
}

export default RootLayout
