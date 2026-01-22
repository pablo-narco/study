import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { plansAPI } from '../services/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

const PlanDetail = () => {
  const { id } = useParams()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    fetchPlan()
  }, [id])

  const fetchPlan = async () => {
    try {
      const response = await plansAPI.get(id)
      setPlan(response.data)
    } catch (error) {
      toast.error('Failed to load plan')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async () => {
    if (!window.confirm('This will create a new version of your plan. Continue?')) {
      return
    }

    setRegenerating(true)
    try {
      await plansAPI.regenerate(id, {})
      toast.success('Plan regenerated successfully!')
      fetchPlan()
    } catch (error) {
      toast.error('Failed to regenerate plan')
    } finally {
      setRegenerating(false)
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

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-600">Plan not found</p>
        </div>
      </div>
    )
  }

  const content = plan.latest_version?.content_json || {}

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-700">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{plan.title}</h1>
              <p className="text-gray-600">{plan.goal_text}</p>
              {plan.deadline && (
                <p className="text-sm text-gray-500 mt-2">
                  Deadline: {new Date(plan.deadline).toLocaleDateString()}
                </p>
              )}
            </div>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {regenerating ? 'Regenerating...' : 'Regenerate Plan'}
            </button>
          </div>
        </div>

        {content.weekly_roadmap && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Weekly Roadmap</h2>
            <div className="space-y-4">
              {content.weekly_roadmap.map((week, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-900">Week {week.week}</h3>
                  <p className="text-gray-600">{week.focus}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Estimated: {week.estimated_hours} hours
                  </p>
                  {week.topics && week.topics.length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-gray-700">Topics: </span>
                      <span className="text-sm text-gray-600">
                        {week.topics.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {content.daily_tasks && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Daily Tasks</h2>
            <div className="space-y-4">
              {content.daily_tasks.slice(0, 14).map((day, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Day {day.day} (Week {day.week})
                  </h3>
                  <div className="space-y-2">
                    {day.tasks?.map((task, taskIdx) => (
                      <div key={taskIdx} className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-600">{task.description}</p>
                          <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {task.type}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {task.estimated_minutes} min
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {content.topics && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Topics</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {content.topics.map((topic, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{topic.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        topic.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : topic.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {topic.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{topic.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Estimated: {topic.estimated_hours} hours
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {content.resources && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recommended Resources</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {content.resources.map((resource, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                        {resource.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {content.checkpoints && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Checkpoints</h2>
            <div className="space-y-3">
              {content.checkpoints.map((checkpoint, idx) => (
                <div key={idx} className="border-l-4 border-green-500 pl-4 py-2">
                  <h3 className="font-semibold text-gray-900">
                    Week {checkpoint.week} - {checkpoint.type}
                  </h3>
                  <p className="text-gray-600">{checkpoint.description}</p>
                  {checkpoint.topics_covered && (
                    <p className="text-sm text-gray-500 mt-1">
                      Topics: {checkpoint.topics_covered.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlanDetail
