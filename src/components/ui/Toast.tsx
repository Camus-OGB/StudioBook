'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { cn } from '@/lib/utils'

// Système de notifications « toast » : retour visuel immédiat sur chaque action
// (création, confirmation, suppression…). Un seul pattern réutilisé partout
// via le hook useToast(), conformément au principe de cohérence des composants.

type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  notify: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast doit être utilisé à l’intérieur d’un <ToastProvider>')
  }
  return ctx
}

// Compteur au niveau module : identifiants uniques sans dépendre de Date.now().
let counter = 0

const STYLES: Record<ToastVariant, { wrap: string; icon: string }> = {
  success: { wrap: 'border-emerald-200 bg-emerald-50 text-emerald-800', icon: '✓' },
  error: { wrap: 'border-rose-200 bg-rose-50 text-rose-800', icon: '✕' },
  info: { wrap: 'border-ima-line bg-white text-ima-ink', icon: 'ℹ' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      counter += 1
      const id = counter
      setToasts((prev) => [...prev, { id, message, variant }])
      setTimeout(() => remove(id), 3800)
    },
    [remove],
  )

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end">
        {toasts.map((t) => {
          const s = STYLES[t.variant]
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                'animate-ima-up pointer-events-auto flex w-full max-w-[360px] items-start gap-2.5 rounded-xl border px-4 py-3 text-[13.5px] font-medium shadow-[0_8px_28px_rgba(40,20,80,0.12)]',
                s.wrap,
              )}
            >
              <span className="mt-0.5 font-bold">{s.icon}</span>
              <span className="flex-1 leading-snug">{t.message}</span>
              <button
                type="button"
                onClick={() => remove(t.id)}
                aria-label="Fermer la notification"
                className="text-lg leading-none opacity-50 transition hover:opacity-100"
              >
                ×
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
