"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { Info } from "lucide-react"
import { useState } from "react"
import { AppInfoTrigger } from "../components/layout/app-info/app-info-trigger"

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!supabase) {
      setError("Supabase не настроен")
      return
    }
    if (!email || !password) {
      setError("Введите e-mail и пароль")
      return
    }

    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      window.location.href = "/"
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message.includes("Invalid login credentials")) {
          setError("Неверный e-mail или пароль")
        } else {
          setError(err.message)
        }
      } else {
        setError("Произошла ошибка входа")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-background relative flex h-dvh w-full flex-col">
      {/* Кнопка-инфо теперь в фиксированном углу */}
      <div className="absolute top-4 right-4">
        <AppInfoTrigger
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-muted text-muted-foreground h-8 w-8 rounded-full shadow-sm"
              aria-label="О приложении"
            >
              <Info className="size-6" />
            </Button>
          }
        />
      </div>

      <main className="flex flex-1 flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-foreground text-3xl font-medium tracking-tight sm:text-4xl">
              Корпоративный вход
            </h1>
            <p className="text-muted-foreground mt-3">
              Введите корпоративный e-mail и пароль, чтобы войти.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail</label>
              <Input
                type="email"
                placeholder="name@emk.bz"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Пароль</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Входим..." : "Войти"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
