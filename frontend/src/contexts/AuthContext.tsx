import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import { authApi } from "@/lib/api/auth"
import type { UserOut } from "@/lib/api/auth"

interface AuthContextType {
  token: string | null
  user: UserOut | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
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
        // If token is invalid, clear it
        localStorage.removeItem("token")
        setToken(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [token])

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
