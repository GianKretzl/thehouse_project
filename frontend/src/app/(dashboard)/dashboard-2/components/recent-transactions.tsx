"use client"

import { Eye, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const transactions = [
  {
    id: "VER-001",
    customer: {
      name: "magazineluiza.com.br",
      email: "Loja de eletrônicos",
      avatar: "/avatars/01.png",
    },
    amount: "Seguro",
    status: "completed",
    date: "Há 2 horas",
  },
  {
    id: "VER-002",
    customer: {
      name: "oferta-urgente-xyz.com",
      email: "Site suspeito bloqueado",
      avatar: "/avatars/02.png",
    },
    amount: "Bloqueado",
    status: "failed",
    date: "Há 5 horas",
  },
  {
    id: "VER-003",
    customer: {
      name: "mercadolivre.com.br",
      email: "Marketplace confiável",
      avatar: "/avatars/03.png",
    },
    amount: "Seguro",
    status: "completed",
    date: "Há 1 dia",
  },
  {
    id: "VER-004",
    customer: {
      name: "desconto-imperdivel.site",
      email: "Ameaça identificada",
      avatar: "/avatars/04.png",
    },
    amount: "Bloqueado",
    status: "failed",
    date: "Há 2 dias",
  },
  {
    id: "VER-005",
    customer: {
      name: "americanas.com.br",
      email: "Loja verificada",
      avatar: "/avatars/05.png",
    },
    amount: "Seguro",
    status: "completed",
    date: "Há 3 dias",
  },
]

export function RecentTransactions() {
  return (
    <Card className="cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Verificações Recentes</CardTitle>
          <CardDescription>Últimos links verificados</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="cursor-pointer">
          <Eye className="h-4 w-4 mr-2" />
          Ver Todos
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} >
            <div className="flex p-3 rounded-lg border gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={transaction.customer.avatar} alt={transaction.customer.name} />
                <AvatarFallback>{transaction.customer.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div className="flex flex-1 items-center flex-wrap justify-between gap-1">
                <div className="flex items-center space-x-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{transaction.customer.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{transaction.customer.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge
                    variant={
                      transaction.status === "completed" ? "default" :
                      transaction.status === "pending" ? "secondary" : "destructive"
                    }
                    className="cursor-pointer"
                  >
                    {transaction.status === "completed" ? "Seguro" : "Bloqueado"}
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm font-medium">{transaction.amount}</p>
                    <p className="text-xs text-muted-foreground">{transaction.date}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="cursor-pointer">Ver Detalhes</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">Adicionar aos Confiáveis</DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">Reportar Problema</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
