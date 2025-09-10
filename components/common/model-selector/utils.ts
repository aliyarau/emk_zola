import { MODEL_DEFAULT } from "@/lib/config"

const STORAGE_KEY = "selected_model_id"

export function getSelectedModelId(): string {
  if (typeof window === "undefined") return MODEL_DEFAULT
  return localStorage.getItem(STORAGE_KEY) || MODEL_DEFAULT
}

export function setSelectedModelId(id: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, id)
}
