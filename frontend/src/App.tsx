import { useMemo } from 'react'
import { Scene } from './scene/Scene'
import { useGameStore } from './store/game'
import { Leaderboard } from './ui/Leaderboard'
import { PlayPanel } from './ui/PlayPanel'
import { RoomPanel } from './ui/RoomPanel'
import { Toasts } from './ui/Toasts'
import { WalletButton } from './ui/WalletButton'
import { isEnabled } from './lib/genlayer'

export default function App() {
  const rooms = useGameStore((state) => state.rooms)
  const selectedRoomId = useGameStore((state) => state.selectedRoomId)
  const room = useMemo(
    () => rooms.find((item) => item.id === selectedRoomId) ?? rooms[0] ?? null,
    [rooms, selectedRoomId],
  )

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0">
        <Scene room={room} />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/45 to-slate-950/85" />

      <div className="relative z-10 grid min-h-screen grid-cols-1 gap-4 p-4 lg:grid-cols-[23rem_minmax(0,1fr)_24rem]">
        <div className="pointer-events-auto space-y-4">
          <header className="panel">
            <p className="eyebrow text-cyan-200">GenLayer Mini-game</p>
            <h1 className="mt-1 text-4xl font-black tracking-tight">Quest Arena</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              A 3D community room game where Intelligent Contracts judge subjective
              answers and mint an XP leaderboard.
            </p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-300">
                {isEnabled() ? 'On-chain' : 'Mock mode'}
              </span>
              <WalletButton />
            </div>
          </header>
          <RoomPanel />
        </div>

        <div className="pointer-events-none hidden items-end justify-center pb-10 lg:flex">
          <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-cyan-100 backdrop-blur">
            Optimistic Democracy judging arena
          </div>
        </div>

        <div className="pointer-events-auto space-y-4">
          <PlayPanel />
          <Leaderboard />
        </div>
      </div>
      <Toasts />
    </main>
  )
}
