"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { CommandSearch, SearchTrigger } from "@/components/command-search"
import { ModeToggle } from "@/components/mode-toggle"
// import { NotificationsBadge } from "@/components/notifications-badge" // Desabilitado: backend não tem notificações
// topbar no longer shows user — user is only in the sidebar

export function SiteHeader() {
  // no topbar user
  const [searchOpen, setSearchOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-4 py-3 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <div className="flex-1 max-w-sm">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
                          <Link
                href="/verify"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Verificar Link
              </Link>
            </Button>
            <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
              <a
                href="/faqs"
                className="dark:text-foreground"
              >
                Ajuda
              </a>
            </Button>
            <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
              <a
                href="/courses-tutorials"
                className="dark:text-foreground"
              >
                Tutoriais
              </a>
            </Button>
            {/* <NotificationsBadge /> */}
            <ModeToggle />
            {/* topbar intentionally empty for user info; sidebar contains user menu */}
          </div>
        </div>
      </header>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
