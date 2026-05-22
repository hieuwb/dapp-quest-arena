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
            <p className="eyebrow text-cyan-200">GenLayer weekly mini-game</p>
            <h1 className="mt-1 text-5xl font-black leading-none tracking-tight">
              Quest
              <span className="block bg-gradient-to-r from-cyan-200 via-amber-200 to-pink-200 bg-clip-text text-transparent">
                Arena
              </span>
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Step into a live 3D room, submit your answer, then watch GenLayer
              validators turn subjective judging into an XP leaderboard.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniStat label="Round" value={room ? `${room.durationMinutes}m` : '10m'} />
              <MiniStat label="Seats" value={room ? `${room.submissions.length}/20` : '0/20'} />
              <MiniStat label="Prize" value={room ? `${room.xpTotal} XP` : 'XP'} />
            </div>
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 font-mono text-sm font-black text-white">{value}</p>
    </div>
  )
}
