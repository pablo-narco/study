import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {
            refresh: refreshToken,
          })

          const { access } = response.data
          localStorage.setItem('access_token', access)

          originalRequest.headers.Authorization = `Bearer ${access}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: (data) => api.post('/auth/logout', data),
  refresh: (data) => api.post('/auth/refresh', data),
}

// Profile API
export const profileAPI = {
  get: () => api.get('/profile/'),
  update: (data) => api.put('/profile/', data),
}

// Plans API
export const plansAPI = {
  list: () => api.get('/plans/'),
  get: (id) => api.get(`/plans/${id}`),
  create: (data) => api.post('/plans/', data),
  regenerate: (id, data) => api.post(`/plans/${id}/regenerate`, data),
}

// Admin API
export const adminAPI = {
  users: (params) => api.get('/admin/users', { params }),
  userDetail: (id) => api.get(`/admin/users/${id}`),
  deactivateUser: (id) => api.post(`/admin/users/${id}/deactivate`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  metrics: () => api.get('/admin/metrics'),
}

export default api
