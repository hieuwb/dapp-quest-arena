import { useGameStore } from '../store/game'

export function Leaderboard() {
  const rooms = useGameStore((state) => state.rooms)
  const selectedRoomId = useGameStore((state) => state.selectedRoomId)
  const room = rooms.find((item) => item.id === selectedRoomId) ?? rooms[0]

  return (
    <section className="panel">
      <p className="eyebrow text-emerald-200">XP distribution</p>
      <h2 className="text-2xl font-black text-white">Arena Champions</h2>
      <div className="mt-4 space-y-2">
        {(room?.leaderboard ?? []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-cyan-300/30 bg-cyan-300/5 p-4 text-sm leading-6 text-slate-300">
            No champions yet. Fill the arena with at least two answers, then trigger
            validator judging to mint the weekly XP board.
          </div>
        ) : (
          room.leaderboard.map((entry, index) => (
            <div
              key={entry.player}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-cyan-300/30 to-amber-300/20 font-mono text-sm font-black text-white">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-black text-white">{entry.display_name}</p>
                    <p className="mt-1 text-xs text-slate-300">{entry.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-black text-cyan-200">{entry.xp} XP</p>
                  <p className="text-xs text-slate-400">{entry.score}/100</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
