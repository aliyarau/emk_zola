"use client"

import { Switch } from "@/components/ui/switch"
import { useUserPreferences } from "@/lib/user-preference-store/provider"

export function InteractionPreferences() {
  const {
    preferences,
    setPromptSuggestions,
    setShowToolInvocations,
    setShowConversationPreviews,
  } = useUserPreferences()

  return (
    <div className="space-y-6 pb-12">
      {/* Prompt Suggestions */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Предложения промтов</h3>
            <p className="text-muted-foreground text-xs">
              Показывать готовые подсказки при начале нового диалога
            </p>
          </div>
          <Switch
            checked={preferences.promptSuggestions}
            onCheckedChange={setPromptSuggestions}
            className="data-[state=checked]:!bg-blue-600 data-[state=unchecked]:!bg-gray-300 dark:data-[state=checked]:!bg-blue-600 dark:data-[state=unchecked]:!bg-gray-300 [&_[data-slot='switch-thumb']]:!bg-white"
          />
        </div>
      </div>
      {/* Tool Invocations */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Вызовы инструментов</h3>
            <p className="text-muted-foreground text-xs">
              Показывать детали выполнения инструментов в диалоге
            </p>
          </div>
          <Switch
            checked={preferences.showToolInvocations}
            onCheckedChange={setShowToolInvocations}
            className="data-[state=checked]:!bg-blue-600 data-[state=unchecked]:!bg-gray-300 dark:data-[state=checked]:!bg-blue-600 dark:data-[state=unchecked]:!bg-gray-300 [&_[data-slot='switch-thumb']]:!bg-white"
          />
        </div>
      </div>
      {/* Conversation Previews */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">Предпросмотр диалогов</h3>
            <p className="text-muted-foreground text-xs">
              Показывать предпросмотр диалогов в истории
            </p>
          </div>
          <Switch
            checked={preferences.showConversationPreviews}
            onCheckedChange={setShowConversationPreviews}
            className="data-[state=checked]:!bg-blue-600 data-[state=unchecked]:!bg-gray-300 dark:data-[state=checked]:!bg-blue-600 dark:data-[state=unchecked]:!bg-gray-300 [&_[data-slot='switch-thumb']]:!bg-white"
          />
        </div>
      </div>
    </div>
  )
}
