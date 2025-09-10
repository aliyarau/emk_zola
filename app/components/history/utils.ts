import type { Chats } from "@/lib/chat-store/types"

type TimeGroup = {
  name: string
  chats: Chats[]
}

// Русские формы слов
function plural(n: number, one: string, few: string, many: string) {
  const n10 = n % 10
  const n100 = n % 100
  if (n10 === 1 && n100 !== 11) return one
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few
  return many
}

// Группировка чатов по периодам (локализовано на русский)
export function groupChatsByDate(
  chats: Chats[],
  searchQuery: string
): TimeGroup[] | null {
  if (searchQuery) return null // при поиске не группируем

  const now = new Date()
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime()
  const weekAgo = todayStart - 7 * 24 * 60 * 60 * 1000
  const monthAgo = todayStart - 30 * 24 * 60 * 60 * 1000
  const yearStart = new Date(now.getFullYear(), 0, 1).getTime()

  const todayChats: Chats[] = []
  const last7DaysChats: Chats[] = []
  const last30DaysChats: Chats[] = []
  const thisYearChats: Chats[] = []
  const olderChats: Record<number, Chats[]> = {}

  chats.forEach((chat) => {
    if (chat.project_id) return

    // если нет updated_at — считаем «сегодня»
    if (!chat.updated_at) {
      todayChats.push(chat)
      return
    }

    const ts = new Date(chat.updated_at).getTime()

    if (ts >= todayStart) {
      todayChats.push(chat)
    } else if (ts >= weekAgo) {
      last7DaysChats.push(chat)
    } else if (ts >= monthAgo) {
      last30DaysChats.push(chat)
    } else if (ts >= yearStart) {
      thisYearChats.push(chat)
    } else {
      const year = new Date(ts).getFullYear()
      if (!olderChats[year]) olderChats[year] = []
      olderChats[year].push(chat)
    }
  })

  const result: TimeGroup[] = []

  if (todayChats.length > 0) {
    result.push({ name: "Сегодня", chats: todayChats })
  }
  if (last7DaysChats.length > 0) {
    result.push({ name: "Последние 7 дней", chats: last7DaysChats })
  }
  if (last30DaysChats.length > 0) {
    result.push({ name: "Последние 30 дней", chats: last30DaysChats })
  }
  if (thisYearChats.length > 0) {
    result.push({ name: "В этом году", chats: thisYearChats })
  }

  Object.entries(olderChats)
    .sort(([a], [b]) => Number(b) - Number(a))
    .forEach(([year, yearChats]) => {
      result.push({ name: year, chats: yearChats })
    })

  return result
}

// Форматирование даты (локализовано на русский)
export function formatDate(dateString?: string | null): string {
  if (!dateString) return "Без даты"

  const date = new Date(dateString)
  const now = new Date()

  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  // < 1 мин
  if (diffMinutes < 1) return "Только что"

  // < 60 мин — минуты назад
  if (diffMinutes < 60) {
    const word = plural(diffMinutes, "минута", "минуты", "минут")
    return `${diffMinutes} ${word} назад`
  }

  // < 24 ч — часы назад
  if (diffHours < 24) {
    const word = plural(diffHours, "час", "часа", "часов")
    return `${diffHours} ${word} назад`
  }

  // < 7 дней — дни назад
  if (diffDays < 7) {
    const word = plural(diffDays, "день", "дня", "дней")
    return `${diffDays} ${word} назад`
  }

  // Текущий год — «D MMMM» (например, 5 июня)
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
  }

  // Иначе — «D MMMM YYYY»
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}
