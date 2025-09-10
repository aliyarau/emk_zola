// app/api/chat/route.ts
import { Attachment } from "@ai-sdk/ui-utils"
import { Message as MessageAISDK } from "ai"
import {
  incrementMessageCount,
  logUserMessage,
  storeAssistantMessage,
  validateAndTrackUsage,
} from "./api"
import { createErrorResponse, extractErrorMessage } from "./utils"

const DIFY_API_BASE = process.env.SERVICE_API_URL || "https://api.emkai.ru"
const DIFY_CHAT_URL = `${DIFY_API_BASE}/v1/chat-messages`
const DIFY_UPLOAD_URL = `${DIFY_API_BASE}/v1/files/upload`
const DIFY_API_KEY: string | undefined =
  process.env.APP_API_KEY || process.env.DIFY_API_KEY

export const maxDuration = 60

// ── Types ─────────────────────────────────────────────────────────────
type ChatRequest = {
  messages: MessageAISDK[]
  chatId: string
  userId: string
  message_group_id?: string
}
type TextPart = { type: "text"; text: string }
type DifyFileType = "image" | "document" | "audio" | "video" | "custom"
type DifyFilePayloadItem = {
  type: DifyFileType
  transfer_method: "local_file"
  upload_file_id: string
}

// ── Helpers ───────────────────────────────────────────────────────────
const isTextPart = (p: unknown): p is TextPart =>
  typeof p === "object" &&
  p !== null &&
  (p as { type?: unknown }).type === "text" &&
  typeof (p as { text?: unknown }).text === "string"

const extractUserText = (m?: MessageAISDK): string => {
  if (!m) return ""
  const c = m.content as unknown
  if (typeof c === "string") return c
  if (Array.isArray(c))
    return c
      .filter(isTextPart)
      .map((p) => p.text)
      .join("\n\n")
  return ""
}

const mapFileType = (mime: string): DifyFileType => {
  if (!mime) return "custom"
  if (mime.startsWith("image/")) return "image"
  if (mime.startsWith("audio/")) return "audio"
  if (mime.startsWith("video/")) return "video"
  if (
    mime === "application/pdf" ||
    mime === "text/plain" ||
    mime === "text/markdown" ||
    mime === "text/csv" ||
    mime === "application/json" ||
    mime === "application/vnd.ms-excel" ||
    mime ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime === "application/msword" ||
    mime ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    mime === "application/vnd.ms-powerpoint" ||
    mime === "application/epub+zip" ||
    mime === "application/xml" ||
    mime === "text/xml" ||
    mime === "text/html"
  )
    return "document"
  return "custom"
}

const parseJson = <T>(txt: string): T | null => {
  try {
    return JSON.parse(txt) as T
  } catch {
    return null
  }
}

// ── Dify upload ───────────────────────────────────────────────────────
async function uploadFileToDifyFromUrl(
  url: string,
  filename: string,
  mime: string
): Promise<string> {
  const resp = await fetch(url)
  if (!resp.ok) {
    const body = await resp.text().catch(() => "")
    throw new Error(`[download ${url}] ${resp.status} ${body.slice(0, 200)}`)
  }
  const form = new FormData()
  form.append(
    "file",
    new Blob([await resp.arrayBuffer()], { type: mime }),
    filename
  )

  const difyRes = await fetch(DIFY_UPLOAD_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${DIFY_API_KEY}` },
    body: form,
  })

  const txt = await difyRes.text()
  if (!difyRes.ok)
    throw new Error(`[dify upload] ${difyRes.status} ${txt.slice(0, 200)}`)

  const parsed = parseJson<{ id?: string; data?: { id?: string } }>(txt)
  const id = parsed?.id ?? parsed?.data?.id
  if (!id)
    throw new Error(
      `[dify upload] Missing id in response: ${txt.slice(0, 200)}`
    )
  return id
}

// ── Handler ───────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const { messages, chatId, userId, message_group_id } =
      (await req.json()) as ChatRequest

    if (!messages || !chatId || !userId) {
      return new Response(
        JSON.stringify({ error: "Error, missing information" }),
        {
          status: 400,
        }
      )
    }
    if (!DIFY_API_KEY) {
      return new Response(
        JSON.stringify({ error: "DIFY_API_KEY(APP_API_KEY) is not set" }),
        { status: 500 }
      )
    }
    console.error("Error signing in with Google:", chatId)

    const supabase = await validateAndTrackUsage({
      userId,
      model: "dify",
      isAuthenticated: true,
    })
    if (supabase) await incrementMessageCount({ supabase, userId })

    const userMessage = messages[messages.length - 1]

    // лог + запись в БД
    if (supabase && userMessage?.role === "user") {
      await logUserMessage({
        supabase,
        userId,
        chatId,
        content: userMessage.content,
        attachments: (userMessage.experimental_attachments ??
          []) as Attachment[],
        model: "dify",
        isAuthenticated: true,
        message_group_id,
      })
    }

    // Вложения
    const rawAtt = (userMessage?.experimental_attachments ?? []) as Attachment[]

    // Загружаем в Dify
    const filesPayload: DifyFilePayloadItem[] = []
    for (const att of rawAtt) {
      const url = String(att.url ?? "")
      const name = att.name ?? "file"
      const mime = att.contentType ?? "application/octet-stream"
      if (!url || url.startsWith("blob:")) continue

      try {
        const uploadId = await uploadFileToDifyFromUrl(url, name, mime)
        filesPayload.push({
          type: mapFileType(mime),
          transfer_method: "local_file",
          upload_file_id: uploadId,
        })
      } catch (e) {
        console.warn("[skip attachment] upload failed:", name, mime, e)
      }
    }

    // conversation_id из БД (может быть null на первом сообщении)
    let conversationId: string | null = null
    if (supabase) {
      const { data: chatRow } = await supabase
        .from("chats")
        .select("conversation_id")
        .eq("id", chatId)
        .single()
      const c = chatRow as { conversation_id?: string | null } | null
      conversationId = c?.conversation_id ?? null
    }

    // Запрос в Dify Chat App
    const difyBody = {
      inputs: { uploaded_files: filesPayload },
      query: extractUserText(userMessage),
      response_mode: "blocking" as const,
      user: userId,
      ...(conversationId ? { conversation_id: conversationId } : {}),
      ...(filesPayload.length ? { files: filesPayload } : {}),
    }

    const difyRes = await fetch(DIFY_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(difyBody),
    })

    const difyText = await difyRes.text()
    if (!difyRes.ok) {
      return new Response(
        JSON.stringify({
          error:
            extractErrorMessage(difyText) || `Dify error ${difyRes.status}`,
        }),
        { status: difyRes.status }
      )
    }

    // Ответ Dify
    const parsed = parseJson<{
      answer?: string
      conversation_id?: string | null
      data?: { conversation_id?: string | null }
    }>(difyText)
    const answer = parsed?.answer ?? ""
    const difyConversationId =
      parsed?.conversation_id ?? parsed?.data?.conversation_id ?? undefined

    // ⬅️ сохраняем conversation_id ТОЛЬКО при первом сообщении
    if (supabase && !conversationId && difyConversationId) {
      const { error } = await supabase
        .from("chats")
        .update({ conversation_id: difyConversationId })
        .eq("id", chatId)
        .is("conversation_id", null)
      if (error)
        console.warn("[chats.update conversation_id] supabase error:", error)
    }

    // Сохраняем ответ ассистента
    const assistantMessage = {
      role: "assistant",
      content: [{ type: "text", text: answer }],
      id: `msg-${crypto.randomUUID()}`,
    } as import("@/app/types/api.types").Message

    if (supabase) {
      try {
        await storeAssistantMessage({
          supabase,
          chatId,
          messages: [assistantMessage],
          message_group_id,
          model: "dify",
        })
      } catch (e) {
        console.error("[storeAssistantMessage] error", e)
      }
    }

    return new Response(answer, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  } catch (err: unknown) {
    console.error("Error in /api/chat:", err)
    return createErrorResponse(
      err as { code?: string; message?: string; statusCode?: number }
    )
  }
}
