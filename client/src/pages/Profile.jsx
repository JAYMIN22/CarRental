import React from 'react'
import { useAppContext } from '../context/AppContext'

const Profile = () => {
  const { user, role, roles, activeRole, logout, navigate, isDriver, isClient } = useAppContext()

  if (!user) {
    return (
      <div className="px-6 md:px-10 pt-24">
        <p className="text-gray-600">No user is logged in.</p>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const normalizeRoleKey = (r) => {
    if (r === 'user' || r === 'renter') return 'renter'
    if (r === 'client' || r === 'owner') return 'client'
    if (r === 'driver') return 'driver'
    if (r === 'admin') return 'admin'
    return 'user'
  }

  const prettyLabel = (key) =>
    key === 'renter'
      ? 'Renter'
      : key === 'client'
        ? 'Client'
        : key === 'driver'
          ? 'Driver'
          : key === 'admin'
            ? 'Admin'
            : 'User'

  const currentKey = normalizeRoleKey(activeRole || role)
  const currentRoleLabel = prettyLabel(currentKey)

  let allRolesLabel = currentRoleLabel
  if (Array.isArray(roles) && roles.length) {
    const normalized = Array.from(
      new Set(roles.map(normalizeRoleKey))
    )
    const labels = normalized.map(prettyLabel)
    allRolesLabel = labels.join(', ')
  }

  const backPath = isDriver ? '/driver' : isClient ? '/owner' : '/'

  return (
    <div className="px-6 md:px-10 pt-24 pb-16 flex justify-center">
      <div className="w-full max-w-xl border border-borderColor rounded-lg p-6 bg-white shadow-sm">
        <button onClick={() => navigate(backPath)} className="text-sm text-primary hover:underline mb-4 block">
          ← Back to {isDriver ? 'Driver Dashboard' : isClient ? 'Client Dashboard' : 'Home'}
        </button>
        <h1 className="text-2xl font-semibold mb-4">My Profile</h1>
        <p className="text-gray-500 mb-6">View your account information and sign out.</p>

        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <p className="text-gray-500">Name</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-gray-500">Current role</p>
            <p className="font-medium">{currentRoleLabel}</p>
          </div>
          {allRolesLabel !== currentRoleLabel && (
            <div>
              <p className="text-gray-500">All roles</p>
              <p className="font-medium">{allRolesLabel}</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dull transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile

