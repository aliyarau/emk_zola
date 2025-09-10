import { toast } from "@/components/ui/toast"
import { SupabaseClient } from "@supabase/supabase-js"
import * as fileType from "file-type"
import { DAILY_FILE_UPLOAD_LIMIT } from "./config"
import { createClient } from "./supabase/client"
import { isSupabaseEnabled } from "./supabase/config"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  // добавляй ТОЛЬКО если действительно хочешь принимать:
  // "image/heic","image/heif",
]

export type Attachment = {
  name: string
  contentType: string
  url: string
  bucket?: string
  path?: string
  size?: number
}

export async function validateFile(
  file: File
): Promise<{ isValid: boolean; mime?: string; ext?: string; error?: string }> {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
    }
  }

  const buf = await file.arrayBuffer()
  const head = Buffer.from(buf.slice(0, 4100))
  const ft = await fileType.fileTypeFromBuffer(head)

  // Если не распознали магией — падаем обратно на file.type и расширение из имени
  const fallbackExt = file.name.split(".").pop()?.toLowerCase()
  const mime = ft?.mime || file.type || ""
  const ext = ft?.ext || fallbackExt

  // Разрешаем либо распознанный mime, либо заявленный браузером, если он в белом списке
  const allowed =
    (ft?.mime && ALLOWED_FILE_TYPES.includes(ft.mime)) ||
    (file.type && ALLOWED_FILE_TYPES.includes(file.type))

  if (!allowed) {
    return {
      isValid: false,
      error: "File type not supported or doesn't match its extension",
    }
  }

  return { isValid: true, mime: mime || undefined, ext: ext || undefined }
}

export async function uploadFile(
  supabase: SupabaseClient,
  file: File,
  opts?: { mime?: string; ext?: string }
): Promise<{ bucket: string; path: string }> {
  const bucket = "chat-attachments"
  const ext = (opts?.ext || file.name.split(".").pop() || "bin").toLowerCase()
  const fileName = `${Math.random().toString(36).slice(2)}.${ext}`
  const path = `uploads/${fileName}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: opts?.mime || file.type || undefined })

  if (error) {
    throw new Error(`Error uploading file: ${error.message}`)
  }

  return { bucket, path }
}

export async function processFiles(
  files: File[],
  chatId: string,
  userId: string
): Promise<Attachment[]> {
  const supabase = isSupabaseEnabled ? createClient() : null
  const attachments: Attachment[] = []

  // считаем, что chat-attachments приватный
  const isPrivateBucket = (bucket: string) => bucket === "chat-attachments"

  for (const file of files) {
    const validation = await validateFile(file)
    if (!validation.isValid) {
      console.warn(`File ${file.name} validation failed:`, validation.error)
      toast({
        title: "File validation failed",
        description: validation.error,
        status: "error",
      })
      continue
    }

    try {
      if (!supabase) {
        // fallback для окружений без Supabase
        attachments.push({
          name: file.name,
          contentType: file.type,
          url: URL.createObjectURL(file),
          size: file.size,
        })
        continue
      }

      // 1) загружаем и получаем bucket+path
      const { bucket, path } = await uploadFile(supabase, file, {
        mime: validation.mime,
        ext: validation.ext,
      })

      // 2) получаем display-URL
      let url = ""
      if (isPrivateBucket(bucket)) {
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, 60 * 60)
        if (error) throw error
        url = data.signedUrl
      } else {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path)
        url = data.publicUrl
      }

      // 3) пишем в БД (пока оставим file_url как есть)
      const { error: dbError } = await supabase
        .from("chat_attachments")
        .insert({
          chat_id: chatId,
          user_id: userId,
          file_url: url, // ⚠️ для приватного лучше хранить path и bucket, но оставляем твой контракт
          file_name: file.name,
          file_type: validation.mime || file.type,
          file_size: file.size,
          // file_bucket: bucket,      // ← добавь поле в таблицу, если решишь хранить
          // file_path: path,          // ← стабильный ключ вместо короткоживущего URL
        })
      if (dbError)
        throw new Error(`Database insertion failed: ${dbError.message}`)

      attachments.push({
        name: file.name,
        contentType: validation.mime || file.type,
        url,
        bucket,
        path,
        size: file.size,
      })
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error)
    }
  }

  return attachments
}

export class FileUploadLimitError extends Error {
  code: string
  constructor(message: string) {
    super(message)
    this.code = "DAILY_FILE_LIMIT_REACHED"
  }
}

export async function checkFileUploadLimit(userId: string) {
  if (!isSupabaseEnabled) return 0

  const supabase = createClient()

  if (!supabase) {
    toast({
      title: "File upload is not supported in this deployment",
      status: "info",
    })
    return 0
  }

  const now = new Date()
  const startOfToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )

  const { count, error } = await supabase
    .from("chat_attachments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfToday.toISOString())

  if (error) throw new Error(error.message)
  if (count && count >= DAILY_FILE_UPLOAD_LIMIT) {
    throw new FileUploadLimitError("Daily file upload limit reached.")
  }

  return count
}
