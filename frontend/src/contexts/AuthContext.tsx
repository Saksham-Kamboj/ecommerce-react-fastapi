import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react"
import { authApi } from "@/lib/api/auth"
import type { UserOut } from "@/types/auth"

interface AuthContextType {
  token: string | null
  user: UserOut | null
  isAuthError: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string) => void
  logout: () => Promise<void>
  updateUser: (updated: UserOut) => void
  loginTime: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token")
  })

  const [user, setUser] = useState<UserOut | null>(() => {
    const saved = localStorage.getItem("user")
    return saved ? JSON.parse(saved) : null
  })
  const [loginTime, setLoginTime] = useState<string | null>(() => {
    return localStorage.getItem("loginTime")
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isAuthError, setIsAuthError] = useState<string | null>(null)

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setUser(null)
        setIsLoading(false)
        return
      }

      try {
        const response = await authApi.getMe(token)
        setUser(response.data)
        localStorage.setItem("user", JSON.stringify(response.data))
      } catch (err) {
        console.error("Failed to fetch user profile:", err)
        setIsAuthError(err instanceof Error ? err.message : "Unknown error")
        // If backend returns 401 (e.g. token expired), we intentionally
        // do not clear the localStorage to keep the user "logged in" visually.
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [token])

  const login = useCallback((newToken: string) => {
    localStorage.setItem("token", newToken)
    setToken(newToken)

    const now = new Date().toISOString()
    localStorage.setItem("loginTime", now)
    setLoginTime(now)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch (err) {
      console.error("Failed to call logout API:", err)
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      localStorage.removeItem("loginTime")
      setToken(null)
      setUser(null)
      setLoginTime(null)
    }
  }, [])

  const updateUser = useCallback((updated: UserOut) => {
    setUser(updated)
    localStorage.setItem("user", JSON.stringify(updated))
  }, [])

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthError,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      logout,
      updateUser,
      loginTime,
    }),
    [token, user, isAuthError, isLoading, login, logout, updateUser, loginTime]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
