// app/providers/user-preferences-provider.tsx
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createContext, ReactNode, useContext } from "react"
import {
  convertFromApiFormat,
  convertToApiFormat,
  defaultPreferences,
  type UserPreferences,
} from "./utils"

export { type UserPreferences, convertFromApiFormat, convertToApiFormat }

const PREFERENCES_STORAGE_KEY = "user-preferences"

interface UserPreferencesContextType {
  preferences: UserPreferences
  setPromptSuggestions: (enabled: boolean) => void
  setShowToolInvocations: (enabled: boolean) => void
  setShowConversationPreviews: (enabled: boolean) => void
  isLoading: boolean
}

const UserPreferencesContext = createContext<
  UserPreferencesContextType | undefined
>(undefined)

async function fetchUserPreferences(): Promise<UserPreferences> {
  const response = await fetch("/api/user-preferences")
  if (!response.ok) {
    throw new Error("Failed to fetch user preferences")
  }
  const data = await response.json()
  return convertFromApiFormat(data)
}

async function updateUserPreferences(
  update: Partial<UserPreferences>
): Promise<UserPreferences> {
  const response = await fetch("/api/user-preferences", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(convertToApiFormat(update)),
  })

  if (!response.ok) {
    throw new Error("Failed to update user preferences")
  }

  const data = await response.json()
  return convertFromApiFormat(data)
}

function getLocalStoragePreferences(): UserPreferences {
  if (typeof window === "undefined") return defaultPreferences

  const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      // ignore parse errors, fall back to defaults
    }
  }

  return { ...defaultPreferences }
}

function saveToLocalStorage(preferences: UserPreferences) {
  if (typeof window === "undefined") return
  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
}

export function UserPreferencesProvider({
  children,
  userId,
  initialPreferences,
}: {
  children: ReactNode
  userId?: string
  initialPreferences?: UserPreferences
}) {
  const isAuthenticated = !!userId
  const queryClient = useQueryClient()

  const getInitialData = (): UserPreferences => {
    if (initialPreferences && isAuthenticated) return initialPreferences
    if (!isAuthenticated) return getLocalStoragePreferences()
    return defaultPreferences
  }

  const { data: preferences = getInitialData(), isLoading } =
    useQuery<UserPreferences>({
      queryKey: ["user-preferences", userId],
      queryFn: async () => {
        if (!isAuthenticated) return getLocalStoragePreferences()
        try {
          return await fetchUserPreferences()
        } catch (error) {
          console.error(
            "Failed to fetch user preferences, falling back to localStorage:",
            error
          )
          return getLocalStoragePreferences()
        }
      },
      enabled: typeof window !== "undefined",
      staleTime: 1000 * 60 * 5,
      retry: (failureCount) => isAuthenticated && failureCount < 2,
      initialData:
        initialPreferences && isAuthenticated ? getInitialData() : undefined,
    })

  const mutation = useMutation({
    mutationFn: async (update: Partial<UserPreferences>) => {
      const updated = { ...preferences, ...update }

      if (!isAuthenticated) {
        saveToLocalStorage(updated)
        return updated
      }

      try {
        return await updateUserPreferences(update)
      } catch (error) {
        console.error(
          "Failed to update user preferences in database, falling back to localStorage:",
          error
        )
        saveToLocalStorage(updated)
        return updated
      }
    },
    onMutate: async (update) => {
      const queryKey = ["user-preferences", userId]
      await queryClient.cancelQueries({ queryKey })

      const previous = queryClient.getQueryData<UserPreferences>(queryKey)
      const optimistic = { ...previous, ...update }
      queryClient.setQueryData(queryKey, optimistic)

      return { previous }
    },
    onError: (_err, _update, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["user-preferences", userId], context.previous)
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user-preferences", userId], data)
    },
  })

  const updatePreferences = mutation.mutate

  const setPromptSuggestions = (enabled: boolean) => {
    updatePreferences({ promptSuggestions: enabled })
  }

  const setShowToolInvocations = (enabled: boolean) => {
    updatePreferences({ showToolInvocations: enabled })
  }

  const setShowConversationPreviews = (enabled: boolean) => {
    updatePreferences({ showConversationPreviews: enabled })
  }

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        setPromptSuggestions,
        setShowToolInvocations,
        setShowConversationPreviews,
        isLoading,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  )
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error(
      "useUserPreferences must be used within UserPreferencesProvider"
    )
  }
  return context
}
