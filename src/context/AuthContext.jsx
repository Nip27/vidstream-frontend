import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      api.get('/users/current-user')
        .then(res => {
          setUser(res.data.data)
          localStorage.setItem('user', JSON.stringify(res.data.data))
        })
        .catch(() => {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (data) => {
    try {
      const res = await api.post('/users/login', data)
      console.log('Login response:', res.data)
      const { user, accessToken } = res.data.data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      return user
    } catch (err) {
      console.error('Login error:', err.response?.data)
      throw err
    }
  }

  const register = async (formData) => {
    try {
      const res = await api.post('/users/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      console.log('Register response:', res.data)
      return res.data
    } catch (err) {
      console.error('Register error:', err.response?.data)
      throw err
    }
  }

  const logout = async () => {
    try {
      await api.post('/users/logout')
    } catch {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    setUser(null)
  }

  const updateUser = (updated) => {
    setUser(updated)
    localStorage.setItem('user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)