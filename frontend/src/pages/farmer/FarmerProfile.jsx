import React, { useState } from 'react'
import Header from '../public/components/Header'
import Swal from 'sweetalert2'
import axios from 'axios'
import useFarmerAuthStore from '../../store/FarmerAuthStore'
import Sidebar from '../public/components/SideBar'
import { CircleUser } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_BASE_URL

const FarmerProfile = () => {
  const user = useFarmerAuthStore((state) => state.farmer)
  const logout = useFarmerAuthStore((state) => state.logout)

  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    email: user?.email || '',
    contact_number: user?.contact_number || '',
    address: user?.address || '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('farmer_token')
      await axios.put(
        `${BASE_URL}/api/auth/farmer/me`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      Swal.fire({ title: 'Saved!', text: 'Profile updated successfully.', icon: 'success', timer: 1500, showConfirmButton: false })
      setEditing(false)
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.response?.data?.message || 'Update failed.', icon: 'error' })
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

  const fields = [
    { label: 'First Name',      name: 'firstname',      type: 'text' },
    { label: 'Last Name',       name: 'lastname',       type: 'text' },
    { label: 'Email Address',   name: 'email',          type: 'email' },
    { label: 'Contact Number',  name: 'contact_number', type: 'text' },
    { label: 'Address',         name: 'address',        type: 'text' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar onLogout={logout} />

        <main className="flex-1 overflow-auto p-8">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                <CircleUser className="w-3.5 h-3.5" />
                Profile Management
              </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-green-900">My Profile</h2>
            <p className="text-gray-500 text-sm mt-1">View and manage your account information.</p>
          </div>

          <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 300px' }}>

            {/* Profile form */}
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
                {fields.map(({ label, name, type }) => (
                  <div key={name} className={name === 'address' ? 'col-span-2' : ''}>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      {label}
                    </label>
                    {editing ? (
                      <input
                        type={type}
                        name={name}
                        value={form[name]}
                        onChange={handleChange}
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-green-500 transition-colors"
                      />
                    ) : (
                      <p className="text-sm text-gray-700 py-2 border-b border-gray-100">
                        {user?.[name] || <span className="text-gray-300 italic">Not set</span>}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* RSBSA — read only */}
              {user?.rsbsa_number && (
                <div className="mt-5">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                    RSBSA Number
                  </label>
                  <p className="text-sm text-gray-700 py-2 border-b border-gray-100 font-mono">
                    {user.rsbsa_number}
                  </p>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-4">

              {/* Avatar card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-green-900 flex items-center justify-center text-white text-3xl mb-3 shadow-sm">
                  🧑‍🌾
                </div>
                <p className="font-bold text-green-900 text-base">
                  {user?.firstname} {user?.lastname}
                </p>
                <span className="mt-1 text-xs font-semibold bg-orange-100 text-orange-600 px-3 py-1 rounded capitalize">
                  {user?.role}
                </span>
                <p className="text-gray-400 text-xs mt-2">{user?.email}</p>
              </div>

              {/* Account details card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                <p className="font-bold text-green-900 text-sm mb-3">Account Details</p>
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Member Since</p>
                    <p className="text-sm text-gray-700 mt-0.5">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Account Status</p>
                    <p className="text-sm mt-0.5">
                      <span className="text-green-600 font-semibold">● Active</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Danger zone */}
              <div className="bg-white rounded-lg shadow-sm border border-red-100 p-5">
                <button
                  onClick={logout}
                  className="w-full text-sm font-medium text-red-500 hover:bg-red-50 border border-red-200 rounded px-4 py-2 transition-colors"
                >
                  🚪 Logout
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default FarmerProfile