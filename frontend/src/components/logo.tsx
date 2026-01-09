"use client"

import * as React from "react"
import Image from "next/image"
import { School } from "lucide-react"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
  imageSize?: number
  showText?: boolean
}

export function Logo({ size = 200, imageSize, showText = true, className, ...props }: LogoProps) {
  const [imageError, setImageError] = React.useState(false)
  const actualImageSize = imageSize || size

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`} {...props}>
      <div className="relative shrink-0 flex items-center justify-center overflow-visible" style={{ width: size, height: size }}>
        {!imageError ? (
          <Image
            src="/thehouse-logo.png"
            alt="Gestão Educacional"
            width={actualImageSize}
            height={actualImageSize}
            style={{ width: 'auto', height: 'auto', maxWidth: actualImageSize, maxHeight: actualImageSize }}
            className="object-contain"
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          <School className="text-primary" style={{ width: actualImageSize * 0.7, height: actualImageSize * 0.7 }} />
        )}
      </div>
    </div>
  )
}
