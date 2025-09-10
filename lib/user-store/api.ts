// @todo: move in /lib/user/api.ts
import { toast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"
import type { UserProfile } from "@/lib/user/types"

export async function fetchUserProfile(
  id: string
): Promise<UserProfile | null> {
  const supabase = createClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) {
    console.error("Failed to fetch user:", error)
    return null
  }

  return {
    ...data,
    profile_image: data.profile_image || "",
    display_name: data.display_name || "",
  }
}

export async function updateUserProfile(
  id: string,
  updates: Partial<UserProfile>
): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) return false

  const { error } = await supabase.from("users").update(updates).eq("id", id)
  if (error) {
    console.error("Failed to update user:", error)
    return false
  }
  return true
}

export async function signOutUser(): Promise<boolean> {
  const supabase = createClient()
  if (!supabase) {
    toast({
      title: "Sign out is not supported in this deployment",
      status: "info",
    })
    return false
  }
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error("Failed to sign out:", error)
    return false
  }
  return true
}

/**
 * В корпоративной версии Realtime не используем.
 * Никаких WebSocket — просто no-op.
 */
export function subscribeToUserUpdates(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _userId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _onUpdate: (newData: Partial<UserProfile>) => void
) {
  // ничего не делаем
  return () => {}
}
