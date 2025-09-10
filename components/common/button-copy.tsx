"use client"

import { Check, Copy } from "lucide-react"
import React, { useState } from "react"
import { TextMorph } from "../motion-primitives/text-morph"

type ButtonCopyProps = {
  code: string
}

export function ButtonCopy({ code }: ButtonCopyProps) {
  const [hasCopyLabel, setHasCopyLabel] = useState(false)

  const onCopy = () => {
    navigator.clipboard.writeText(code)
    setHasCopyLabel(true)

    setTimeout(() => {
      setHasCopyLabel(false)
    }, 1000)
  }

  return (
    <button
      onClick={onCopy}
      type="button"
      className="text-muted-foreground dark:text-primary hover:bg-muted inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1 text-xs"
    >
      {hasCopyLabel ? (
        <Check className="size-3" />
      ) : (
        <Copy className="size-3" style={{ transform: "scaleX(-1)" }} />
      )}
      <TextMorph as="span">
        {hasCopyLabel ? "Скопировано" : "Копировать код"}
      </TextMorph>
    </button>
  )
}
