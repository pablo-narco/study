import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, profileAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user')
    const accessToken = localStorage.getItem('access_token')

    if (storedUser && accessToken) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Error parsing stored user:', e)
        localStorage.removeItem('user')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password })
      const { access, refresh } = response.data

      // Get user profile
      const profileResponse = await profileAPI.get()
      const userData = profileResponse.data

      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)
      localStorage.setItem('user', JSON.stringify(userData))

      setUser(userData)
      toast.success('Logged in successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      const { tokens, user: newUser } = response.data

      localStorage.setItem('access_token', tokens.access)
      localStorage.setItem('refresh_token', tokens.refresh)
      localStorage.setItem('user', JSON.stringify(newUser))

      setUser(newUser)
      toast.success('Account created successfully!')
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      
      // Более детальная обработка ошибок
      let message = 'Registration failed'
      
      if (error.response) {
        // Сервер ответил с ошибкой
        const data = error.response.data
        if (data.detail) {
          message = data.detail
        } else if (data.message) {
          message = data.message
        } else if (data.username) {
          message = `Username: ${Array.isArray(data.username) ? data.username[0] : data.username}`
        } else if (data.email) {
          message = `Email: ${Array.isArray(data.email) ? data.email[0] : data.email}`
        } else if (data.password) {
          message = `Password: ${Array.isArray(data.password) ? data.password[0] : data.password}`
        } else if (data.non_field_errors) {
          message = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors
        } else {
          message = JSON.stringify(data)
        }
      } else if (error.request) {
        // Запрос отправлен, но ответа нет
        message = 'Backend server is not responding. Please make sure the server is running on http://localhost:8000'
      } else {
        // Ошибка при настройке запроса
        message = error.message || 'Registration failed'
      }
      
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        await authAPI.logout({ refresh: refreshToken })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      setUser(null)
      toast.success('Logged out successfully!')
    }
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'SUPERADMIN' || user?.is_superuser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
