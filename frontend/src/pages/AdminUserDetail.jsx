import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { adminAPI } from '../services/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

const AdminUserDetail = () => {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [id])

  const fetchUser = async () => {
    try {
      const response = await adminAPI.userDetail(id)
      setUser(response.data)
    } catch (error) {
      toast.error('Failed to load user')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-600">User not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/admin" className="text-blue-600 hover:text-blue-700">
            ← Back to Admin Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">User Details</h1>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Username</dt>
                  <dd className="text-sm text-gray-900">{user.username}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900">
                    {user.first_name} {user.last_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="text-sm text-gray-900">{user.role}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Joined</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(user.date_joined).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                  <dd className="text-sm text-gray-900">
                    {user.last_login
                      ? new Date(user.last_login).toLocaleString()
                      : 'Never'}
                  </dd>
                </div>
              </dl>
            </div>

            {user.study_profile && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Study Profile</h2>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Current Level</dt>
                    <dd className="text-sm text-gray-900 capitalize">
                      {user.study_profile.current_level}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Daily Minutes</dt>
                    <dd className="text-sm text-gray-900">
                      {user.study_profile.daily_minutes} minutes
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Preferred Language</dt>
                    <dd className="text-sm text-gray-900 uppercase">
                      {user.study_profile.preferred_language}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Study Goal</dt>
                    <dd className="text-sm text-gray-900">
                      {user.study_profile.study_goal || 'Not set'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Focus Areas</dt>
                    <dd className="text-sm text-gray-900">
                      {user.study_profile.focus_areas?.join(', ') || 'None'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Preferred Resources</dt>
                    <dd className="text-sm text-gray-900">
                      {user.study_profile.preferred_resources?.join(', ') || 'None'}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Study Plans</h2>
          {user.plans && user.plans.length > 0 ? (
            <div className="space-y-4">
              {user.plans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{plan.goal_text}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Created: {new Date(plan.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Versions: {plan.versions_count}
                      </p>
                      {plan.latest_version && (
                        <p className="text-xs text-gray-500">
                          Model: {plan.latest_version.model_used}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {plan.is_active && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No plans created yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminUserDetail
