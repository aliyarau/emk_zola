"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { fetchClient } from "@/lib/fetch"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Lightbulb } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

type DialogCreateProjectProps = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

type CreateProjectData = {
  id: string
  name: string
  user_id: string
  created_at: string
}

export function DialogCreateProject({
  isOpen,
  setIsOpen,
}: DialogCreateProjectProps) {
  const [projectName, setProjectName] = useState("")
  const queryClient = useQueryClient()
  const router = useRouter()
  const createProjectMutation = useMutation({
    mutationFn: async (name: string): Promise<CreateProjectData> => {
      const response = await fetchClient("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        throw new Error("Failed to create project")
      }

      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      router.push(`/p/${data.id}`)
      setProjectName("")
      setIsOpen(false)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (projectName.trim()) {
      createProjectMutation.mutate(projectName.trim())
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="dark:bg-secondary">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="pb-6 leading-none font-semibold">
              Новый проект
            </DialogTitle>
            <DialogDescription className="text-sm leading-none font-semibold">
              Название проекта
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 pb-4">
            <Input
              className="dark:bg-input rounded-lg border shadow-none focus-visible:ring-1"
              placeholder="Трубы бесшовные 108×4 · тендер"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              autoFocus
            />
          </div>

          {/* карточка + нижний отступ от кнопок */}
          <Card className="bg-accent mb-4 rounded-2xl border-0 py-3 shadow-none">
            <CardContent className="flex items-start gap-2 px-3 py-0">
              <div className="text-foreground/90 relative flex size-5 items-center justify-center">
                <Lightbulb className="size-4" />
              </div>
              <div className="space-y-0">
                <div className="text-xs leading-none font-semibold">
                  Что такое проект?
                </div>
                <p className="text-foreground/90 text-xs leading-snug">
                  В проектах чаты, файлы и пользовательские инструкции хранятся
                  в одном месте. Используйте их для текущей работы или просто
                  для поддержания порядка.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* кнопки: не фулл-вид на мобиле и ровно справа */}
          <DialogFooter className="mt-2 flex-row justify-end gap-2 [&>button]:w-auto [&>button]:shrink-0">
            <Button
              className="border-secondary rounded-full border bg-transparent shadow-none"
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Отменить
            </Button>
            <Button
              className="rounded-full"
              type="submit"
              disabled={!projectName.trim() || createProjectMutation.isPending}
            >
              {createProjectMutation.isPending
                ? "Создание..."
                : "Создать проект"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
