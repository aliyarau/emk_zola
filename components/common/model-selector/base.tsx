"use client"

import { PopoverContentAuth } from "@/app/components/chat-input/popover-content-auth"
import { useKeyShortcut } from "@/app/hooks/use-key-shortcut"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverTrigger } from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { MODEL_DEFAULT } from "@/lib/config"
import { MODELS } from "@/lib/models"
import { cn } from "@/lib/utils"
import { CaretDownIcon } from "@phosphor-icons/react"
import { useEffect, useState } from "react"

export type ModelSelectorProps = {
  selectedModelId: string
  setSelectedModelId: (model: string) => void
  isUserAuthenticated: boolean
  className?: string
}

const STORAGE_KEY = "selected_model_id"

export function ModelSelector({
  className,
  isUserAuthenticated = true,
}: ModelSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedModelId, setSelectedModelId] = useState<string>(MODEL_DEFAULT)

  // при монтировании подтягиваем localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved && MODELS.find((m) => m.id === saved)) {
        setSelectedModelId(saved)
      }
    } catch {
      // ignore
    }
  }, [])

  const currentModel = MODELS.find((m) => m.id === selectedModelId)

  // хоткей ⌘⇧P
  useKeyShortcut(
    (e) => (e.key === "p" || e.key === "P") && e.metaKey && e.shiftKey,
    () => setIsDropdownOpen((p) => !p)
  )

  const handleSelect = (id: string) => {
    setSelectedModelId(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      // ignore
    }
    setIsDropdownOpen(false)
  }

  const trigger = (
    <Button
      variant="outline"
      type="button"
      className={cn(
        "dark:bg-secondary hover:bg-accent justify-between border-0 shadow-none",
        className
      )}
      aria-label="Выбор модели"
    >
      <span className="truncate">
        {currentModel ? currentModel.name : "Выбрать модель"}
      </span>
      <CaretDownIcon className="size-4 opacity-50" />
    </Button>
  )

  // неавторизованным — поповер авторизации
  if (!isUserAuthenticated) {
    return (
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Выбор модели</TooltipContent>
        </Tooltip>
        <PopoverContentAuth />
      </Popover>
    )
  }

  return (
    <Tooltip>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Сменить модель ⌘⇧P</TooltipContent>

        <DropdownMenuContent
          align="start"
          side="top"
          sideOffset={4}
          forceMount
          className="max-h-[320px] w-[300px] overflow-y-auto rounded-2xl border p-1 shadow-lg"
        >
          {MODELS.map((model) => (
            <DropdownMenuItem
              key={model.id}
              className={cn(
                "flex w-full items-start px-3 py-2",
                "rounded-lg data-[highlighted]:rounded-xl"
              )}
              onSelect={() => handleSelect(model.id)}
            >
              <div className="flex min-w-0 flex-col">
                <span
                  className="truncate text-sm font-medium"
                  title={model.name}
                >
                  {model.name}
                </span>

                {model.description && (
                  <span
                    className="text-muted-foreground truncate text-xs leading-tight"
                    title={model.description}
                  >
                    {model.description}
                  </span>
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </Tooltip>
  )
}
