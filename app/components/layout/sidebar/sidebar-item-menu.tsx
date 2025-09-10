import { useBreakpoint } from "@/app/hooks/use-breakpoint"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useChats } from "@/lib/chat-store/chats/provider"
import { useMessages } from "@/lib/chat-store/messages/provider"
import { useChatSession } from "@/lib/chat-store/session/provider"
import { Chat } from "@/lib/chat-store/types"
import { Ellipsis, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { DialogDeleteChat } from "./dialog-delete-chat"

type SidebarItemMenuProps = {
  chat: Chat
  onStartEditing: () => void
  onMenuOpenChange?: (open: boolean) => void
}

export function SidebarItemMenu({
  chat,
  onStartEditing,
  onMenuOpenChange,
}: SidebarItemMenuProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const router = useRouter()
  const { deleteMessages } = useMessages()
  const { deleteChat } = useChats()
  const { chatId } = useChatSession()
  const isMobile = useBreakpoint(768)

  const handleConfirmDelete = async () => {
    await deleteMessages()
    await deleteChat(chat.id, chatId!, () => router.push("/"))
  }

  return (
    <>
      <DropdownMenu
        // shadcn/ui / radix pointer-events-none issue
        modal={isMobile ? true : false}
        onOpenChange={onMenuOpenChange}
      >
        <DropdownMenuTrigger asChild>
          <button
            className="flex size-7 items-center justify-center rounded-xl p-1 transition-colors duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <Ellipsis size={18} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 rounded-lg">
          <DropdownMenuItem
            className="cursor-pointer rounded-lg"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onStartEditing()
            }}
          >
            <Pencil size={16} />
            Переименовать
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive rounded-lg"
            variant="destructive"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsDeleteDialogOpen(true)
            }}
          >
            <Trash2 size={16} />
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogDeleteChat
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        chatTitle={chat.title || "Без названия"}
        onConfirmDelete={handleConfirmDelete}
      />
    </>
  )
}
