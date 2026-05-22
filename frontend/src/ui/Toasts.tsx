import clsx from 'clsx'
import { useGameStore } from '../store/game'

export function Toasts() {
  const toasts = useGameStore((state) => state.toasts)
  const dismissToast = useGameStore((state) => state.dismissToast)
  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          onClick={() => dismissToast(toast.id)}
          className={clsx(
            'rounded-2xl border px-4 py-3 text-left text-sm shadow-xl backdrop-blur',
            toast.kind === 'success' && 'border-emerald-300/30 bg-emerald-950/90 text-emerald-50',
            toast.kind === 'error' && 'border-rose-300/30 bg-rose-950/90 text-rose-50',
            toast.kind === 'info' && 'border-cyan-300/30 bg-slate-950/90 text-cyan-50',
          )}
        >
          {toast.message}
        </button>
      ))}
    </div>
  )
}

