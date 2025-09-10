"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type DialogDeleteChatProps = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  chatTitle: string
  onConfirmDelete: () => Promise<void>
}

export function DialogDeleteChat({
  isOpen,
  setIsOpen,
  chatTitle,
  onConfirmDelete,
}: DialogDeleteChatProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="dark:bg-secondary">
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить чат?</AlertDialogTitle>
          <AlertDialogDescription>
            Это удалит{" "}
            <span className="text-primary font-semibold">{chatTitle}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-secondary rounded-full border bg-transparent shadow-none focus-visible:ring-0">
            Отменить
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              setIsOpen(false)
              await onConfirmDelete()
            }}
            className="rounded-full focus-visible:ring-0"
          >
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
