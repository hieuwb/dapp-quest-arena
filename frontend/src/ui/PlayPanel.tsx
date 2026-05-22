import { useState } from 'react'
import { useGameStore } from '../store/game'

export function PlayPanel() {
  const rooms = useGameStore((state) => state.rooms)
  const selectedRoomId = useGameStore((state) => state.selectedRoomId)
  const displayName = useGameStore((state) => state.displayName)
  const setDisplayName = useGameStore((state) => state.setDisplayName)
  const submitAnswer = useGameStore((state) => state.submitAnswer)
  const finalizeSelectedRoom = useGameStore((state) => state.finalizeSelectedRoom)
  const submitting = useGameStore((state) => state.submitting)
  const finalizing = useGameStore((state) => state.finalizing)
  const [answer, setAnswer] = useState('')
  const room = rooms.find((item) => item.id === selectedRoomId) ?? rooms[0]

  if (!room) return null
  const answerIsReady = answer.trim().length >= 3
  const canFinalize = room.submissions.length >= 2 && !finalizing
  const phase =
    room.status === 'finalized'
      ? 'Leaderboard minted'
      : room.submissions.length >= 2
        ? 'Ready for validator judging'
        : 'Waiting for challengers'

  return (
    <section className="panel">
      <p className="eyebrow text-amber-200">Active challenge</p>
      <h2 className="mt-1 text-3xl font-black leading-tight text-white">{room.title}</h2>
      <div className="mt-3 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-amber-100">
            {phase}
          </span>
          <span className="font-mono text-xs font-black text-white">
            {room.submissions.length >= 2 ? 'validators online' : 'need 2 players'}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-amber-200 to-pink-300 transition-all"
            style={{ width: `${Math.min(100, (room.submissions.length / 2) * 100)}%` }}
          />
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-50">
        {room.prompt}
      </div>
      <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-slate-300">
        <span className="font-bold text-white">Rubric:</span> {room.rubric}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Metric label="Length" value={`${room.durationMinutes}m`} />
        <Metric label="Players" value={`${room.submissions.length}/20`} />
        <Metric label="XP Pool" value={`${room.xpTotal}`} />
      </div>

      {room.status !== 'finalized' ? (
        <div className="mt-5">
          <input
            className="field"
            value={displayName}
            maxLength={32}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Display name"
          />
          <textarea
            className="field mt-2 min-h-28 resize-none"
            value={answer}
            maxLength={500}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Enter your arena answer..."
          />
          <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
            <span>{answerIsReady ? 'Answer ready for validators.' : 'Write at least 3 characters.'}</span>
            <span className="font-mono">{answer.length}/500</span>
          </div>
          <button
            className="primary-button mt-3 w-full"
            disabled={submitting || !answerIsReady}
            onClick={async () => {
              await submitAnswer(answer)
              setAnswer('')
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Answer'}
          </button>
          <button
            className="ghost-button mt-2 w-full"
            disabled={!canFinalize}
            onClick={finalizeSelectedRoom}
          >
            {finalizing ? 'Validators judging...' : canFinalize ? 'Finalize Leaderboard' : 'Need 2 Answers'}
          </button>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-50">
          {room.reasoning || 'Validators finalized this room.'}
        </div>
      )}
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-mono text-lg font-black text-white">{value}</p>
    </div>
  )
}
