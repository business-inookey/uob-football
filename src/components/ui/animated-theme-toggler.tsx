"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

type Props = {
  className?: string
}

export const AnimatedThemeToggler = ({ className }: Props) => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = theme === "dark"

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return

    const newTheme = isDark ? "light" : "dark"

    // Check if view transitions are supported
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      await document.startViewTransition(() => {
        flushSync(() => {
          setTheme(newTheme)
        })
      }).ready

      const { top, left, width, height } =
        buttonRef.current.getBoundingClientRect()
      const x = left + width / 2
      const y = top + height / 2
      const maxRadius = Math.hypot(
        Math.max(left, window.innerWidth - left),
        Math.max(top, window.innerHeight - top)
      )

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 700,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      )
    } else {
      // Fallback for browsers without view transitions
      setTheme(newTheme)
    }
  }, [isDark, setTheme])

  if (!mounted) {
    return (
      <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-gray-50">
        <div className="w-4 h-4 bg-gray-300 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <button 
      ref={buttonRef} 
      onClick={toggleTheme} 
      className={cn(
        "inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-yellow-500" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
      )}
    </button>
  )
}
