import { AUTH_DAILY_MESSAGE_LIMIT } from "@/lib/config"
import { validateUserIdentity } from "@/lib/server/api"

export async function getMessageUsage(
  userId: string,
  isAuthenticated: boolean
) {
  const supabase = await validateUserIdentity(userId, isAuthenticated)
  if (!supabase) return null

  const { data, error } = await supabase
    .from("users")
    .select("daily_message_count, daily_pro_message_count")
    .eq("id", userId)
    .maybeSingle()

  if (error || !data) {
    throw new Error(error?.message || "Failed to fetch message usage")
  }

  const dailyLimit = AUTH_DAILY_MESSAGE_LIMIT

  const dailyCount = data.daily_message_count || 0

  return {
    dailyCount,
    dailyLimit,
    remaining: dailyLimit - dailyCount,
  }
}
