import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import axios from 'axios'
import useFarmerAuthStore from '../../store/FarmerAuthStore'
import Sidebar from '../public/components/SideBar'
import { CircleUser, Upload, X, User, Mail, Phone, MapPin, Calendar, Building, Shield, LogOut, Edit, Save, Loader2 } from 'lucide-react'
import { FaMars, FaVenus } from 'react-icons/fa'

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
    middlename: user?.middlename || '',
    lastname: user?.lastname || '',
    email: user?.email || '',
    contact_number: user?.contact_number || '',
    address: user?.address || '',
    province: user?.province || '',
    municipality: user?.municipality || '',
    barangay: user?.barangay || '',
  })
  const [detailsForm, setDetailsForm] = useState({
    profile_picture: '',
    gender: '',
    age: '',
    farmer_organization: '',
    date_of_birth: '',
    province: '',
    municipality: '',
    barangay: '',
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
        gender: farmerDetails.gender || '',
        age: farmerDetails.age || '',
        farmer_organization: farmerDetails.farmer_organization || '',
        date_of_birth: farmerDetails.date_of_birth || '',
        province: farmerDetails.province || '',
        municipality: farmerDetails.municipality || '',
        barangay: farmerDetails.barangay || '',
      })
      setPhotoPreview(profilePic || null)
    }
  }, [farmerDetails])

  useEffect(() => {
    setForm({
      firstname: user?.firstname || '',
      middlename: user?.middlename || '',
      lastname: user?.lastname || '',
      email: user?.email || '',
      contact_number: user?.contact_number || '',
      address: user?.address || '',
      province: user?.province || '',
      municipality: user?.municipality || '',
      barangay: user?.barangay || '',
    })
  }, [user])

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
      const { data } = await axios.put(`${BASE_URL}/api/auth/farmer/me`, form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const checkAuth = useFarmerAuthStore.getState().checkAuth
      await checkAuth()
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
      middlename: user?.middlename || '',
      lastname: user?.lastname || '',
      email: user?.email || '',
      contact_number: user?.contact_number || '',
      address: user?.address || '',
      province: user?.province || '',
      municipality: user?.municipality || '',
      barangay: user?.barangay || '',
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

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar onLogout={logout} />

        <main className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
                  <CircleUser className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                  <p className="text-gray-500 text-sm">View and manage your account information.</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-500 font-medium">Name</span>
                </div>
                <p className="text-lg font-bold text-gray-900 truncate">{user?.firstname} {user?.lastname}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-gray-500 font-medium">Role</span>
                </div>
                <p className="text-lg font-bold text-gray-900 capitalize">{user?.role || 'Farmer'}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-gray-500 font-medium">Member Since</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' }) : '—'}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-500 font-medium">Status</span>
                </div>
                <p className="text-lg font-bold text-green-600">Active</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Profile Card */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="h-1.5 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                    {!editing ? (
                      <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancel}
                          className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={loading}
                          className="flex items-center gap-1 text-sm font-medium bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                        >
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Save
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">First Name</label>
                      {editing ? (
                        <input type="text" name="firstname" value={form.firstname} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
                      ) : (
                        <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{user?.firstname || <span className="text-gray-300 italic">Not set</span>}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Middle Name</label>
                      {editing ? (
                        <input type="text" name="middlename" value={form.middlename} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
                      ) : (
                        <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{user?.middlename || <span className="text-gray-300 italic">Not set</span>}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Last Name</label>
                      {editing ? (
                        <input type="text" name="lastname" value={form.lastname} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
                      ) : (
                        <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{user?.lastname || <span className="text-gray-300 italic">Not set</span>}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                      {editing ? (
                        <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
                      ) : (
                        <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{user?.email || <span className="text-gray-300 italic">Not set</span>}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Contact Number</label>
                      {editing ? (
                        <input type="text" name="contact_number" value={form.contact_number} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
                      ) : (
                        <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{user?.contact_number || <span className="text-gray-300 italic">Not set</span>}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Address</label>
                      {editing ? (
                        <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
                      ) : (
                        <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{user?.address || <span className="text-gray-300 italic">Not set</span>}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Province</label>
                      {editing ? (
                        <input type="text" name="province" value={form.province} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
                      ) : (
                        <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{user?.province || <span className="text-gray-300 italic">Not set</span>}</p>
                      )}
                    </div>
                     <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Municipality</label>
                      {editing ? (
                        <input type="text" name="municipality" value={form.municipality} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
                      ) : (
                        <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{user?.municipality || <span className="text-gray-300 italic">Not set</span>}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Barangay</label>
                      {editing ? (
                        <input type="text" name="barangay" value={form.barangay} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
                      ) : (
                        <p className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-800">{user?.barangay || <span className="text-gray-300 italic">Not set</span>}</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 mt-6 pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Additional Details</h3>
                      <button onClick={() => setShowDetailsModal(true)} className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700">
                        <Edit className="w-4 h-4" /> Edit
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          {farmerDetails?.gender === 'male' ? <FaMars className="w-4 h-4 text-blue-500" /> : <FaVenus className="w-4 h-4 text-pink-500" />}
                          <span className="text-xs text-blue-600 font-semibold uppercase">Gender</span>
                        </div>
                        <p className="text-base font-bold text-gray-900 capitalize">{farmerDetails?.gender || 'Not set'}</p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-purple-500" />
                          <span className="text-xs text-purple-600 font-semibold uppercase">Date of Birth</span>
                        </div>
                        <p className="text-base font-bold text-gray-900">{formatDate(farmerDetails?.date_of_birth)}</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-600 font-semibold uppercase">Age</span>
                        </div>
                        <p className="text-base font-bold text-gray-900">{farmerDetails?.age ? `${farmerDetails.age} years old` : 'Not set'}</p>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Building className="w-4 h-4 text-amber-500" />
                          <span className="text-xs text-amber-600 font-semibold uppercase">Organization</span>
                        </div>
                        <p className="text-base font-bold text-gray-900 truncate">{farmerDetails?.farmer_organization || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="h-1.5 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />
                  <div className="p-6 text-center">
                    {getProfilePicture() ? (
                      <img src={getProfilePicture()} alt="Profile" className="w-24 h-24 rounded-full object-cover mx-auto shadow-sm" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold mx-auto">
                        {getInitials()}
                      </div>
                    )}
                    <p className="font-bold text-gray-900 text-lg mt-4">{user?.firstname} {user?.lastname}</p>
                    <span className="inline-block mt-1 text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full capitalize">{user?.role || 'Farmer'}</span>
                    
                    {user?.rsbsa_number && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 font-semibold uppercase">RSBSA Number</p>
                        <p className="text-sm font-mono text-gray-800">{user.rsbsa_number}</p>
                      </div>
                    )}
                  </div>
                </div>

                

                <div className="bg-white rounded-xl border border-red-100 shadow-sm p-5">
                  <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-500 hover:bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="h-1.5 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />
            <div className="p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Edit Additional Details</h2>
                <button onClick={() => setShowDetailsModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Profile Picture</label>
                <div className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all ${photoPreview ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  {photoPreview ? (
                    <div className="relative">
                      <img src={photoPreview} alt="Profile preview" className="w-24 h-24 rounded-full object-cover mx-auto" />
                      <button type="button" onClick={handleRemovePhoto} className="absolute top-0 right-1/2 translate-x-8 -translate-y-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600">
                        <X className="w-4 h-4" />
                      </button>
                      <p className="text-xs text-green-600 mt-2 font-medium">Click to change</p>
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

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Gender</label>
                  <select name="gender" value={detailsForm.gender} onChange={handleDetailsChange} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Age</label>
                  <input type="number" name="age" value={detailsForm.age} onChange={handleDetailsChange} placeholder="Enter age" className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Date of Birth</label>
                <input type="date" name="date_of_birth" value={detailsForm.date_of_birth} onChange={handleDetailsChange} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Farmer Organization</label>
                <input type="text" name="farmer_organization" value={detailsForm.farmer_organization} onChange={handleDetailsChange} placeholder="Organization name" className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
              </div>
            </div>

            <div className="p-5 pt-0 flex gap-3">
              <button onClick={() => setShowDetailsModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={handleSaveDetails} disabled={loading} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FarmerProfile