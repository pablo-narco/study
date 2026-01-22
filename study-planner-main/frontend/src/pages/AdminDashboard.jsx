import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI } from '../services/api'
import Navbar from '../components/Navbar'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')

  useEffect(() => {
    fetchData()
  }, [search, roleFilter, activeFilter])

  const fetchData = async () => {
    try {
      const [usersResponse, metricsResponse] = await Promise.all([
        adminAPI.users({ search, role: roleFilter || undefined, is_active: activeFilter || undefined }),
        adminAPI.metrics(),
      ])
      setUsers(usersResponse.data.results || usersResponse.data)
      setMetrics(metricsResponse.data)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) {
      return
    }
    try {
      await adminAPI.deactivateUser(userId)
      toast.success('User deactivated')
      fetchData()
    } catch (error) {
      toast.error('Failed to deactivate user')
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }
    try {
      await adminAPI.deleteUser(userId)
      toast.success('User deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete user')
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

  // Prepare chart data
  const plansChartData = metrics?.plans_by_day
    ? Object.entries(metrics.plans_by_day)
        .slice(-30)
        .map(([date, count]) => ({ date: new Date(date).toLocaleDateString(), count }))
    : []

  const usersChartData = metrics?.users_by_day
    ? Object.entries(metrics.users_by_day)
        .slice(-30)
        .map(([date, count]) => ({ date: new Date(date).toLocaleDateString(), count }))
    : []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.total_users}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.active_users}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Plans</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.total_plans}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500">Plans Today</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.plans_today}</p>
            </div>
          </div>
        )}

        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Plans Created (Last 30 Days)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={plansChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#3B82F6" name="Plans" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Users (Last 30 Days)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={usersChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10B981" name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Users</h2>
          
          <div className="mb-4 flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPERADMIN">Super Admin</option>
            </select>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plans
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/admin/users/${user.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {user.username}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.plans_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        to={`/admin/users/${user.id}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        View
                      </Link>
                      {user.is_active ? (
                        <button
                          onClick={() => handleDeactivate(user.id)}
                          className="text-yellow-600 hover:text-yellow-700"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
