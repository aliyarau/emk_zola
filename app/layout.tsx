import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ChatsProvider } from "@/lib/chat-store/chats/provider"
import { ChatSessionProvider } from "@/lib/chat-store/session/provider"
import { TanstackQueryProvider } from "@/lib/tanstack-query/tanstack-query-provider"
import { UserPreferencesProvider } from "@/lib/user-preference-store/provider"
import { UserProvider } from "@/lib/user-store/provider"
import { getUserProfile } from "@/lib/user/api"
import { ThemeProvider } from "next-themes"
import { LayoutClient } from "./layout-client"

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "ChatEMK",
  description:
    "Корпоративный ИИ-чат для сотрудников. Безопасная среда для общения, поиска информации и автоматизации рабочих процессов.",
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const userProfile = await getUserProfile()

  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <TanstackQueryProvider>
          <LayoutClient />
          <UserProvider initialUser={userProfile}>
            <ChatsProvider userId={userProfile?.id}>
              <ChatSessionProvider>
                <UserPreferencesProvider
                  userId={userProfile?.id}
                  initialPreferences={userProfile?.preferences}
                >
                  <TooltipProvider delayDuration={200} skipDelayDuration={500}>
                    <ThemeProvider
                      attribute="class"
                      defaultTheme="system"
                      enableSystem
                      disableTransitionOnChange
                    >
                      <SidebarProvider defaultOpen>
                        <Toaster position="top-center" />
                        {children}
                      </SidebarProvider>
                    </ThemeProvider>
                  </TooltipProvider>
                </UserPreferencesProvider>
              </ChatSessionProvider>
            </ChatsProvider>
          </UserProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  )
}
