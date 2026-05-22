import { useGameStore } from '../store/game'

export function Leaderboard() {
  const rooms = useGameStore((state) => state.rooms)
  const selectedRoomId = useGameStore((state) => state.selectedRoomId)
  const room = rooms.find((item) => item.id === selectedRoomId) ?? rooms[0]

  return (
    <section className="panel">
      <p className="eyebrow text-emerald-200">XP distribution</p>
      <h2 className="text-2xl font-black text-white">Leaderboard</h2>
      <div className="mt-4 space-y-2">
        {(room?.leaderboard ?? []).length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            No leaderboard yet. Submit at least two answers and finalize the room.
          </div>
        ) : (
          room.leaderboard.map((entry, index) => (
            <div key={entry.player} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-black text-white">
                    #{index + 1} {entry.display_name}
                  </p>
                  <p className="mt-1 text-xs text-slate-300">{entry.reason}</p>
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

