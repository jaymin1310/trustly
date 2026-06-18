import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import toast from 'react-hot-toast'
import type { ApiErrorResponse, AuthResponse } from '../types/models'

const API_URL = import.meta.env.VITE_API_URL ?? ''

const ACCESS_TOKEN_KEY = 'trustly_access_token'
const REFRESH_TOKEN_KEY = 'trustly_refresh_token'
const AUTH_EMAIL_KEY = 'trustly_auth_email'
const AUTH_ROLES_KEY = 'trustly_auth_roles'

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY)
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY)

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export const setAuthSession = (response: AuthResponse) => {
  setTokens(response.accessToken, response.refreshToken)
  localStorage.setItem(AUTH_EMAIL_KEY, response.email)
  localStorage.setItem(AUTH_ROLES_KEY, JSON.stringify(response.roles))
}

export const getStoredAuthSession = () => {
  const email = localStorage.getItem(AUTH_EMAIL_KEY)
  const rolesJson = localStorage.getItem(AUTH_ROLES_KEY)

  if (!email || !rolesJson) {
    return null
  }

  try {
    return {
      email,
      roles: JSON.parse(rolesJson) as AuthResponse['roles'],
    }
  } catch {
    return null
  }
}

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(AUTH_EMAIL_KEY)
  localStorage.removeItem(AUTH_ROLES_KEY)
}

let refreshPromise: Promise<AuthResponse> | null = null

export const refreshAuthSession = async () => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    clearTokens()
    window.dispatchEvent(new CustomEvent('auth-expired'))
    throw new Error('Refresh token not found')
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post<AuthResponse>(`${API_URL}/api/auth/refresh`, { refreshToken })
      .then(({ data }) => {
        setAuthSession(data)
        window.dispatchEvent(new CustomEvent<AuthResponse>('auth-refreshed', { detail: data }))
        return data
      })
      .catch((error) => {
        clearTokens()
        window.dispatchEvent(new CustomEvent('auth-expired'))
        throw error
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

const processQueue = (token: string | null) => {
  refreshQueue.forEach((cb) => cb(token))
  refreshQueue = []
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (!error.response) {
      window.dispatchEvent(new CustomEvent('network-error', { detail: true }))
      return Promise.reject(error)
    }

    const { status, data } = error.response

    if (status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = getRefreshToken()
      if (!refreshToken || originalRequest.url?.includes('/api/auth/refresh')) {
        clearTokens()
        window.dispatchEvent(new CustomEvent('auth-expired'))
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (!token) {
              reject(error)
              return
            }
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            resolve(apiClient(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const authData = await refreshAuthSession()
        processQueue(authData.accessToken)
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${authData.accessToken}`
        }
        return apiClient(originalRequest)
      } catch {
        processQueue(null)
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    if (status === 403) {
      window.dispatchEvent(new CustomEvent('forbidden-error'))
    }

    if (status === 500) {
      toast.error(data?.message ?? 'Server error', {
        id: 'server-error',
      })
    }

    return Promise.reject(error)
  },
)

export function parseFieldErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError<ApiErrorResponse>(error) && error.response?.data?.errors) {
    return error.response.data.errors
  }
  return {}
}

export function parseErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? error.message
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong'
}
