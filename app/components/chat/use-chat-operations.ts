import type { Chats } from "@/lib/chat-store/types"
import { Message } from "@ai-sdk/react"
import { useCallback } from "react"

type UseChatOperationsProps = {
  isAuthenticated: boolean
  chatId: string | null
  messages: Message[]
  selectedModel: string
  systemPrompt: string
  createNewChat: (
    userId: string,
    title?: string,
    model?: string,
    isAuthenticated?: boolean,
    systemPrompt?: string
  ) => Promise<Chats | undefined>
  setHasDialogAuth: (value: boolean) => void
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[])
  ) => void
  setInput: (input: string) => void
}

export function useChatOperations({
  chatId,
  messages,
  selectedModel,
  systemPrompt,
  createNewChat,
  setMessages,
}: UseChatOperationsProps) {
  // Создание нового чата при первом сообщении
  const ensureChatExists = async (userId: string, input: string) => {
    if (!chatId) {
      // ← изменили условие
      const newChat = await createNewChat(
        userId,
        input,
        selectedModel,
        true,
        systemPrompt
      )
      if (!newChat) return null
      window.history.pushState(null, "", `/c/${newChat.id}`)
      return newChat.id
    }
    return chatId // если chatId уже есть – просто верните его
  }

  // Message handlers
  const handleDelete = useCallback(
    (id: string) => {
      setMessages(messages.filter((message) => message.id !== id))
    },
    [messages, setMessages]
  )

  const handleEdit = useCallback(
    (id: string, newText: string) => {
      setMessages(
        messages.map((message) =>
          message.id === id ? { ...message, content: newText } : message
        )
      )
    },
    [messages, setMessages]
  )

  return {
    ensureChatExists,
    handleDelete,
    handleEdit,
  }
}
