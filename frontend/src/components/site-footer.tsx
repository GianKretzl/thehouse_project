import { GraduationCap } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="px-4 py-6 lg:px-6">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <GraduationCap className="h-4 w-4 fill-primary/20 text-primary" />
            <span className="font-medium text-foreground">
              The House Platform - Gestão Educacional
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 The House Platform. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
