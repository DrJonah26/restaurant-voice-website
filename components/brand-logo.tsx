import Image from "next/image"
import { cn } from "@/lib/utils"

type BrandLogoProps = {
  size?: "sm" | "md"
  textClassName?: string
  className?: string
}

const sizeClasses = {
  sm: {
    wrapper: "h-6 w-6",
    text: "text-lg",
  },
  md: {
    wrapper: "h-7 w-7",
    text: "text-xl",
  },
}

export function BrandLogo({
  size = "md",
  textClassName,
  className,
}: BrandLogoProps) {
  const selectedSize = sizeClasses[size]

  return (
    <span className={cn("inline-flex items-center gap-1.5 align-middle", className)}>
      <span className={cn("relative shrink-0 overflow-hidden rounded-md", selectedSize.wrapper)}>
        <Image src="/logo.png" alt="JoydeAI Logo" fill priority className="object-contain" />
      </span>
      <span
        className={cn(
          "font-semibold leading-none text-foreground tracking-tight",
          selectedSize.text,
          textClassName
        )}
      >
        JoydeAI
      </span>
    </span>
  )
}
