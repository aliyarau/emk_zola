import { APP_DOMAIN } from "@/lib/config"
import type { UserProfile } from "@/lib/user/types"
import { SupabaseClient } from "@supabase/supabase-js"
import { fetchClient } from "./fetch"
import { API_ROUTE_UPDATE_CHAT_MODEL } from "./routes"
import { createClient } from "./supabase/client"

/**
 * Обновляем модель для существующего чата
 */
export async function updateChatModel(chatId: string, model: string) {
  try {
    const res = await fetchClient(API_ROUTE_UPDATE_CHAT_MODEL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, model }),
    })
    const responseData = await res.json()

    if (!res.ok) {
      throw new Error(
        responseData.error ||
          `Failed to update chat model: ${res.status} ${res.statusText}`
      )
    }

    return responseData
  } catch (error) {
    console.error("Error updating chat model:", error)
    throw error
  }
}

/**
 * Логин через Google OAuth через Supabase
 */
export async function signInWithGoogle(supabase: SupabaseClient) {
  try {
    const isDev = process.env.NODE_ENV === "development"

    // Определяем baseUrl динамически
    const baseUrl = isDev
      ? "http://localhost:3000"
      : typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_VERCEL_URL
          ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
          : APP_DOMAIN

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${baseUrl}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    })

    if (error) throw error

    return data
  } catch (err) {
    console.error("Error signing in with Google:", err)
    throw err
  }
}

export const getUserId = async (
  user: UserProfile | null
): Promise<string | null> => {
  if (user?.id) return user.id

  const supabase = createClient()

  if (!supabase) {
    console.warn("Supabase is not available in this deployment.")
    return null
  }

  const existingGuestSessionUser = await supabase.auth.getUser()
  if (
    existingGuestSessionUser.data?.user &&
    existingGuestSessionUser.data.user.is_anonymous
  ) {
  }

  try {
    const { data: anonAuthData, error: anonAuthError } =
      await supabase.auth.signInAnonymously()

    if (anonAuthError) {
      console.error("Error during anonymous sign-in:", anonAuthError)
      return null
    }

    if (!anonAuthData || !anonAuthData.user) {
      console.error("Anonymous sign-in did not return a user.")
      return null
    }

    const guestIdFromAuth = anonAuthData.user.id
    localStorage.setItem(`guestProfileAttempted_${guestIdFromAuth}`, "true")
    return guestIdFromAuth
  } catch (error) {
    console.error(
      "Error in getOrCreateGuestUserId during anonymous sign-in or profile creation:",
      error
    )
    return null
  }
}
