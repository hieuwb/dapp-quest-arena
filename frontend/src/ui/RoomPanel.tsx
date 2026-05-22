import clsx from 'clsx'
import { useState } from 'react'
import { useGameStore } from '../store/game'

export function RoomPanel() {
  const rooms = useGameStore((state) => state.rooms)
  const selectedRoomId = useGameStore((state) => state.selectedRoomId)
  const selectRoom = useGameStore((state) => state.selectRoom)
  const seedRooms = useGameStore((state) => state.seedRooms)
  const createRoom = useGameStore((state) => state.createRoom)
  const seeding = useGameStore((state) => state.seeding)
  const creating = useGameStore((state) => state.creating)
  const [title, setTitle] = useState('')
  const [prompt, setPrompt] = useState('')

  return (
    <section className="panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-cyan-200">Weekly rooms</p>
          <h2 className="text-2xl font-black text-white">Community Arena</h2>
        </div>
        <button className="ghost-button" disabled={seeding} onClick={seedRooms}>
          {seeding ? 'Seeding...' : 'Seed'}
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {rooms.map((room) => (
          <button
            key={room.id}
            className={clsx('room-card', selectedRoomId === room.id && 'room-card-active')}
            onClick={() => selectRoom(room.id)}
          >
            <span className="font-bold">{room.title}</span>
            <span className="text-xs uppercase tracking-[0.18em] text-slate-300">
              {room.status} · {room.submissions.length}/20 players · {room.xpTotal} XP
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        <p className="eyebrow text-amber-200">Create quick room</p>
        <input
          className="field mt-2"
          placeholder="Room title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <textarea
          className="field mt-2 min-h-24 resize-none"
          placeholder="Challenge prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
        />
        <button
          className="primary-button mt-3 w-full"
          disabled={creating}
          onClick={async () => {
            const created = await createRoom(title, prompt)
            if (created) {
              setTitle('')
              setPrompt('')
            }
          }}
        >
          {creating ? 'Creating...' : 'Create Room'}
        </button>
      </div>
    </section>
  )
}
