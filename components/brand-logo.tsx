import Image from "next/image"
import { cn } from "@/lib/utils"

type BrandLogoProps = {
  size?: "sm" | "md"
  textClassName?: string
  className?: string
}

const sizeClasses = {
  sm: {
    wrapper: "h-[1rem] w-[1rem]",
    text: "text-base",
  },
  md: {
    wrapper: "h-[1.35rem] w-[1.35rem]",
    text: "text-[1.35rem]",
  },
}

export function BrandLogo({
  size = "md",
  textClassName,
  className,
}: BrandLogoProps) {
  const selectedSize = sizeClasses[size]

  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap align-middle leading-none", className)}>
      <span className={cn("relative shrink-0 overflow-hidden", selectedSize.wrapper)}>
        <Image
          src="/logo.png"
          alt="JoydeAI Logo"
          fill
          priority
          className="scale-[1.32] object-contain object-center"
        />
      </span>
      <span
        className={cn(
          "font-semibold leading-none text-foreground tracking-[-0.01em]",
          selectedSize.text,
          textClassName
        )}
      >
        JoydeAI
      </span>
    </span>
  )
}
