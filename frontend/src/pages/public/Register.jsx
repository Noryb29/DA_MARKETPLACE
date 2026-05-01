import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import useUserStore from '../../store/UserStore'
import useFarmerAuthStore from '../../store/FarmerAuthStore'
import RSBSAInput from './components/RSBSAInput'
import { IoMdArrowRoundBack, IoMdCheckmark } from 'react-icons/io'
import { User, Tractor } from 'lucide-react'
import REGION_X from '../../assets/REGION_X.json'

const EMPTY_FORM = {
  firstname: '', middlename: '', lastname: '', email: '',
  password: '', confirmPassword: '',
  contact_number: '', address: '', rsbsa_num: '',
}

// ── Moved outside Register to prevent remount on every render ────────────────
const SectionCard = ({ step, title, children, highlight = false }) => (
  <div className={`rounded-xl p-4 border ${highlight ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gray-50/80 border-gray-100'}`}>
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-sm">
        <span className="text-white text-xs font-bold">{step}</span>
      </div>
      <span className="text-sm font-bold text-gray-800">{title}</span>
    </div>
    {children}
  </div>
)

const Register = () => {
  const [activeTab, setActiveTab] = useState('user')
  const [roleSelected, setRoleSelected] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)

  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedMunicipality, setSelectedMunicipality] = useState('')
  const [selectedBarangay, setSelectedBarangay] = useState('')
  const [hasRSBSA, setHasRSBSA] = useState(false)

  const provinces = Object.keys(REGION_X)
  const municipalities = selectedProvince ? Object.keys(REGION_X[selectedProvince]) : []
  const barangays = selectedProvince && selectedMunicipality ? REGION_X[selectedProvince][selectedMunicipality] || [] : []

  const handleProvinceChange = (e) => {
    const province = e.target.value
    setSelectedProvince(province)
    setSelectedMunicipality('')
    setSelectedBarangay('')
    setFormData((prev) => ({ ...prev, province, municipality: '', barangay: '' }))
  }

  const handleMunicipalityChange = (e) => {
    const municipality = e.target.value
    setSelectedMunicipality(municipality)
    setSelectedBarangay('')
    setFormData((prev) => ({ ...prev, municipality, barangay: '' }))
  }

  const handleBarangayChange = (e) => {
    const barangay = e.target.value
    setSelectedBarangay(barangay)
    setFormData((prev) => ({ ...prev, barangay }))
  }

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
    setSelectedProvince('')
    setSelectedMunicipality('')
    setSelectedBarangay('')
    setHasRSBSA(false)
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

      let result
      if (activeTab === 'user') {
        result = await userRegister(dataToSend)
      } else {
        result = await farmerRegister(dataToSend)
      }

      if (result?.error) {
        setLoading(false)
        return Swal.fire({ icon: 'error', title: 'Registration Failed', text: result.error, confirmButtonColor: '#166534' })
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

  const inputClass = `w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white
    hover:border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/10
    outline-none text-gray-700 font-medium transition-all duration-200`

  const labelClass = `block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5`

  // ── Role selection screen ────────────────────────────────────────────────────
  if (!roleSelected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />
          <div className="p-8">
            <Link to={-1}>
              <IoMdArrowRoundBack size={24} className="mb-5 text-gray-400 hover:text-green-600 transition-colors" />
            </Link>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">🌾 Farmer's Marketplace</h1>
              <p className="text-gray-500 text-sm">Choose your account type to get started</p>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => handleSelectRole('user')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                  text-white font-bold py-4 px-6 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">I'm a Customer</p>
                    <p className="text-xs text-blue-100 mt-0.5">Browse and purchase fresh produce</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSelectRole('farmer')}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700
                  text-white font-bold py-4 px-6 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-green-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <Tractor className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">I'm a Farmer</p>
                    <p className="text-xs text-green-100 mt-0.5">List and sell your crops</p>
                  </div>
                </div>
              </button>
            </div>
            <p className="text-center text-sm text-gray-500 mt-8">
              Already have an account?{' '}
              <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Registration form (3 columns) ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center px-4 py-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden max-h-[95vh] overflow-y-auto">
        <div className="h-2 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button type="button" onClick={() => setRoleSelected(false)} className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors">
              <IoMdArrowRoundBack size={20} />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
              {activeTab === 'farmer' ? <Tractor className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
              <span className="text-sm font-semibold text-white">{activeTab === 'farmer' ? 'Farmer' : 'Customer'}</span>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">Fill in your information below</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-6">
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-0">
              {/* RSBSA Section - Farmers */}
              {activeTab === 'farmer' && (
                <SectionCard step="1" title="Farmer ID" highlight>
                  <RSBSAInput
                    value={formData.rsbsa_num}
                    onChange={(value) => setFormData((prev) => ({ ...prev, rsbsa_num: value }))}
                  />
                </SectionCard>
              )}

              {/* User RSBSA Section */}
              {activeTab === 'user' && (
                <SectionCard step="1" title="RSBSA (Optional)">
                  <label className="flex items-center gap-3 cursor-pointer mb-3 p-2.5 rounded-lg bg-white border border-gray-200 hover:border-green-400 hover:bg-green-50/50 transition-all">
                    <input
                      type="checkbox"
                      checked={hasRSBSA}
                      onChange={(e) => {
                        setHasRSBSA(e.target.checked)
                        if (!e.target.checked) {
                          setFormData((prev) => ({ ...prev, rsbsa_num: '' }))
                        }
                      }}
                      className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                    />
                    <span className="text-xs text-gray-600 font-medium">I have RSBSA number</span>
                  </label>
                  {hasRSBSA && (
                    <RSBSAInput
                      value={formData.rsbsa_num}
                      onChange={(value) => setFormData((prev) => ({ ...prev, rsbsa_num: value }))}
                    />
                  )}
                </SectionCard>
              )}

              {/* Personal Names */}
              <SectionCard step="2" title="Personal Info">
                <div className="space-y-2.5">
                  <div>
                    <label className={labelClass}>First Name</label>
                    <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} placeholder="John" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Middle Name</label>
                    <input type="text" name="middlename" value={formData.middlename} onChange={handleChange} placeholder="M." className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name</label>
                    <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} placeholder="Doe" className={inputClass} />
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* MIDDLE COLUMN */}
            <div className="flex flex-col gap-5">
              {/* Location */}
              <SectionCard step="3" title="Location">
                <div className="space-y-2.5">
                  <div>
                    <label className={labelClass}>Province</label>
                    <select
                      value={selectedProvince}
                      onChange={handleProvinceChange}
                      className={inputClass}
                    >
                      <option value="">Select Province</option>
                      {provinces.map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Municipality</label>
                    <select
                      value={selectedMunicipality}
                      onChange={handleMunicipalityChange}
                      disabled={!selectedProvince}
                      className={`${inputClass} ${!selectedProvince ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                    >
                      <option value="">Select Municipality</option>
                      {municipalities.map((mun) => (
                        <option key={mun} value={mun}>{mun}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Barangay</label>
                    <select
                      value={selectedBarangay}
                      onChange={handleBarangayChange}
                      disabled={!selectedMunicipality}
                      className={`${inputClass} ${!selectedMunicipality ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                    >
                      <option value="">Select Barangay</option>
                      {barangays.map((brgy) => (
                        <option key={brgy} value={brgy}>{brgy}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </SectionCard>

              {/* Address - in same column as Location */}
              <SectionCard step="4" title="Address">
                <div>
                  <label className={labelClass}>Street Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="House No., Street, Village" className={inputClass} />
                </div>
              </SectionCard>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4">
              {/* Contact Information */}
              <SectionCard step="5" title="Contact">
                <div className="space-y-2.5">
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input type="tel" name="contact_number" value={formData.contact_number} onChange={handleChange} placeholder="09xxxxxxxxx" className={inputClass} />
                  </div>
                </div>
              </SectionCard>

              {/* Security */}
              <SectionCard step="6" title="Security">
                <div className="space-y-2.5">
                  <div>
                    <label className={labelClass}>Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min. 6 characters" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Confirm Password</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" className={inputClass} />
                  </div>
                </div>
              </SectionCard>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white
                  bg-gradient-to-r from-green-600 to-emerald-600
                  hover:from-green-700 hover:to-emerald-700
                  active:scale-[0.98] transition-all shadow-lg shadow-green-200
                  disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading
                  ? <>
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Creating Account...
                    </>
                  : <>
                      <IoMdCheckmark className="w-5 h-5" />
                      Create Account
                    </>
                }
              </button>

              <p className="text-center text-xs text-gray-500 mt-2">
                Already have an account?{' '}
                  <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">Sign in</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register