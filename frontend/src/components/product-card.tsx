"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Shield, ExternalLink, TrendingDown, HelpCircle } from "lucide-react"
import { Product } from "@/lib/api"
import { FavoriteButton } from "@/components/favorite-button"
import { SafeImage } from "@/components/safe-image"

interface ProductCardIfoodStyleProps {
  product: Product
  onVerifyClick: (url: string) => void
  onProductClick: (product: Product) => void
  onExplainClick?: (product: Product) => void
}

export function ProductCardIfoodStyle({ 
  product, 
  onVerifyClick, 
  onProductClick,
  onExplainClick
}: ProductCardIfoodStyleProps) {
  const lowestOffer = product.offers.reduce((prev, current) => 
    prev.price < current.price ? prev : current
  )
  
  const hasDiscount = lowestOffer.discount && lowestOffer.discount > 0

  return (
    <Card 
      className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full"
      onClick={() => onProductClick(product)}
    >
      {/* Imagem do Produto */}
      <div className="relative h-40 sm:h-48 bg-gradient-to-br from-muted/30 to-muted/50 overflow-hidden flex-shrink-0">
        <SafeImage
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-4 group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Botão de Favoritar - Topo Esquerdo */}
        <div className="absolute top-2 left-2 z-10">
          <FavoriteButton
            product={product}
            className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-md"
          />
        </div>
        
        {/* Badge de Desconto - Meio Esquerda */}
        {hasDiscount && (
          <Badge 
            className="absolute top-14 left-2 bg-red-500 hover:bg-red-600 text-white font-bold text-sm px-3 py-1"
          >
            <TrendingDown className="h-3 w-3 mr-1" />
            -{lowestOffer.discount}%
          </Badge>
        )}
        
        {/* Badge de Loja Verificada */}
        {lowestOffer.is_trusted && (
          <Badge 
            className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white text-xs"
          >
            <Shield className="h-3 w-3 mr-1" />
            Verificada
          </Badge>
        )}
        
        {/* Indicador de Múltiplas Ofertas */}
        {product.offers.length > 1 && (
          <Badge 
            variant="secondary"
            className="absolute bottom-2 right-2 text-xs"
          >
            {product.offers.length} lojas
          </Badge>
        )}
      </div>

      <CardContent className="p-3 sm:p-4 flex flex-col flex-1">
        {/* Nome do Produto */}
        <h3 className="font-semibold text-sm line-clamp-2 mb-2 h-10 group-hover:text-primary transition-colors break-words">
          {product.name}
        </h3>

        {/* Marca e Avaliação */}
        <div className="flex items-center gap-2 mb-2 overflow-hidden">
          {product.brand && (
            <>
              <span className="text-xs text-muted-foreground truncate max-w-[100px]">{product.brand}</span>
              {product.rating && <span className="text-xs text-muted-foreground flex-shrink-0">•</span>}
            </>
          )}
          {product.rating && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{product.rating}</span>
            </div>
          )}
        </div>

        {/* Preços */}
        <div className="mb-2 flex-1 flex flex-col justify-center">
          {lowestOffer.original_price && lowestOffer.original_price > lowestOffer.price && (
            <div className="text-xs text-muted-foreground line-through">
              R$ {lowestOffer.original_price.toFixed(2)}
            </div>
          )}
          
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-green-600">
              R$ {product.lowest_price.toFixed(2)}
            </span>
          </div>
          
          {lowestOffer.installments && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {lowestOffer.installments}
            </p>
          )}
        </div>

        {/* Loja com Melhor Preço e Botão de Ajuda */}
        <div className="text-xs text-muted-foreground mb-2 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 min-w-0 overflow-hidden">
            <span className="whitespace-nowrap">Melhor:</span>
            <span className="font-medium text-foreground truncate">{lowestOffer.store_name}</span>
          </div>
          {onExplainClick && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 flex-shrink-0 -mr-1"
              onClick={(e) => {
                e.stopPropagation()
                onExplainClick(product)
              }}
              title="Explicação simples"
            >
              <HelpCircle className="h-4 w-4 text-blue-500 hover:text-blue-600" />
            </Button>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs h-8"
            onClick={(e) => {
              e.stopPropagation()
              onVerifyClick(lowestOffer.store_url)
            }}
          >
            <Shield className="h-3 w-3 mr-1" />
            Verificar
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700 text-xs h-8"
            onClick={(e) => {
              e.stopPropagation()
              window.open(lowestOffer.product_url, '_blank')
            }}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Comprar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
