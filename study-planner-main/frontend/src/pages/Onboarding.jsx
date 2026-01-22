import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { plansAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

const Onboarding = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    goal_text: '',
    deadline: '',
    current_level: user?.study_profile?.current_level || 'beginner',
    daily_minutes: user?.study_profile?.daily_minutes || 30,
    focus_areas: user?.study_profile?.focus_areas || [],
    preferred_resources: user?.study_profile?.preferred_resources || [],
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      if (name === 'focus_areas' || name === 'preferred_resources') {
        setFormData((prev) => ({
          ...prev,
          [name]: checked
            ? [...prev[name], value]
            : prev[name].filter((item) => item !== value),
        }))
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleNext = () => {
    if (step === 1 && (!formData.title || !formData.goal_text)) {
      toast.error('Please fill in all required fields')
      return
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const planData = {
        ...formData,
        deadline: formData.deadline || null,
      }
      const response = await plansAPI.create(planData)
      toast.success('Plan created successfully!')
      navigate(`/plans/${response.data.id}`)
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Create Your Study Plan</h1>
              <span className="text-gray-600">
                Step {step} of 3
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Learn English for IELTS"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Goal *
                  </label>
                  <textarea
                    name="goal_text"
                    value={formData.goal_text}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., I want to learn English for IELTS 7.0 in 3 months"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Your Level & Time</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Level
                  </label>
                  <select
                    name="current_level"
                    value={formData.current_level}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Available Time (minutes)
                  </label>
                  <input
                    type="number"
                    name="daily_minutes"
                    value={formData.daily_minutes}
                    onChange={handleChange}
                    min="1"
                    max="1440"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Focus Areas
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['speaking', 'listening', 'reading', 'writing', 'grammar', 'vocabulary'].map(
                      (area) => (
                        <label key={area} className="flex items-center">
                          <input
                            type="checkbox"
                            name="focus_areas"
                            value={area}
                            checked={formData.focus_areas.includes(area)}
                            onChange={handleChange}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700 capitalize">{area}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Resources
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['videos', 'books', 'apps', 'podcasts', 'websites'].map((resource) => (
                      <label key={resource} className="flex items-center">
                        <input
                          type="checkbox"
                          name="preferred_resources"
                          value={resource}
                          checked={formData.preferred_resources.includes(resource)}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 capitalize">{resource}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating Plan...' : 'Create Plan'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Onboarding
