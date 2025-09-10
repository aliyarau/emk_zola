"use client"

import { DialogDeleteProject } from "@/app/components/layout/sidebar/dialog-delete-project"
import { useBreakpoint } from "@/app/hooks/use-breakpoint"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Ellipsis, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

type Project = {
  id: string
  name: string
  user_id: string
  created_at: string
}

type SidebarProjectMenuProps = {
  project: Project
  onStartEditing: () => void
  onMenuOpenChange?: (open: boolean) => void
}

export function SidebarProjectMenu({
  project,
  onStartEditing,
  onMenuOpenChange,
}: SidebarProjectMenuProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const isMobile = useBreakpoint(768)

  return (
    <>
      <DropdownMenu
        // shadcn/ui / radix pointer-events-none issue
        modal={isMobile ? true : false}
        onOpenChange={onMenuOpenChange}
      >
        <DropdownMenuTrigger asChild>
          <button
            className="hover:bg-secondary flex size-7 items-center justify-center rounded-md p-1 transition-colors duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <Ellipsis size={18} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            className="cursor-pointer"
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
            className="text-destructive"
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

      <DialogDeleteProject
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        project={project}
      />
    </>
  )
}
