"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
}

let toastCounter = 0
const listeners: Set<(toasts: Toast[]) => void> = new Set()
let toasts: Toast[] = []

export function toast(props: Omit<Toast, "id">) {
  const id = `toast-${++toastCounter}`
  const newToast = { ...props, id }
  toasts = [...toasts, newToast]
  listeners.forEach((listener) => listener(toasts))
  
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    listeners.forEach((listener) => listener(toasts))
  }, 5000)
  
  return id
}

export function Toaster() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([])

  useEffect(() => {
    listeners.add(setCurrentToasts)
    return () => {
      listeners.delete(setCurrentToasts)
    }
  }, [])

  const removeToast = (id: string) => {
    toasts = toasts.filter((t) => t.id !== id)
    listeners.forEach((listener) => listener(toasts))
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {currentToasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex w-full max-w-md items-center justify-between gap-4 rounded-lg border p-4 shadow-lg transition-all",
            toast.variant === "destructive"
              ? "border-red-500/50 bg-red-500/10 text-red-400"
              : toast.variant === "success"
              ? "border-green-500/50 bg-green-500/10 text-green-400"
              : "border-gray-700 bg-gray-800 text-white"
          )}
        >
          <div className="flex-1">
            {toast.title && (
              <p className="font-medium">{toast.title}</p>
            )}
            {toast.description && (
              <p className="text-sm opacity-80">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

export function useToast() {
  return { toast }
}
