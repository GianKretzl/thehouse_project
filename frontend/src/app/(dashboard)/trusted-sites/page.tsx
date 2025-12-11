"use client"

import { useState } from "react"
import { Plus, Trash2, ExternalLink, Shield, Star, StarOff, AlertCircle, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useTrustedSites } from "@/hooks/use-trusted-sites"
import { trustedSitesApi } from "@/lib/api"
import { toast } from "sonner"

export default function TrustedSitesPage() {
  const { sites, stats, isLoading, removeSite, toggleFavorite, registerClick, refresh } = useTrustedSites()
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      const data = await trustedSitesApi.getAll({
        search: searchQuery,
        limit: 10
      })
      setSearchResults(data.items)
    } catch (error) {
      toast.error("Erro ao buscar sites")
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddFromSearch = async (siteId: number) => {
    try {
      await trustedSitesApi.addToMyList({ site_id: siteId })
      toast.success("Site adicionado à sua lista")
      setIsDialogOpen(false)
      setSearchQuery("")
      setSearchResults([])
      refresh()
    } catch (error: any) {
      toast.error(error.detail || "Erro ao adicionar site")
    }
  }

  const handleRemoveSite = async (siteId: number) => {
    await removeSite(siteId)
  }

  const handleToggleFavorite = async (siteId: number) => {
    await toggleFavorite(siteId)
  }

  const handleSiteClick = async (siteId: number, url: string) => {
    await registerClick(siteId)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "E-commerce": "bg-blue-500/10 text-blue-500 border-blue-500/20",
      "Social Media": "bg-purple-500/10 text-purple-500 border-purple-500/20",
      "Banking": "bg-green-500/10 text-green-500 border-green-500/20",
      "Government": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      "Education": "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      "Entertainment": "bg-pink-500/10 text-pink-500 border-pink-500/20",
      "News": "bg-red-500/10 text-red-500 border-red-500/20",
      "Other": "bg-gray-500/10 text-gray-500 border-gray-500/20",
    }
    return colors[category] || colors.Other
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-[300px]" />
            <Skeleton className="h-4 w-[400px]" />
          </div>
          <Skeleton className="h-10 w-[140px]" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sites Confiáveis</h1>
          <p className="text-muted-foreground">
            Gerencie sua lista de sites verificados e confiáveis
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Site
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Site Confiável</DialogTitle>
              <DialogDescription>
                Pesquise e adicione sites da nossa base de sites verificados.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Pesquise por nome ou domínio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((site) => (
                    <Card key={site.id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{site.name}</h3>
                            {site.is_verified && (
                              <Shield className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{site.url}</p>
                          {site.description && (
                            <p className="text-sm">{site.description}</p>
                          )}
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="secondary">{site.category}</Badge>
                            {site.average_rating > 0 && (
                              <Badge variant="outline">
                                ⭐ {site.average_rating.toFixed(1)}
                              </Badge>
                            )}
                            <Badge variant="outline" className="capitalize">
                              {site.seal_level}
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleAddFromSearch(site.id)}
                        >
                          Adicionar
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : searchQuery && !isSearching ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum site encontrado. Tente outro termo de busca.
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Sites
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_sites || 0}</div>
            <p className="text-xs text-muted-foreground">
              Sites na sua lista segura
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.favorite_sites || 0}</div>
            <p className="text-xs text-muted-foreground">
              Sites marcados como favoritos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verificações Totais
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_verifications || 0}</div>
            <p className="text-xs text-muted-foreground">
              Links verificados no total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meus Sites Confiáveis</CardTitle>
          <CardDescription>
            Sites que você adicionou e confia para fazer compras
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sites.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum site adicionado</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando sites confiáveis à sua lista
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Site
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Verificações</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map((userSite) => (
                  <TableRow key={userSite.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleFavorite(userSite.id)}
                      >
                        {userSite.is_favorite ? (
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        ) : (
                          <StarOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">
                      {userSite.custom_name || userSite.site.name}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleSiteClick(userSite.site_id, userSite.site.url)}
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <span className="max-w-[200px] truncate">{userSite.site.url}</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(userSite.site.category)}>
                        {userSite.site.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(userSite.added_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {userSite.verification_count}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover Site</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover <strong>{userSite.custom_name || userSite.site.name}</strong> da sua lista?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveSite(userSite.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Shield className="h-5 w-5" />
            Dica de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-200">
          <p>
            Adicione seus sites favoritos de compras aqui para acessá-los rapidamente.
            Sempre verifique se a URL está correta antes de fazer qualquer compra ou
            fornecer dados pessoais. Sites na sua lista segura são mais fáceis de
            acessar e você pode acompanhar quantas vezes os verificou.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
