"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CategoryCardProps {
  icon: string
  name: string
  onClick: () => void
  isActive?: boolean
}

export function CategoryCard({ icon, name, onClick, isActive }: CategoryCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all hover:scale-105 hover:shadow-lg flex-shrink-0",
        "flex flex-col items-center justify-center p-3 sm:p-4 min-w-[100px] sm:min-w-[120px] h-[90px] sm:h-[100px]",
        "border-2",
        isActive 
          ? "ring-2 ring-primary bg-primary/5 border-primary" 
          : "border-border hover:border-primary/50"
      )}
    >
      <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">{icon}</div>
      <p className="text-xs font-medium text-center line-clamp-2 w-full">{name}</p>
    </Card>
  )
}

interface CategoriesCarouselProps {
  onCategorySelect: (category: string) => void
  activeCategory?: string
}

export function CategoriesCarousel({ onCategorySelect, activeCategory }: CategoriesCarouselProps) {
  const categories = [
    { id: "all", icon: "🛍️", name: "Todos" },
    { id: "eletronicos", icon: "📱", name: "Eletrônicos" },
    { id: "informatica", icon: "💻", name: "Informática" },
    { id: "celulares", icon: "📱", name: "Celulares" },
    { id: "tv", icon: "📺", name: "TVs" },
    { id: "games", icon: "🎮", name: "Games" },
    { id: "cameras", icon: "📷", name: "Câmeras" },
    { id: "audio", icon: "🎧", name: "Áudio" },
    { id: "casa", icon: "🏠", name: "Casa" },
    { id: "moda", icon: "👕", name: "Moda" },
    { id: "esporte", icon: "⚽", name: "Esporte" },
    { id: "livros", icon: "📚", name: "Livros" },
  ]

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-hide hover:scrollbar-default">
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide:hover {
          scrollbar-width: thin;
        }
        .scrollbar-hide:hover::-webkit-scrollbar {
          display: block;
          height: 6px;
        }
        .scrollbar-hide:hover::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-hide:hover::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 3px;
        }
        .scrollbar-hide:hover::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
      <div className="flex gap-2 sm:gap-3 px-1">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            icon={category.icon}
            name={category.name}
            onClick={() => onCategorySelect(category.id === "all" ? "" : category.id)}
            isActive={activeCategory === category.id || (!activeCategory && category.id === "all")}
          />
        ))}
      </div>
    </div>
  )
}
