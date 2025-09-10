"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { fetchClient } from "@/lib/fetch"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { usePathname, useRouter } from "next/navigation"

type Project = {
  id: string
  name: string
  user_id: string
  created_at: string
}

type DialogDeleteProjectProps = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  project: Project
}

export function DialogDeleteProject({
  isOpen,
  setIsOpen,
  project,
}: DialogDeleteProjectProps) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const pathname = usePathname()

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await fetchClient(`/api/projects/${projectId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete project")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["chats"] })
      setIsOpen(false)

      // If we're currently viewing this project, redirect to home
      if (pathname.startsWith(`/p/${project.id}`)) {
        router.push("/")
      }
    },
  })

  const handleConfirmDelete = () => {
    deleteProjectMutation.mutate(project.id)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="dark:bg-secondary">
        <DialogHeader>
          <DialogTitle>Удалить проект</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите удалить{" "}
            <span className="text-primary font-semibold">{project.name}</span>?
            Это действие нельзя отменить, и вместе с проектом будут удалены все
            связанные беседы.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            className="border-secondary rounded-full border bg-transparent shadow-none focus-visible:ring-0"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={deleteProjectMutation.isPending}
          >
            Отменить
          </Button>
          <Button
            type="button"
            className="rounded-full"
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={deleteProjectMutation.isPending}
          >
            {deleteProjectMutation.isPending ? "Удаление..." : "Удалить проект"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
