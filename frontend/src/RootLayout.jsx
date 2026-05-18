import React, { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import useUserStore from './store/UserStore'
import useFarmerAuthStore from './store/FarmerAuthStore'

const RootLayout = () => {
  const checkUserAuth = useUserStore.getState().checkAuth
  const checkFarmerAuth = useFarmerAuthStore.getState().checkAuth

  useEffect(() => {
    checkUserAuth()
    checkFarmerAuth()
  }, [])

  return <RouterProvider router={router} />
}

export default RootLayout
