import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { plansAPI } from '../services/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await plansAPI.list()
      setPlans(response.data.results || response.data)
    } catch (error) {
      toast.error('Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  const activePlan = plans.find((p) => p.is_active)

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <Link
            to="/onboarding"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create New Plan
          </Link>
        </div>

        {activePlan ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{activePlan.title}</h2>
                <p className="text-gray-600 mt-2">{activePlan.goal_text}</p>
              </div>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
            <div className="mt-4">
              <Link
                to={`/plans/${activePlan.id}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View Plan Details →
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center mb-8">
            <p className="text-gray-600 mb-4">You don't have an active study plan yet.</p>
            <Link
              to="/onboarding"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Create Your First Plan
            </Link>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Plan History</h2>
          {plans.length > 0 ? (
            <div className="grid gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{plan.title}</h3>
                      <p className="text-gray-600 mt-1">{plan.goal_text}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Created: {new Date(plan.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {plan.is_active && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          Active
                        </span>
                      )}
                      <Link
                        to={`/plans/${plan.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No plans yet. Create your first plan to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
