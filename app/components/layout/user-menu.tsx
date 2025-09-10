"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useUser } from "@/lib/user-store/provider"
import { Globe } from "lucide-react"
import { useState } from "react"
import { AppInfoTrigger } from "./app-info/app-info-trigger"
import { FeedbackTrigger } from "./feedback/feedback-trigger"
import { SettingsTrigger } from "./settings/settings-trigger"

export function UserMenu() {
  const { user } = useUser()
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [isSettingsOpen, setSettingsOpen] = useState(false)

  if (!user) return null

  const handleSettingsOpenChange = (isOpen: boolean) => {
    setSettingsOpen(isOpen)
    if (!isOpen) setMenuOpen(false)
  }

  const label = user.display_name || user.email || "Профиль"

  return (
    // dialog внутри dropdown → modal={false}
    <DropdownMenu open={isMenuOpen} onOpenChange={setMenuOpen} modal={false}>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* ВЕСЬ РЯД — ТРИГГЕР */}
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="hover:bg-accent data-[state=open]:bg-accent focus-visible:ring-ring flex w-full items-center gap-2 rounded-md p-2 focus-visible:ring-2 focus-visible:outline-none"
              aria-label="Профиль"
            >
              <Avatar className="bg-background">
                <AvatarImage src={user.profile_image ?? undefined} />
                <AvatarFallback className="bg-accent text-accent-foreground text-xs font-bold">
                  {user.display_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="truncate text-sm">{label}</div>
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent className="rounded-md">Профиль</TooltipContent>
      </Tooltip>

      <DropdownMenuContent
        className="w-56"
        align="end"
        forceMount
        onCloseAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          if (isSettingsOpen) {
            e.preventDefault()
            return
          }
          setMenuOpen(false)
        }}
      >
        <DropdownMenuItem className="flex flex-col items-start gap-0 no-underline hover:bg-transparent focus:bg-transparent">
          <span>{user.display_name}</span>
          <span className="text-muted-foreground max-w-full truncate">
            {user.email}
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <SettingsTrigger onOpenChange={handleSettingsOpenChange} />
        <FeedbackTrigger />
        <AppInfoTrigger />
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a
            href="https://emk24.ru"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Globe className="size-4 p-0.5" />
            <span>ЕМК24</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
