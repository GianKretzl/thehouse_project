"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"
import { Rocket, ArrowRight } from "lucide-react"

export function UpgradeToProButton() {

  return (
    <div className="fixed z-50 bottom-8 right-4 md:right-6 lg:right-8 flex flex-col items-end gap-2">
      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger asChild>
          <Button
            size="lg"
            className="px-6 py-3 bg-gradient-to-br shadow-lg from-primary cursor-pointer to-primary/60 text-white font-bold"
            style={{ minWidth: 180 }} onClick={() => typeof window !== "undefined" && window.open("/pricing", "_self")}
          >
            {/* Upgrade - Disabled */}
            <Rocket size={30} className="ml-1" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="mb-3 w-90 rounded-xl shadow-2xl bg-background border border-border p-3 animate-in fade-in slide-in-from-bottom-4 relative mr-4 md:mr-6 lg:mr-8">
          <div className="flex flex-col items-center text-center gap-3">
            <h3 className="font-bold text-lg flex items-center py-2 gap-2">
              <Rocket size={18} className="text-primary" />
              Desbloqueie Recursos Premium
              <Badge variant="destructive" className="text-xs px-2 py-0.5 rounded-full shadow">Novo</Badge>
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Tenha acesso a recursos exclusivos como Padrinho Digital, verificações ilimitadas e suporte prioritário!
            </p>
            <div className="flex flex-col gap-2 w-full mt-2">
              <Button 
                className="w-full flex items-center justify-center cursor-pointer" 
                variant="default"
                onClick={() => typeof window !== "undefined" && window.open("/pricing", "_self")}
              >
                Ver Planos
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}
