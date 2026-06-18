import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { authApi } from '../api/auth.api'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getStoredAuthSession,
  refreshAuthSession,
} from '../api/client'
import { Role } from '../types/enums'
import type { AuthResponse, LoginRequest } from '../types/models'
import { decodeJwt, isTokenExpired } from '../utils/jwt'

interface AuthState {
  email: string | null
  roles: Role[]
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<AuthResponse>
  establishSession: (response: AuthResponse) => void
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  hasRole: (role: Role) => boolean
  isAdmin: boolean
  isWorker: boolean
  isCustomer: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readAuthFromStorage(): Pick<AuthState, 'email' | 'roles' | 'isAuthenticated'> {
  const token = getAccessToken()
  if (!token || isTokenExpired(token)) {
    return { email: null, roles: [], isAuthenticated: false }
  }
  const storedSession = getStoredAuthSession()
  if (storedSession) {
    return {
      email: storedSession.email,
      roles: storedSession.roles,
      isAuthenticated: true,
    }
  }
  const payload = decodeJwt(token)
  const roles = (payload?.roles ?? []) as Role[]
  return {
    email: payload?.sub ?? payload?.email ?? null,
    roles,
    isAuthenticated: true,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    ...readAuthFromStorage(),
    isLoading: true,
  })
  const didInitialize = useRef(false)

  const syncAuth = useCallback(() => {
    setState((prev) => ({ ...prev, ...readAuthFromStorage(), isLoading: false }))
  }, [])

  useEffect(() => {
    if (didInitialize.current) return
    didInitialize.current = true

    const initializeAuth = async () => {
      const accessToken = getAccessToken()
      const refreshToken = getRefreshToken()
      const storedSession = getStoredAuthSession()

      if (accessToken && !isTokenExpired(accessToken) && storedSession) {
        syncAuth()
        return
      }

      if (accessToken && !isTokenExpired(accessToken) && !refreshToken) {
        syncAuth()
        return
      }

      if (!refreshToken) {
        clearTokens()
        setState({ email: null, roles: [], isAuthenticated: false, isLoading: false })
        return
      }

      try {
        const response = await refreshAuthSession()
        setState({
          email: response.email,
          roles: response.roles,
          isAuthenticated: true,
          isLoading: false,
        })
      } catch {
        setState({ email: null, roles: [], isAuthenticated: false, isLoading: false })
      }
    }

    void initializeAuth()
  }, [syncAuth])

  useEffect(() => {
    const onExpired = () => {
      clearTokens()
      setState({ email: null, roles: [], isAuthenticated: false, isLoading: false })
    }
    const onRefreshed = (event: Event) => {
      const response = (event as CustomEvent<AuthResponse>).detail
      setState({
        email: response.email,
        roles: response.roles,
        isAuthenticated: true,
        isLoading: false,
      })
    }
    window.addEventListener('auth-expired', onExpired)
    window.addEventListener('auth-refreshed', onRefreshed)
    return () => {
      window.removeEventListener('auth-expired', onExpired)
      window.removeEventListener('auth-refreshed', onRefreshed)
    }
  }, [])

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authApi.login(data)
    authApi.storeAuth(response)
    setState({
      email: response.email,
      roles: response.roles,
      isAuthenticated: true,
      isLoading: false,
    })
    return response
  }, [])

  const establishSession = useCallback((response: AuthResponse) => {
    authApi.storeAuth(response)
    setState({
      email: response.email,
      roles: response.roles,
      isAuthenticated: true,
      isLoading: false,
    })
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken()
    try {
      if (refreshToken) await authApi.logout(refreshToken)
    } finally {
      authApi.clearAuth()
      setState({ email: null, roles: [], isAuthenticated: false, isLoading: false })
    }
  }, [])

  const logoutAll = useCallback(async () => {
    try {
      await authApi.logoutAll()
    } finally {
      authApi.clearAuth()
      setState({ email: null, roles: [], isAuthenticated: false, isLoading: false })
    }
  }, [])

  const hasRole = useCallback((role: Role) => state.roles.includes(role), [state.roles])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      establishSession,
      logout,
      logoutAll,
      hasRole,
      isAdmin: hasRole(Role.ADMIN),
      isWorker: hasRole(Role.WORKER),
      isCustomer: !hasRole(Role.WORKER) && !hasRole(Role.ADMIN),
    }),
    [state, login, establishSession, logout, logoutAll, hasRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
