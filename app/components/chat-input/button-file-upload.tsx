import {
  FileUpload,
  FileUploadContent,
  FileUploadTrigger,
} from "@/components/prompt-kit/file-upload"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getModelInfo } from "@/lib/models"
import { isSupabaseEnabled } from "@/lib/supabase/config"
import { cn } from "@/lib/utils"
import { FileUp, Paperclip } from "lucide-react"
import React from "react"
import { PopoverContentAuth } from "./popover-content-auth"

type ButtonFileUploadProps = {
  onFileUpload: (files: File[]) => void
  isUserAuthenticated: boolean
  model: string
}

export function ButtonFileUpload({
  onFileUpload,
  isUserAuthenticated,
  model,
}: ButtonFileUploadProps) {
  if (!isSupabaseEnabled) {
    return null
  }

  const isFileUploadAvailable = getModelInfo(model)?.vision

  if (!isFileUploadAvailable) {
    return (
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="hover:bg-accent size-9 rounded-full border-0 bg-transparent shadow-none"
                type="button"
                aria-label="Add files"
              >
                <Paperclip className="size-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Добавить фотографии и файлы</TooltipContent>
        </Tooltip>
        <PopoverContent className="p-2">
          <div className="text-secondary-foreground text-sm">
            Эта модель не поддерживает загрузку файлов.
            <br />
            Пожалуйста, выберите другую модель.
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  if (!isUserAuthenticated) {
    return (
      <Popover>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="hover:bg-accent size-9 rounded-full border-0 bg-transparent shadow-none"
                type="button"
                aria-label="Add files"
              >
                <Paperclip className="size-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Добавить фотографии и файлы</TooltipContent>
        </Tooltip>
        <PopoverContentAuth />
      </Popover>
    )
  }

  return (
    <FileUpload
      onFilesAdded={onFileUpload}
      multiple
      disabled={!isUserAuthenticated}
      accept={[
        // изображения
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".svg",

        // документы/текст
        "application/pdf",
        "text/plain",
        "text/markdown",
        "application/json",
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".pdf",
        ".txt",
        ".md",
        ".json",
        ".csv",
        ".xls",
        ".xlsx",

        // если реально нужны фото с iPhone
        // (добавляй только если добавишь их в серверную валидацию)
        // "image/heic","image/heif",
      ].join(",")}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <FileUploadTrigger asChild>
            <Button
              size="sm"
              variant="secondary"
              className={cn(
                "hover:bg-accent size-9 rounded-full border-0 bg-transparent shadow-none",
                !isUserAuthenticated && "opacity-50"
              )}
              type="button"
              disabled={!isUserAuthenticated}
              aria-label="Add files"
            >
              <Paperclip className="size-4" />
            </Button>
          </FileUploadTrigger>
        </TooltipTrigger>
        <TooltipContent>Добавить фотографии и файлы</TooltipContent>
      </Tooltip>
      <FileUploadContent>
        <div className="border-input bg-background flex flex-col items-center rounded-lg border border-dashed p-8">
          <FileUp className="text-muted-foreground size-8" />
          <span className="mt-4 mb-1 text-lg font-medium">
            Добавить что-нибудь
          </span>
          <span className="text-muted-foreground text-sm">
            Перетащите сюда любой файл, чтобы добавить его в обсуждение
          </span>
        </div>
      </FileUploadContent>
    </FileUpload>
  )
}
