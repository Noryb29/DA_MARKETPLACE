import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import useUserStore from '../../store/UserStore'
import RSBSAInput from './components/RSBSAInput'
import { IoMdArrowRoundBack } from "react-icons/io";


const Register = () => {
  const [selectedRole, setSelectedRole] = useState('user')
  const [roleSelected, setRoleSelected] = useState(false)
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    contact_number: '',
    address: '',
    rsbsa_num:'',
    role: '',
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const register = useUserStore((state) => state.register)

  // Email validation regex
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectRole = (role) => {
    setSelectedRole(role)
    setFormData((prev) => ({
      ...prev,
      role: role,
    }))
    setRoleSelected(true)
  }

  const handleBackToRoleSelection = () => {
    setRoleSelected(false)
    setSelectedRole(null)
    setFormData((prev) => ({
      ...prev,
      role: '',
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Validation checks
    if (!formData.firstname.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'First Name Required',
        text: 'Please enter your first name',
        confirmButtonColor: '#166534',
      })
      setLoading(false)
      return
    }

    if (!formData.lastname.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Last Name Required',
        text: 'Please enter your last name',
        confirmButtonColor: '#166534',
      })
      setLoading(false)
      return
    }

    if (!formData.email.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Email Required',
        text: 'Please enter your email address',
        confirmButtonColor: '#166534',
      })
      setLoading(false)
      return
    }

    if (!isValidEmail(formData.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address',
        confirmButtonColor: '#166534',
      })
      setLoading(false)
      return
    }

    if (!formData.password.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Password Required',
        text: 'Please enter your password',
        confirmButtonColor: '#166534',
      })
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Password',
        text: 'Password must be at least 6 characters long',
        confirmButtonColor: '#166534',
      })
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'Passwords do not match',
        confirmButtonColor: '#166534',
      })
      setLoading(false)
      return
    }

    try {
      const { confirmPassword, ...dataToSend } = formData
      await register(dataToSend)

      // Success alert
      await Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: 'Welcome to Farmer\'s Marketplace',
        confirmButtonColor: '#166534',
      })

      navigate('/')
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: err.message || 'An error occurred during registration. Please try again.',
        confirmButtonColor: '#166534',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-900 to-green-700 flex items-center justify-center px-4 py-2">
      {!roleSelected ? (
        // Role Selection Modal
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Link to={-1}><IoMdArrowRoundBack size={30} className='mb-5  ' /></Link>
            <h1 className="text-2xl font-bold text-green-900 mb-2">🌾 Farmer's Marketplace</h1>
            <p className="text-sm text-gray-600 mb-4">Select Your Account Type</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleSelectRole('user')}
              className="w-full bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <div className="text-2xl mb-2">👤</div>
              <div className="text-lg">I'm a Customer</div>
              <div className="text-xs text-blue-100 mt-1">Purchase fresh products</div>
            </button>

            <button
              onClick={() => handleSelectRole('farmer')}
              className="w-full bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <div className="text-2xl mb-2">👨‍🌾</div>
              <div className="text-lg">I'm a Farmer</div>
              <div className="text-xs text-green-100 mt-1">Sell your products</div>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-green-900 hover:text-green-700 font-medium">
                Login here
              </Link>
            </p>
          </div>
        </div>
      ) : (
        // Registration Form
        <div className="bg-white rounded-lg shadow-xl p-5 w-full max-w-md">
          <div className="text-center mb-4">
            <Link onClick={handleBackToRoleSelection}><IoMdArrowRoundBack size={30} className='mb-2  ' /></Link>
            <h1 className="text-2xl font-bold text-green-900 mb-1">🌾 Farmer's Marketplace</h1>
            <p className="text-sm text-gray-600">Create Your Account {selectedRole === 'farmer' ? '(Farmer)' : ''}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">

              {selectedRole === 'farmer' && (
                <RSBSAInput 
                  value={formData.rsbsa_num}
                  onChange={(value) => setFormData((prev) => ({ ...prev, rsbsa_num: value }))}
                />
              )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="John"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="09xxxxxxxxx"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Your address"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-900 hover:bg-green-800 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 mt-3"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>

            <button
              type="button"
              onClick={handleBackToRoleSelection}
              className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Back to Role Selection
            </button>
          </form>

          <div className="mt-3 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-green-900 hover:text-green-700 font-medium">
                Login here
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Register
