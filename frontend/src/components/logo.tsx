import * as React from "react"
import Image from "next/image"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
  showText?: boolean
}

export function Logo({ size = 24, showText = false, className, ...props }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`} {...props}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <Image
          src="/thehouse-logo.png"
          alt="The House Institute"
          width={size}
          height={size}
          style={{ width: 'auto', height: 'auto', maxWidth: size, maxHeight: size }}
          className="object-contain"
          priority
        />
      </div>
    </div>
  )
}
