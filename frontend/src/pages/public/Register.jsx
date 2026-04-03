import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import useUserStore from '../../store/UserStore'
import useFarmerAuthStore from '../../store/FarmerAuthStore'
import RSBSAInput from './components/RSBSAInput'
import { IoMdArrowRoundBack } from 'react-icons/io'
import { User, Tractor } from 'lucide-react'

const EMPTY_FORM = {
  firstname: '', lastname: '', email: '',
  password: '', confirmPassword: '',
  contact_number: '', address: '', rsbsa_num: '',
}

const Register = () => {
  const [activeTab, setActiveTab] = useState('user')
  const [roleSelected, setRoleSelected] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const userRegister = useUserStore((s) => s.register)
  const farmerRegister = useFarmerAuthStore((s) => s.register)

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectRole = (role) => {
    setActiveTab(role)
    setRoleSelected(true)
    setFormData(EMPTY_FORM)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.firstname.trim()) {
      Swal.fire({ icon: 'warning', title: 'First Name Required', confirmButtonColor: '#166534' })
      return setLoading(false)
    }
    if (!formData.lastname.trim()) {
      Swal.fire({ icon: 'warning', title: 'Last Name Required', confirmButtonColor: '#166534' })
      return setLoading(false)
    }
    if (!isValidEmail(formData.email)) {
      Swal.fire({ icon: 'error', title: 'Invalid Email', confirmButtonColor: '#166534' })
      return setLoading(false)
    }
    if (formData.password.length < 6) {
      Swal.fire({ icon: 'error', title: 'Password too short', text: 'At least 6 characters', confirmButtonColor: '#166534' })
      return setLoading(false)
    }
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({ icon: 'error', title: 'Passwords do not match', confirmButtonColor: '#166534' })
      return setLoading(false)
    }

    try {
      const { confirmPassword, ...dataToSend } = formData

      if (activeTab === 'user') {
        await userRegister(dataToSend)
      } else {
        await farmerRegister(dataToSend)
      }

      await Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: `Welcome to Farmer's Marketplace`,
        confirmButtonColor: '#166534',
      })

      navigate(activeTab === 'farmer' ? '/farmer/dashboard/index' : '/')
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Registration Failed', text: err.message, confirmButtonColor: '#166534' })
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `w-full px-3 py-2.5 text-sm rounded-xl border-2 border-gray-200 hover:border-gray-300
    focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)]
    outline-none text-gray-800 font-medium transition-all`

  // ── Role selection screen ────────────────────────────────────────────────────
  if (!roleSelected) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-900 to-green-700 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="h-1.5 w-full bg-linear-to-r from-green-400 via-emerald-500 to-teal-400" />
          <div className="p-8">
            <Link to={-1}>
              <IoMdArrowRoundBack size={24} className="mb-5 text-gray-500 hover:text-green-700 transition-colors" />
            </Link>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-green-900">🌾 Farmer's Marketplace</h1>
              <p className="text-gray-500 text-sm mt-1">Choose your account type</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => handleSelectRole('user')}
                className="w-full bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                  text-white font-bold py-5 px-6 rounded-2xl transition-all active:scale-[0.98] shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-bold">I'm a Customer</p>
                    <p className="text-xs text-blue-100 mt-0.5">Browse and purchase fresh produce</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSelectRole('farmer')}
                className="w-full bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700
                  text-white font-bold py-5 px-6 rounded-2xl transition-all active:scale-[0.98] shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Tractor className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-bold">I'm a Farmer</p>
                    <p className="text-xs text-green-100 mt-0.5">List and sell your crops</p>
                  </div>
                </div>
              </button>
            </div>
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-green-700 hover:text-green-600 font-semibold">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Registration form ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-linear-to-br from-green-900 to-green-700 flex items-center justify-center px-4 py-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 w-full bg-linear-to-r from-green-400 via-emerald-500 to-teal-400" />

        <div className="p-7">
          <button type="button" onClick={() => setRoleSelected(false)}>
            <IoMdArrowRoundBack size={24} className="mb-4 text-gray-500 hover:text-green-700 transition-colors" />
          </button>

          <div className="text-center mb-5">
            <h1 className="text-xl font-bold text-green-900">🌾 Farmer's Marketplace</h1>
            <p className="text-gray-500 text-sm mt-1">
              Create your {activeTab === 'farmer' ? 'Farmer' : 'Customer'} account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {activeTab === 'farmer' && (
              <RSBSAInput
                value={formData.rsbsa_num}
                onChange={(value) => setFormData((prev) => ({ ...prev, rsbsa_num: value }))}
              />
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">First Name</label>
                <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} placeholder="John" className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Last Name</label>
                <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} placeholder="Doe" className={inputClass} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className={inputClass} />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Contact Number</label>
              <input type="tel" name="contact_number" value={formData.contact_number} onChange={handleChange} placeholder="09xxxxxxxxx" className={inputClass} />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Your address" className={inputClass} />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className={inputClass} />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className={inputClass} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white mt-2
                bg-linear-to-r from-green-600 to-emerald-600
                hover:from-green-700 hover:to-emerald-700
                active:scale-[0.98] transition-all shadow-md shadow-green-200
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Creating Account...
                  </span>
                : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-green-700 hover:text-green-600 font-semibold">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register