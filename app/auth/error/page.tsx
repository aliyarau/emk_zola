"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const message =
    searchParams.get("message") || "Произошла ошибка при аутентификации."

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl">
          Ошибка входа
        </h1>

        <div className="bg-destructive/10 text-destructive mt-6 rounded-md p-3 text-sm">
          {message}
        </div>

        <div className="mt-8">
          <Button className="w-full" size="lg" asChild>
            <Link href="/auth">Попробовать снова</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <div className="bg-background relative flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
        <Suspense fallback={<div className="text-center">Загрузка...</div>}>
          <AuthErrorContent />
        </Suspense>
      </main>

      <footer className="text-muted-foreground py-6 text-center text-sm">
        <p>Если ошибка повторяется — обратитесь к администратору.</p>
      </footer>
    </div>
  )
}
