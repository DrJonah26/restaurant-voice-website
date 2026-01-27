"use client"

import type { HTMLAttributes } from "react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface ScrollRevealProps extends HTMLAttributes<HTMLElement> {
  as?: keyof JSX.IntrinsicElements
  threshold?: number
  rootMargin?: string
}

export function ScrollReveal({
  as = "section",
  threshold = 0.2,
  rootMargin = "0px 0px -12% 0px",
  className,
  children,
  ...rest
}: ScrollRevealProps) {
  const Tag = as
  const ref = useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return (
    <Tag
      ref={ref}
      className={cn("scroll-reveal", isVisible && "is-visible", className)}
      {...rest}
    >
      {children}
    </Tag>
  )
}
