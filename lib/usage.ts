import { AUTH_DAILY_MESSAGE_LIMIT } from "@/lib/config"
import { SupabaseClient } from "@supabase/supabase-js"

/**
 * Checks the user's daily usage to see if they've reached their limit.
 *
 * @param supabase - Your Supabase client.
 * @param userId - The ID of the user.
 * @param trackDaily - Whether to track the daily message count (default is true)
 * @throws UsageLimitError if the daily limit is reached, or a generic Error if checking fails.
 * @returns User data including message counts and reset date
 */
export async function checkUsage(supabase: SupabaseClient, userId: string) {
  const { data: userData, error: userDataError } = await supabase
    .from("users")
    .select("message_count, daily_message_count, daily_reset, premium")
    .eq("id", userId)
    .maybeSingle()

  if (userDataError) {
    throw new Error("Error fetchClienting user data: " + userDataError.message)
  }
  if (!userData) {
    throw new Error("User record not found for id: " + userId)
  }

  // Decide which daily limit to use.
  // (Assuming these are imported from your config)
  const dailyLimit = AUTH_DAILY_MESSAGE_LIMIT

  // Reset the daily counter if the day has changed (using UTC).
  const now = new Date()
  let dailyCount = userData.daily_message_count || 0
  const lastReset = userData.daily_reset ? new Date(userData.daily_reset) : null

  const isNewDay =
    !lastReset ||
    now.getUTCFullYear() !== lastReset.getUTCFullYear() ||
    now.getUTCMonth() !== lastReset.getUTCMonth() ||
    now.getUTCDate() !== lastReset.getUTCDate()

  if (isNewDay) {
    dailyCount = 0
    const { error: resetError } = await supabase
      .from("users")
      .update({ daily_message_count: 0, daily_reset: now.toISOString() })
      .eq("id", userId)

    if (resetError) {
      throw new Error("Failed to reset daily count: " + resetError.message)
    }
  }

  // Check if the daily limit is reached.

  return {
    userData,
    dailyCount,
    dailyLimit,
  }
}

/**
 * Increments both overall and daily message counters for a user.
 *
 * @param supabase - Your Supabase client.
 * @param userId - The ID of the user.
 * @param currentCounts - Current message counts (optional, will be fetchCliented if not provided)
 * @param trackDaily - Whether to track the daily message count (default is true)
 * @throws Error if updating fails.
 */
export async function incrementUsage(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const { data: userData, error: userDataError } = await supabase
    .from("users")
    .select("message_count, daily_message_count")
    .eq("id", userId)
    .maybeSingle()

  if (userDataError || !userData) {
    throw new Error(
      "Error fetchClienting user data: " +
        (userDataError?.message || "User not found")
    )
  }

  const messageCount = userData.message_count || 0
  const dailyCount = userData.daily_message_count || 0

  // Increment both overall and daily message counts.
  const newOverallCount = messageCount + 1
  const newDailyCount = dailyCount + 1

  const { error: updateError } = await supabase
    .from("users")
    .update({
      message_count: newOverallCount,
      daily_message_count: newDailyCount,
      last_active_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (updateError) {
    throw new Error("Failed to update usage data: " + updateError.message)
  }
}

export async function checkUsageByModel(
  supabase: SupabaseClient,
  userId: string
) {
  return await checkUsage(supabase, userId)
}

export async function incrementUsageByModel(
  supabase: SupabaseClient,
  userId: string
) {
  return await incrementUsage(supabase, userId)
}
