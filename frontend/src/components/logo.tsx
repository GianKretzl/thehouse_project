import * as React from "react"
import Image from "next/image"
import { School } from "lucide-react"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
  showText?: boolean
}

export function Logo({ size = 200, showText = true, className, ...props }: LogoProps) {
  const [imageError, setImageError] = React.useState(false)

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`} {...props}>
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        {!imageError ? (
          <Image
            src="/thehouse-logo.png"
            alt="Gestão Educacional"
            width={size}
            height={size}
            style={{ width: 'auto', height: 'auto', maxWidth: size, maxHeight: size }}
            className="object-contain"
            priority
            onError={() => setImageError(true)}
          />
        ) : (
          <School className="text-primary" style={{ width: size * 0.7, height: size * 0.7 }} />
        )}
      </div>
    </div>
  )
}
