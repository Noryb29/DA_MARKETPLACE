import React, { useState, useEffect } from 'react'
import Header from '../public/components/Header'
import Swal from 'sweetalert2'
import axios from 'axios'
import useFarmerAuthStore from '../../store/FarmerAuthStore'
import Sidebar from '../public/components/SideBar'
import { CircleUser, Upload, X } from 'lucide-react'
import { FaEdit, FaCalendar, FaMars, FaVenus } from 'react-icons/fa'

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

const FarmerProfile = () => {
  const user = useFarmerAuthStore((state) => state.farmer)
  const logout = useFarmerAuthStore((state) => state.logout)
  const farmerDetails = useFarmerAuthStore((state) => state.farmerDetails)
  const fetchFarmerDetails = useFarmerAuthStore((state) => state.fetchFarmerDetails)
  const saveFarmerDetails = useFarmerAuthStore((state) => state.saveFarmerDetails)

  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [form, setForm] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    email: user?.email || '',
    contact_number: user?.contact_number || '',
    address: user?.address || '',
  })
  const [detailsForm, setDetailsForm] = useState({
    profile_picture: '',
    bio: '',
    gender: '',
    date_of_birth: '',
  })
  const [photoPreview, setPhotoPreview] = useState(null)

  useEffect(() => {
    fetchFarmerDetails()
  }, [])

  useEffect(() => {
    if (farmerDetails) {
      const profilePic = farmerDetails.profile_picture 
        ? (farmerDetails.profile_picture.startsWith('http') ? farmerDetails.profile_picture : `${BASE_URL}${farmerDetails.profile_picture}`)
        : ''
      setDetailsForm({
        profile_picture: profilePic,
        bio: farmerDetails.bio || '',
        gender: farmerDetails.gender || '',
        date_of_birth: farmerDetails.date_of_birth || '',
      })
      setPhotoPreview(profilePic || null)
    }
  }, [farmerDetails])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleDetailsChange = (e) => {
    setDetailsForm({ ...detailsForm, [e.target.name]: e.target.value })
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setPhotoPreview(previewUrl)
      setDetailsForm({ ...detailsForm, profile_picture: file })
    }
  }

  const handleRemovePhoto = () => {
    setPhotoPreview(null)
    setDetailsForm({ ...detailsForm, profile_picture: '' })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('farmer_token')
      await axios.put(`${BASE_URL}/api/auth/farmer/me`, form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      Swal.fire({ title: 'Saved!', text: 'Profile updated successfully.', icon: 'success', timer: 1500, showConfirmButton: false })
      setEditing(false)
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.response?.data?.message || 'Update failed.', icon: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDetails = async () => {
    setLoading(true)
    try {
      const result = await saveFarmerDetails(detailsForm)
      if (result?.error) {
        Swal.fire({ title: 'Error', text: result.error, icon: 'error' })
      } else {
        Swal.fire({ title: 'Saved!', text: 'Details updated successfully.', icon: 'success', timer: 1500, showConfirmButton: false })
        setShowDetailsModal(false)
      }
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.response?.data?.message || 'Save failed.', icon: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setForm({
      firstname: user?.firstname || '',
      lastname: user?.lastname || '',
      email: user?.email || '',
      contact_number: user?.contact_number || '',
      address: user?.address || '',
    })
    setEditing(false)
  }

  const getInitials = () => {
    if (user?.firstname) {
      return user.firstname.charAt(0).toUpperCase()
    }
    return '?'
  }

  const getProfilePicture = () => {
    if (!farmerDetails?.profile_picture) return null
    const pic = farmerDetails.profile_picture
    return pic.startsWith('http') ? pic : `${BASE_URL}${pic}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar onLogout={logout} />

        <main className="flex-1 overflow-auto p-8">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
            <CircleUser className="w-3.5 h-3.5" />
            Profile Management
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-bold text-green-900">My Profile</h2>
            <p className="text-gray-500 text-sm mt-1">View and manage your account information.</p>
          </div>

          {/* ── Grid: left card + right sidebar ── */}
          <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 300px' }}>

            {/* ── LEFT: Personal Information card ── */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                
                <h3 className="font-bold text-green-900">Personal Information</h3>
                
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    ✏️ Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors px-3 py-1 rounded border border-gray-200 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded transition-colors disabled:opacity-60"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">First Name</label>
                  {editing ? (
                    <input type="text" name="firstname" value={form.firstname} onChange={handleChange} className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-green-500" />
                  ) : (
                    <p className="text-sm text-gray-700 py-2 border-b border-gray-100">{user?.firstname || <span className="text-gray-300 italic">Not set</span>}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Last Name</label>
                  {editing ? (
                    <input type="text" name="lastname" value={form.lastname} onChange={handleChange} className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-green-500" />
                  ) : (
                    <p className="text-sm text-gray-700 py-2 border-b border-gray-100">{user?.lastname || <span className="text-gray-300 italic">Not set</span>}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Email Address</label>
                  {editing ? (
                    <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-green-500" />
                  ) : (
                    <p className="text-sm text-gray-700 py-2 border-b border-gray-100">{user?.email || <span className="text-gray-300 italic">Not set</span>}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Contact Number</label>
                  {editing ? (
                    <input type="text" name="contact_number" value={form.contact_number} onChange={handleChange} className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-green-500" />
                  ) : (
                    <p className="text-sm text-gray-700 py-2 border-b border-gray-100">{user?.contact_number || <span className="text-gray-300 italic">Not set</span>}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Address</label>
                  {editing ? (
                    <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-green-500" />
                  ) : (
                    <p className="text-sm text-gray-700 py-2 border-b border-gray-100">{user?.address || <span className="text-gray-300 italic">Not set</span>}</p>
                  )}
                </div>

                {/* Additional Details section */}
                <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Additional Details</p>
                    <button onClick={() => setShowDetailsModal(true)} className="text-sm font-medium text-green-600 hover:text-green-700">
                      <FaEdit className="inline mr-1" /> Edit
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Gender</label>
                  {farmerDetails?.gender ? (
                    <div className="flex items-center gap-2 py-2">
                      {farmerDetails.gender === 'male' ? <FaMars className="text-blue-500 w-4 h-4" /> : <FaVenus className="text-pink-500 w-4 h-4" />}
                      <span className="text-sm text-gray-700 capitalize">{farmerDetails.gender}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-300 italic py-2">Not set</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Date of Birth</label>
                  {farmerDetails?.date_of_birth ? (
                    <div className="flex items-center gap-2 py-2">
                      <FaCalendar className="text-gray-400 w-4 h-4" />
                      <span className="text-sm text-gray-700">{new Date(farmerDetails.date_of_birth).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-300 italic py-2">Not set</p>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Bio</label>
                  {farmerDetails?.bio ? (
                    <p className="text-sm text-gray-600 italic">{farmerDetails.bio}</p>
                  ) : (
                    <p className="text-sm text-gray-300 italic">No bio added</p>
                  )}
                </div>

              </div>
            </div>
            {/* ── END LEFT card ── */}

            {/* ── RIGHT: Profile sidebar ── */}
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
                {getProfilePicture() ? (
                  <img src={getProfilePicture()} alt="Profile" className="w-20 h-20 rounded-full object-cover mb-3 shadow-sm" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-green-900 flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-sm">
                    {getInitials()}
                  </div>
                )}
                 {user?.rsbsa_number && (
                  <div className="col-span-3 mt-5 ">
                    <label className="block text-xs font-semibold text-black uppercase tracking-wide mb-1 ">RSBSA Number</label>
                    <p className="text-sm text-white text-gray-700 py-1 border border-gray-100 bg-green-900 rounded-xl p-3 font-mono">{user.rsbsa_number}</p>
                  </div>
                )}

                <p className="font-bold text-green-900 text-base">{user?.firstname} {user?.lastname}</p>
                <span className="mt-1 text-xs font-semibold bg-orange-100 text-orange-600 px-3 py-1 rounded capitalize">{user?.role}</span>
                <p className="text-gray-400 text-xs mt-2">{user?.email}</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                <p className="font-bold text-green-900 text-sm mb-3">Account Details</p>
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Member Since</p>
                    <p className="text-sm text-gray-700 mt-0.5">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Account Status</p>
                    <p className="text-sm mt-0.5"><span className="text-green-600 font-semibold">● Active</span></p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-red-100 p-5">
                <button onClick={logout} className="w-full text-sm font-medium text-red-500 hover:bg-red-50 border border-red-200 rounded px-4 py-2 transition-colors">
                  🚪 Logout
                </button>
              </div>
            </div>
            {/* ── END RIGHT sidebar ── */}

          </div>
          {/* ── END Grid ── */}

        </main>
      </div>

      {/* ── Details Modal ── */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
              <h3 className="text-lg font-bold text-white">Edit Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Profile Picture</label>
                <div className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all ${photoPreview ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {photoPreview ? (
                    <div className="relative">
                      <img src={photoPreview} alt="Profile preview" className="w-24 h-24 rounded-full object-cover mx-auto" />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute top-0 right-1/2 translate-x-8 -translate-y-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <p className="text-xs text-green-600 mt-2 font-medium">Click to change photo</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-2">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500 font-medium">Click to upload photo</p>
                      <p className="text-[10px] text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Bio</label>
                <textarea name="bio" value={detailsForm.bio} onChange={handleDetailsChange} placeholder="Tell us about yourself..." rows="3" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Gender</label>
                <select name="gender" value={detailsForm.gender} onChange={handleDetailsChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Date of Birth</label>
                <input type="date" name="date_of_birth" value={detailsForm.date_of_birth} onChange={handleDetailsChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500" />
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setShowDetailsModal(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveDetails} disabled={loading} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60">
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FarmerProfile