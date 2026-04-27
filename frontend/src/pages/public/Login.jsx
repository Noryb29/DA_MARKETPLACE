import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import useUserStore from '../../store/UserStore'
import useFarmerAuthStore from '../../store/FarmerAuthStore'
import { IoMdArrowRoundBack } from 'react-icons/io'
import { User, Tractor } from 'lucide-react'

const Login = () => {
  const [activeTab, setActiveTab] = useState('user')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const userLogin = useUserStore((s) => s.login)
  const farmerLogin = useFarmerAuthStore((s) => s.login)

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)

  if (!email.trim()) {
    setLoading(false)
    return Swal.fire({
      icon: 'warning',
      title: 'Email Required',
      confirmButtonColor: '#166534'
    })
  }

  if (!isValidEmail(email)) {
    setLoading(false)
    return Swal.fire({
      icon: 'error',
      title: 'Invalid Email',
      confirmButtonColor: '#166534'
    })
  }

  if (!password.trim() || password.length < 6) {
    setLoading(false)
    return Swal.fire({
      icon: 'error',
      title: 'Invalid Password',
      text: 'At least 6 characters required',
      confirmButtonColor: '#166534'
    })
  }

  try {
    if (activeTab === 'user') {
      const user = await userLogin(email, password)
      if (!user) return

      navigate(
        user?.role === 'admin'
          ? '/admin/dashboard'
          : '/user/index',
        { replace: true }
      )
    } else {
      const farmer = await farmerLogin(email, password)
      if (!farmer) return

      navigate('/farmer/dashboard/index', { replace: true })
    }
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-linear-to-br from-green-900 to-green-700 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 w-full bg-linear-to-r from-green-400 via-emerald-500 to-teal-400" />

        <div className="p-8">
          <Link to="/">
            <IoMdArrowRoundBack size={24} className="mb-5 text-gray-500 hover:text-green-700 transition-colors" />
          </Link>

          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-green-900">🌾 Farmer's Marketplace</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
          </div>

          {/* Toggle */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('user')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                ${activeTab === 'user'
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'}`}
            >
              <User className="w-4 h-4" />
              Customer
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('farmer')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                ${activeTab === 'farmer'
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Tractor className="w-4 h-4" />
              Farmer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300
                  focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)]
                  outline-none text-sm text-gray-800 font-medium transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300
                  focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)]
                  outline-none text-sm text-gray-800 font-medium transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white
                bg-linear-to-r from-green-600 to-emerald-600
                hover:from-green-700 hover:to-emerald-700
                active:scale-[0.98] transition-all shadow-md shadow-green-200
                disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                `Sign in as ${activeTab === 'user' ? 'Customer' : 'Farmer'}`
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-700 hover:text-green-600 font-semibold">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login