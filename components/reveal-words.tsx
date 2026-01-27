"use client"

import type { CSSProperties } from "react"

interface RevealWordsProps {
  text: string
  startDelay?: number
  step?: number
  className?: string
}

export function RevealWords({ text, startDelay = 0, step = 60, className }: RevealWordsProps) {
  const words = text.split(" ")
  const delayMultiplier = 1.3
  const baseDelay = Math.round(startDelay * delayMultiplier)
  const wordStep = Math.round(step * delayMultiplier)

  return (
    <span className={className}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="reveal-word"
          style={{ "--reveal-delay": `${baseDelay + index * wordStep}ms` } as CSSProperties}
        >
          {word}
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  )
}
