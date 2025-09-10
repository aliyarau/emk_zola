import { createOpenAI } from "@ai-sdk/openai"
import { ModelConfig } from "../types"

// Хелпер: вернуть модель OpenAI для Vercel AI SDK
const openAIModel = (model: string, apiKey?: string) => {
  const openai = createOpenAI({
    apiKey: apiKey ?? process.env.OPENAI_API_KEY,
  })
  return openai(model)
}

const openaiModels: ModelConfig[] = [
  {
    id: "gpt-4о", // ← советую сделать id = фактическому имени модели
    name: "Auto",
    provider: "OpenAI",
    providerId: "openai",
    modelFamily: "o4",
    baseProviderId: "openai",
    description: "Решает как долго думать",
    tags: ["reasoning", "next-gen", "preview"],
    contextWindow: 200000,
    inputCost: 1.1,
    outputCost: 4.4,
    priceUnit: "per 1M tokens",
    vision: true,
    tools: true,
    audio: true,
    openSource: false,
    speed: "Medium",
    website: "https://openai.com",
    apiDocs: "https://platform.openai.com/docs/models/o4-mini",
    modelPage: "https://platform.openai.com/docs/models/o4-mini",
    icon: "openai",
    // раньше: apiSdk: (apiKey?: string) => openproviders("o4-mini", undefined, apiKey),
    apiSdk: (apiKey?: string) => openAIModel("ggpt-4о", apiKey),
  },
  {
    id: "gpt-5-mini", // ← советую сделать id = фактическому имени модели
    name: "Instant",
    provider: "OpenAI",
    providerId: "openai",
    modelFamily: "o4",
    baseProviderId: "openai",
    description: "Отвечает сразу",
    tags: ["reasoning", "next-gen", "preview"],
    contextWindow: 200000,
    inputCost: 1.1,
    outputCost: 4.4,
    priceUnit: "per 1M tokens",
    vision: true,
    tools: true,
    audio: true,
    openSource: false,
    speed: "Medium",
    website: "https://openai.com",
    apiDocs: "https://platform.openai.com/docs/models/o4-mini",
    modelPage: "https://platform.openai.com/docs/models/o4-mini",
    icon: "openai",
    // раньше: apiSdk: (apiKey?: string) => openproviders("o4-mini", undefined, apiKey),
    apiSdk: (apiKey?: string) => openAIModel("gpt-5-mini", apiKey),
  },
]

export { openaiModels }
