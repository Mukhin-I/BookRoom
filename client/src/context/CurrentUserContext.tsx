import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import type { User } from '../types/api'
import { getCurrentUser } from '../api/users'

interface CurrentUserContextValue {
  currentUser: User | null
  isLoadingUser: boolean
  userError: string | null
}

const CurrentUserContext =
  createContext<CurrentUserContextValue | null>(null)

interface CurrentUserProviderProps {
  children: ReactNode
}

export function CurrentUserProvider({
  children,
}: CurrentUserProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        setIsLoadingUser(true)
        setUserError(null)

        const user = await getCurrentUser()

        setCurrentUser(user)
      } catch {
        setUserError('Не удалось загрузить пользователя')
      } finally {
        setIsLoadingUser(false)
      }
    }

    loadCurrentUser()
  }, [])

  return (
    <CurrentUserContext.Provider
      value={{
        currentUser,
        isLoadingUser,
        userError,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  )
}

export function useCurrentUser() {
  const context = useContext(CurrentUserContext)

  if (!context) {
    throw new Error(
      'useCurrentUser должен использоваться внутри CurrentUserProvider',
    )
  }

  return context
}