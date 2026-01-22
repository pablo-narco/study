import { useEffect, useState } from 'react'
import { profileAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    current_level: 'beginner',
    daily_minutes: 30,
    preferred_language: 'en',
    study_goal: '',
    focus_areas: [],
    preferred_resources: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await profileAPI.get()
      const data = response.data
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        current_level: data.study_profile?.current_level || 'beginner',
        daily_minutes: data.study_profile?.daily_minutes || 30,
        preferred_language: data.study_profile?.preferred_language || 'en',
        study_goal: data.study_profile?.study_goal || '',
        focus_areas: data.study_profile?.focus_areas || [],
        preferred_resources: data.study_profile?.preferred_resources || [],
      })
    } catch (error) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await profileAPI.update(formData)
      updateUser(response.data)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Study Preferences</h2>
              <div className="space-y-4">
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
                    Daily Available Minutes
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Language
                  </label>
                  <select
                    name="preferred_language"
                    value={formData.preferred_language}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="ru">Russian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Study Goal
                  </label>
                  <textarea
                    name="study_goal"
                    value={formData.study_goal}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., I want to learn English for IELTS 7.0"
                  />
                </div>
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
            </div>

            <div>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile
