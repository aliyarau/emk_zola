"use client"

import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogImage,
  MorphingDialogTrigger,
} from "@/components/motion-primitives/morphing-dialog"
import {
  MessageAction,
  MessageActions,
  Message as MessageContainer,
  MessageContent,
} from "@/components/prompt-kit/message"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Message as MessageType } from "@ai-sdk/react"
import { Check, Copy, Pencil } from "lucide-react"
import Image from "next/image"
import React, { useRef, useState } from "react"

/* ------------ простая «фишка» для документов (как в инпуте) ------------ */

function extFromNameOrType(name?: string, type?: string) {
  const m = name?.match(/\.(\w+)$/)
  if (m?.[1]) return m[1].toUpperCase()
  if (type?.includes("/")) return type.split("/")[1]?.toUpperCase()
  return ""
}

function formatKB(bytes?: number) {
  if (!bytes || bytes <= 0) return ""
  const kb = bytes / 1024
  return `${kb.toFixed(2)}kB`
}

// Чип без действий/кнопок — только внешний вид как в FileItem
function DocChip({
  url,
  name,
  contentType,
  size,
}: {
  url: string
  name?: string
  contentType?: string
  size?: number
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-secondary hover:bg-accent border-input flex w-48 items-center gap-3 rounded-2xl border-0 p-2 pr-3 transition-colors"
      title={name}
    >
      <div className="bg-accent-foreground flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-md">
        <div className="text-center text-xs text-gray-400">
          {extFromNameOrType(name, contentType)}
        </div>
      </div>
      <div className="flex flex-col overflow-hidden">
        <span className="truncate text-xs font-medium">{name || "Файл"}</span>
        {size ? (
          <span className="text-xs text-gray-500">{formatKB(size)}</span>
        ) : null}
      </div>
    </a>
  )
}

/* -------------------------- компонент сообщения -------------------------- */

export type MessageUserProps = {
  hasScrollAnchor?: boolean
  attachments?: MessageType["experimental_attachments"] // { name?, url, contentType?, ... }
  children: string
  copied: boolean
  copyToClipboard: () => void
  onEdit: (id: string, newText: string) => void
  onReload: () => void
  onDelete: (id: string) => void
  id: string
  className?: string
}

export function MessageUser({
  hasScrollAnchor,
  attachments,
  children,
  copied,
  copyToClipboard,
  onEdit,
  onReload,
  id,
  className,
}: MessageUserProps) {
  const [editInput, setEditInput] = useState(children)
  const [isEditing, setIsEditing] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditInput(children)
  }

  const handleSave = () => {
    onEdit?.(id, editInput)
    onReload()
    setIsEditing(false)
  }

  return (
    <MessageContainer
      className={cn(
        "group flex w-full max-w-3xl flex-col items-end gap-0.5 px-6 pb-2",
        hasScrollAnchor && "min-h-scroll-anchor",
        className
      )}
    >
      {/* Вложения */}
      {attachments?.map((attachment, index) => (
        <div
          className="flex flex-row gap-2"
          key={`${attachment.name ?? "file"}-${index}`}
        >
          {attachment.contentType?.startsWith("image/") ? (
            /* --- изображения: превью + модалка --- */
            <MorphingDialog
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 18,
                mass: 0.3,
              }}
            >
              <MorphingDialogTrigger className="z-10">
                <Image
                  className="mb-1 w-40 rounded-md"
                  src={attachment.url}
                  alt={attachment.name || "Attachment"}
                  width={160}
                  height={120}
                />
              </MorphingDialogTrigger>

              <MorphingDialogContainer>
                <MorphingDialogContent className="relative rounded-lg">
                  <MorphingDialogImage
                    src={attachment.url}
                    alt={attachment.name || ""}
                    className="relative h-[85vh] w-[90vw] max-w-[1200px]"
                  />
                  <MorphingDialogClose className="text-primary" />
                </MorphingDialogContent>
              </MorphingDialogContainer>
            </MorphingDialog>
          ) : (
            /* --- документы и прочее: чип как в инпуте --- */
            <DocChip
              url={attachment.url}
              name={attachment.name}
              contentType={attachment.contentType}
              size={
                "size" in attachment && typeof attachment.size === "number"
                  ? attachment.size
                  : undefined
              }
            />
          )}
        </div>
      ))}

      {/* Текст сообщения / редактирование */}
      {isEditing ? (
        <div className="bg-accent w/full relative flex max-w-none flex-col gap-2 self-stretch rounded-3xl px-5 py-2.5">
          <textarea
            className="w-full resize-none bg-transparent outline-none"
            value={editInput}
            onChange={(e) => setEditInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSave()
              }
              if (e.key === "Escape") {
                handleEditCancel()
              }
            }}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleEditCancel}
              className="bg-primary-foreground rounded-full"
            >
              Отменить
            </Button>
            <Button size="sm" onClick={handleSave} className="rounded-full">
              Отправить
            </Button>
          </div>
        </div>
      ) : (
        <MessageContent
          className="bg-accent prose dark:prose-invert relative max-w-[70%] rounded-3xl px-5 py-2.5"
          markdown
          ref={contentRef}
          components={{
            code: ({ children }) => <>{children}</>,
            pre: ({ children }) => <>{children}</>,
            h1: ({ children }) => <p>{children}</p>,
            h2: ({ children }) => <p>{children}</p>,
            h3: ({ children }) => <p>{children}</p>,
            h4: ({ children }) => <p>{children}</p>,
            h5: ({ children }) => <p>{children}</p>,
            h6: ({ children }) => <p>{children}</p>,
            p: ({ children }) => <p>{children}</p>,
            li: ({ children }) => <p>- {children}</p>,
            ul: ({ children }) => <>{children}</>,
            ol: ({ children }) => <>{children}</>,
          }}
        >
          {children}
        </MessageContent>
      )}

      {/* Действия */}
      <MessageActions className="flex gap-0 opacity-0 transition-opacity duration-0 group-hover:opacity-100">
        {!isEditing && (
          <>
            <MessageAction
              tooltip={copied ? "Скопировано!" : "Копировать"}
              side="bottom"
            >
              <button
                className="hover:bg-accent/60 text-muted-foreground hover:text-foreground flex size-7.5 items-center justify-center rounded-full bg-transparent transition"
                aria-label="Copy text"
                onClick={copyToClipboard}
                type="button"
              >
                {copied ? (
                  <Check className="size-4" />
                ) : (
                  <Copy
                    className="size-4"
                    style={{ transform: "scaleX(-1)" }}
                  />
                )}
              </button>
            </MessageAction>

            <MessageAction
              tooltip="Редактировать сообщение"
              side="bottom"
              delayDuration={0}
            >
              <button
                className="hover:bg-accent/60 text-muted-foreground hover:text-foreground flex size-7.5 items-center justify-center rounded-full bg-transparent transition"
                aria-label="Edit"
                onClick={() => setIsEditing(true)}
                type="button"
              >
                <Pencil className="size-4" />
              </button>
            </MessageAction>
          </>
        )}
      </MessageActions>
    </MessageContainer>
  )
}
