import React, { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import useUserStore from './store/UserStore'
import useFarmerAuthStore from './store/FarmerAuthStore'

const RootLayout = () => {
  const checkUserAuth = useUserStore((state) => state.checkAuth)
  const isCheckingUserAuth = useUserStore((state) => state.isCheckingAuth)
  const checkFarmerAuth = useFarmerAuthStore((state) => state.checkAuth)
  const isCheckingFarmerAuth = useFarmerAuthStore((state) => state.isCheckingAuth)

  useEffect(() => {
    checkUserAuth()
    checkFarmerAuth()
  }, [])

  if (isCheckingUserAuth || isCheckingFarmerAuth) {
    return <div className="min-h-screen bg-gray-50" />
  }

  return <RouterProvider router={router} />
}

export default RootLayout
