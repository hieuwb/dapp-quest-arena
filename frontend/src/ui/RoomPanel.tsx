import clsx from 'clsx'
import { useState } from 'react'
import * as gl from '../lib/genlayer'
import { useGameStore } from '../store/game'

export function RoomPanel() {
  const rooms = useGameStore((state) => state.rooms)
  const selectedRoomId = useGameStore((state) => state.selectedRoomId)
  const userAddress = useGameStore((state) => state.userAddress)
  const selectRoom = useGameStore((state) => state.selectRoom)
  const seedRooms = useGameStore((state) => state.seedRooms)
  const createRoom = useGameStore((state) => state.createRoom)
  const seeding = useGameStore((state) => state.seeding)
  const creating = useGameStore((state) => state.creating)
  const [title, setTitle] = useState('')
  const [prompt, setPrompt] = useState('')
  const isOnChainMode = gl.isEnabled()
  const cleanTitle = title.trim()
  const cleanPrompt = prompt.trim()
  const titleIsValid = cleanTitle.length >= 3
  const promptIsValid = cleanPrompt.length >= 12
  const walletIsReady = !isOnChainMode || Boolean(userAddress)
  const canCreateRoom = titleIsValid && promptIsValid && walletIsReady && !creating
  const titleHelp = titleIsValid ? 'Title ready.' : 'Use at least 3 characters.'
  const promptHelp = promptIsValid ? 'Prompt ready.' : 'Use at least 12 characters.'
  const walletHelp = userAddress
    ? `Connected as ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}.`
    : 'Use the Connect Wallet button before creating an on-chain room.'

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
        {isOnChainMode && (
          <div
            className={clsx(
              'mt-3 rounded-2xl border px-3 py-2 text-sm',
              walletIsReady
                ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
                : 'border-amber-300/30 bg-amber-300/10 text-amber-100',
            )}
          >
            {walletHelp}
          </div>
        )}
        <input
          className={clsx('field mt-2', title && !titleIsValid && 'border-amber-300/50')}
          placeholder="Room title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <p className={clsx('mt-1 text-xs', titleIsValid ? 'text-emerald-200' : 'text-amber-200')}>
          {titleHelp}
        </p>
        <textarea
          className={clsx(
            'field mt-2 min-h-24 resize-none',
            prompt && !promptIsValid && 'border-amber-300/50',
          )}
          placeholder="Challenge prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
        />
        <p className={clsx('mt-1 text-xs', promptIsValid ? 'text-emerald-200' : 'text-amber-200')}>
          {promptHelp}
        </p>
        <button
          className="primary-button mt-3 w-full"
          disabled={!canCreateRoom}
          onClick={async () => {
            const created = await createRoom(title, prompt)
            if (created) {
              setTitle('')
              setPrompt('')
            }
          }}
        >
          {creating ? 'Creating...' : walletIsReady ? 'Create Room' : 'Wallet Required'}
        </button>
      </div>
    </section>
  )
}
