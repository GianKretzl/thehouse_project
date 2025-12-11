"use client"

import { useState } from "react"
import Image from "next/image"
import { Package } from "lucide-react"

interface SafeImageProps {
  src: string | null | undefined
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  fallbackClassName?: string
  sizes?: string
  priority?: boolean
}

/**
 * Componente de imagem seguro que trata erros 404 e URLs inválidas
 */
export function SafeImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = "",
  fallbackClassName = "h-20 w-20 text-muted-foreground/30",
  sizes,
  priority = false,
}: SafeImageProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  // Se não há src ou já deu erro, mostra fallback
  if (!src || error) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <Package className={fallbackClassName} />
      </div>
    )
  }

  // Verifica se a URL parece válida
  try {
    new URL(src)
  } catch {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <Package className={fallbackClassName} />
      </div>
    )
  }

  const imageProps = fill
    ? { fill: true }
    : { width: width || 400, height: height || 400 }

  return (
    <>
      <Image
        {...imageProps}
        src={src}
        alt={alt}
        className={className}
        sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
        priority={priority}
        unoptimized
        onLoadingComplete={() => setLoading(false)}
        onError={() => {
          console.warn(`Falha ao carregar imagem: ${src}`)
          setError(true)
        }}
      />
      {loading && (
        <div className="absolute inset-0 bg-muted/50 animate-pulse" />
      )}
    </>
  )
}
