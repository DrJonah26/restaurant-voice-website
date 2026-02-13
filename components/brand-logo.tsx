import Image from "next/image"
import { cn } from "@/lib/utils"

type BrandLogoProps = {
  size?: "sm" | "md"
  textClassName?: string
  className?: string
}

const sizeClasses = {
  sm: {
    wrapper: "h-5 w-5",
    text: "text-base",
  },
  md: {
    wrapper: "h-6 w-6",
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
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap align-middle", className)}>
      <span className={cn("relative shrink-0 overflow-hidden", selectedSize.wrapper)}>
        <Image
          src="/logo.png"
          alt="JoydeAI Logo"
          fill
          priority
          className="scale-[1.28] object-contain object-center"
        />
      </span>
      <span
        className={cn(
          "translate-y-[0.5px] font-semibold leading-none text-foreground tracking-[-0.01em]",
          selectedSize.text,
          textClassName
        )}
      >
        JoydeAI
      </span>
    </span>
  )
}
