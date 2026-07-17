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
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string) => void
  logout: () => void
  updateUser: (updated: UserOut) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token")
  })

  const [user, setUser] = useState<UserOut | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

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
      } catch (err) {
        console.error("Failed to fetch user profile:", err)
        localStorage.removeItem("token")
        setToken(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [token])

  const login = useCallback((newToken: string) => {
    localStorage.setItem("token", newToken)
    setToken(newToken)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((updated: UserOut) => {
    setUser(updated)
  }, [])

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      logout,
      updateUser,
    }),
    [token, user, isLoading, login, logout, updateUser]
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
