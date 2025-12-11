"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Filter, X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export interface ProductFilters {
  minPrice?: number
  maxPrice?: number
  inStockOnly: boolean
  verifiedStoresOnly: boolean
  freeShippingOnly: boolean
  category?: string
}

interface AdvancedFiltersProps {
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
  onApplyFilters: () => void
}

export function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  onApplyFilters 
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters)

  const handleApply = () => {
    onFiltersChange(localFilters)
    onApplyFilters()
    setIsOpen(false)
  }

  const handleClear = () => {
    const emptyFilters: ProductFilters = {
      minPrice: undefined,
      maxPrice: undefined,
      inStockOnly: false,
      verifiedStoresOnly: false,
      freeShippingOnly: false,
      category: undefined
    }
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
    onApplyFilters()
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (localFilters.minPrice) count++
    if (localFilters.maxPrice) count++
    if (localFilters.inStockOnly) count++
    if (localFilters.verifiedStoresOnly) count++
    if (localFilters.freeShippingOnly) count++
    if (localFilters.category) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge 
              className="ml-2 h-5 w-5 flex items-center justify-center p-0 rounded-full"
              variant="destructive"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtros Avançados</SheetTitle>
          <SheetDescription>
            Refine sua busca com filtros personalizados
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Preço Mínimo */}
          <div className="space-y-2">
            <Label htmlFor="minPrice">Preço Mínimo</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">R$</span>
              <Input
                id="minPrice"
                type="number"
                placeholder="0,00"
                value={localFilters.minPrice || ""}
                onChange={(e) => 
                  setLocalFilters({ 
                    ...localFilters, 
                    minPrice: e.target.value ? parseFloat(e.target.value) : undefined 
                  })
                }
              />
            </div>
          </div>

          {/* Preço Máximo */}
          <div className="space-y-2">
            <Label htmlFor="maxPrice">Preço Máximo</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">R$</span>
              <Input
                id="maxPrice"
                type="number"
                placeholder="10.000,00"
                value={localFilters.maxPrice || ""}
                onChange={(e) => 
                  setLocalFilters({ 
                    ...localFilters, 
                    maxPrice: e.target.value ? parseFloat(e.target.value) : undefined 
                  })
                }
              />
            </div>
          </div>

          {/* Faixa de Preço (Slider) */}
          {(localFilters.minPrice || localFilters.maxPrice) && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>R$ {localFilters.minPrice || 0}</span>
                <span>R$ {localFilters.maxPrice || 10000}</span>
              </div>
            </div>
          )}

          {/* Separador */}
          <div className="border-t pt-6">
            <h4 className="font-medium mb-4">Disponibilidade e Entrega</h4>
            <div className="space-y-4">
              {/* Somente em estoque */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inStock"
                  checked={localFilters.inStockOnly}
                  onCheckedChange={(checked) => 
                    setLocalFilters({ 
                      ...localFilters, 
                      inStockOnly: checked as boolean 
                    })
                  }
                />
                <Label 
                  htmlFor="inStock" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Somente produtos em estoque
                </Label>
              </div>

              {/* Frete grátis */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="freeShipping"
                  checked={localFilters.freeShippingOnly}
                  onCheckedChange={(checked) => 
                    setLocalFilters({ 
                      ...localFilters, 
                      freeShippingOnly: checked as boolean 
                    })
                  }
                />
                <Label 
                  htmlFor="freeShipping" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Frete grátis
                </Label>
              </div>
            </div>
          </div>

          {/* Separador */}
          <div className="border-t pt-6">
            <h4 className="font-medium mb-4">Segurança</h4>
            <div className="space-y-4">
              {/* Lojas verificadas */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verifiedStores"
                  checked={localFilters.verifiedStoresOnly}
                  onCheckedChange={(checked) => 
                    setLocalFilters({ 
                      ...localFilters, 
                      verifiedStoresOnly: checked as boolean 
                    })
                  }
                />
                <Label 
                  htmlFor="verifiedStores" 
                  className="text-sm font-normal cursor-pointer"
                >
                  Somente lojas verificadas pelo NetSaber
                </Label>
              </div>
            </div>
          </div>

          {/* Filtros ativos */}
          {activeFiltersCount > 0 && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Filtros Ativos ({activeFiltersCount})</h4>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleClear}
                  className="h-8"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar todos
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {localFilters.minPrice && (
                  <Badge variant="secondary">
                    Min: R$ {localFilters.minPrice}
                  </Badge>
                )}
                {localFilters.maxPrice && (
                  <Badge variant="secondary">
                    Max: R$ {localFilters.maxPrice}
                  </Badge>
                )}
                {localFilters.inStockOnly && (
                  <Badge variant="secondary">Em estoque</Badge>
                )}
                {localFilters.freeShippingOnly && (
                  <Badge variant="secondary">Frete grátis</Badge>
                )}
                {localFilters.verifiedStoresOnly && (
                  <Badge variant="secondary">Lojas verificadas</Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3 pt-6 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1"
            onClick={handleApply}
          >
            Aplicar Filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
