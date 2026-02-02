"use client"

import type { ComponentPropsWithoutRef, ElementType } from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type HtmlTag = keyof JSX.IntrinsicElements

type ScrollRevealProps<T extends HtmlTag = "section"> = {
  as?: T
  threshold?: number
  rootMargin?: string
  className?: string
  children?: React.ReactNode
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">

export function ScrollReveal<T extends HtmlTag = "section">({
  as,
  threshold = 0.2,
  rootMargin = "0px 0px -12% 0px",
  className,
  children,
  ...rest
}: ScrollRevealProps<T>) {
  const Tag = (as ?? "section") as ElementType
  const ref = useRef<HTMLElement | null>(null)
  const setRef = useCallback((node: HTMLElement | null) => {
    ref.current = node
  }, [])
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
      ref={setRef}
      className={cn("scroll-reveal", isVisible && "is-visible", className)}
      {...(rest as any)}
    >
      {children}
    </Tag>
  )
}