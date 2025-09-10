"use client"

import { useSidebar } from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { PanelLeft } from "lucide-react"

type HeaderSidebarTriggerProps = React.HTMLAttributes<HTMLButtonElement>

export function HeaderSidebarTrigger({
  className,
  ...props
}: HeaderSidebarTriggerProps) {
  const { toggleSidebar, open } = useSidebar()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={toggleSidebar}
          className={cn(
            "pointer-events-auto",
            "text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors",
            "inline-flex size-9 items-center justify-center focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
            className
          )}
          {...props}
        >
          <PanelLeft size={20} />
          <span className="sr-only">Переключить боковую панель</span>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        {open ? "Закрыть боковую панель" : "Открыть боковую панель"}
      </TooltipContent>
    </Tooltip>
  )
}
