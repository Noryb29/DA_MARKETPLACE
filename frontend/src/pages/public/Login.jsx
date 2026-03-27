import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import useUserStore from '../../store/UserStore'
import { IoMdArrowRoundBack } from "react-icons/io";


const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  //LOGIN STATE FROM STORE
  const login = useUserStore((state) => state.login)

  // Email validation regex
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Validation checks
    if (!email.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Email Required',
        text: 'Please enter your email address',
        confirmButtonColor: '#166534',
      })
      setLoading(false)
      return
    }

    if (!isValidEmail(email)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address',
        confirmButtonColor: '#166534',
      })
      setLoading(false)
      return
    }

    if (!password.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Password Required',
        text: 'Please enter your password',
        confirmButtonColor: '#166534',
      })
      setLoading(false)
      return
    }

    if (password.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Password',
        text: 'Password must be at least 6 characters long',
        confirmButtonColor: '#166534',
      })
      setLoading(false)
      return
    }

    try {
      const user = await login(email, password)

      // Success alert
      await Swal.fire({
        icon: 'success',
        title: 'Login Successful!',
        text: 'Welcome!',
        confirmButtonColor: '#166534',
      })

      // Redirect based on user role
      if (user?.role === 'user') {
        navigate('/')
      } else if (user?.role === 'farmer') {
        navigate('/farmer/dashboard/index')
      } else if (user?.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.message || 'An error occurred during login. Please try again.',
        confirmButtonColor: '#166534',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-900 to-green-700 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        
        <Link to={'/'}><IoMdArrowRoundBack size={30} className='mb-5  ' /></Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-900 mb-2">🌾 Farmer's Marketplace</h1>
          <p className="text-gray-600">Login Using your Account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-900 hover:bg-green-800 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-green-900 hover:text-green-700 font-medium">
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
