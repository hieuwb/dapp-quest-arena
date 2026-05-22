import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { initialRooms, mockJudge, weeklyRoomSpecs } from '../mock'
import type { Room, RoomSpec, Toast, ToastKind } from '../types'
import * as gl from '../lib/genlayer'

type State = {
  rooms: Room[]
  selectedRoomId: string | null
  userAddress: string | null
  displayName: string
  toasts: Toast[]
  connecting: boolean
  seeding: boolean
  creating: boolean
  submitting: boolean
  finalizing: boolean
  selectRoom: (id: string) => void
  setDisplayName: (name: string) => void
  connect: () => Promise<void>
  disconnect: () => void
  seedRooms: () => Promise<void>
  createRoom: (title: string, prompt: string) => Promise<boolean>
  submitAnswer: (answer: string) => Promise<void>
  finalizeSelectedRoom: () => Promise<void>
  refreshRooms: () => Promise<void>
  syncRoom: (roomId: string) => Promise<void>
  pushToast: (kind: ToastKind, message: string) => void
  dismissToast: (id: number) => void
}

let toastCounter = 0
let roomSlugCounter = 0
const reservedRoomIds = new Set<string>()

function makeRoomSlug(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 42)

  return slug || 'room'
}

function makeUniqueRoomId(value: string, rooms: Room[]): string {
  const base = makeRoomSlug(value)
  const usedIds = new Set(rooms.map((room) => room.id))

  for (let attempt = 0; attempt < 10; attempt += 1) {
    roomSlugCounter += 1
    const suffix = `${Date.now().toString(36)}-${roomSlugCounter.toString(36)}`
    const roomId = `${base}-${suffix}`.slice(0, 64)

    if (!usedIds.has(roomId) && !reservedRoomIds.has(roomId)) {
      reservedRoomIds.add(roomId)
      return roomId
    }
  }

  throw new Error('Could not create a unique room id.')
}

function shortHash(hash: string): string {
  return `${hash.slice(0, 10)}...`
}

function upsertRoom(rooms: Room[], room: Room): Room[] {
  const exists = rooms.some((item) => item.id === room.id)
  if (!exists) return [room, ...rooms]
  return rooms.map((item) => (item.id === room.id ? room : item))
}

function roomFromSpec(spec: RoomSpec, createdBy: string): Room {
  return {
    id: spec.id,
    title: spec.title,
    prompt: spec.prompt,
    rubric: spec.rubric,
    status: 'open',
    createdBy,
    durationMinutes: spec.duration_minutes,
    submissions: [],
    leaderboard: [],
    reasoning: '',
    xpTotal: spec.xp_total,
  }
}

function getSelectedRoom(state: State): Room | null {
  return state.rooms.find((room) => room.id === state.selectedRoomId) ?? null
}

export const useGameStore = create<State>()(
  persist(
    (set, get) => ({
      rooms: initialRooms,
      selectedRoomId: initialRooms[0]?.id ?? null,
      userAddress: null,
      displayName: 'Builder',
      toasts: [],
      connecting: false,
      seeding: false,
      creating: false,
      submitting: false,
      finalizing: false,

      selectRoom: (id) => set({ selectedRoomId: id }),
      setDisplayName: (displayName) => set({ displayName }),

      connect: async () => {
        if (get().connecting) return
        set({ connecting: true })
        try {
          const address = await gl.connectWallet()
          set({ userAddress: address })
          get().pushToast('success', `Connected ${address.slice(0, 6)}...${address.slice(-4)}`)
          if (gl.isEnabled()) await get().refreshRooms()
          else get().pushToast('info', 'Mock mode: VITE_CONTRACT_ADDRESS is not set.')
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          get().pushToast('error', `Connect failed: ${message.slice(0, 100)}`)
        } finally {
          set({ connecting: false })
        }
      },

      disconnect: () => {
        gl.disconnectWallet()
        set({ userAddress: null })
        get().pushToast('info', 'Wallet disconnected.')
      },

      seedRooms: async () => {
        if (get().seeding) return
        set({ seeding: true })
        try {
          if (gl.isEnabled()) {
            if (!get().userAddress) {
              get().pushToast('error', 'Connect wallet first.')
              return
            }
            get().pushToast('info', 'Seeding weekly rooms on-chain...')
            const hash = await gl.seedRooms(weeklyRoomSpecs)
            get().pushToast('success', `Seed confirmed ${shortHash(hash)}`)
            await get().refreshRooms()
          } else {
            set({ rooms: initialRooms, selectedRoomId: initialRooms[0]?.id ?? null })
            get().pushToast('success', 'Weekly rooms reset in mock mode.')
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          get().pushToast('error', `Seed failed: ${message.slice(0, 100)}`)
        } finally {
          set({ seeding: false })
        }
      },

      createRoom: async (title, prompt) => {
        const cleanTitle = title.trim()
        const cleanPrompt = prompt.trim()
        if (cleanTitle.length < 3 || cleanPrompt.length < 12) {
          get().pushToast('error', 'Room title needs 3+ characters and prompt needs 12+ characters.')
          return false
        }
        if (get().creating) return false
        if (gl.isEnabled() && !get().userAddress) {
          get().pushToast('error', 'Connect your wallet before creating an on-chain room.')
          return false
        }

        let roomId = ''
        try {
          roomId = makeUniqueRoomId(cleanTitle, get().rooms)
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          get().pushToast('error', message)
          return false
        }

        set({ creating: true })
        const spec: RoomSpec = {
          id: roomId,
          title: cleanTitle,
          prompt: cleanPrompt,
          rubric:
            'Reward accuracy, clarity, creativity, community usefulness, and GenLayer relevance.',
          duration_minutes: 10,
          xp_total: 1000,
        }
        let transactionSucceeded = false
        try {
          if (gl.isEnabled()) {
            const hash = await gl.createRoom(spec)
            transactionSucceeded = true
            get().pushToast('success', `Room created ${shortHash(hash)}`)
            let room: Room | null = null
            try {
              room = await gl.getRoom(spec.id)
            } catch {
              get().pushToast('info', 'Room confirmed; syncing read-back may take a moment.')
            }
            const confirmedRoom =
              room ?? roomFromSpec(spec, get().userAddress ?? gl.getUserAddress() ?? 'on-chain')
            set((state) => ({
              rooms: upsertRoom(state.rooms, confirmedRoom),
              selectedRoomId: confirmedRoom.id,
            }))
            return true
          } else {
            const room = roomFromSpec(spec, get().userAddress ?? 'mock://host')
            set((state) => ({
              rooms: [room, ...state.rooms],
              selectedRoomId: room.id,
            }))
            get().pushToast('success', 'Room created in mock mode.')
            return true
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          get().pushToast('error', `Create failed: ${message.slice(0, 100)}`)
          return false
        } finally {
          if (!transactionSucceeded && !get().rooms.some((room) => room.id === roomId)) {
            reservedRoomIds.delete(roomId)
          }
          set({ creating: false })
        }
      },

      submitAnswer: async (answer) => {
        const room = getSelectedRoom(get())
        if (!room) return
        const cleanAnswer = answer.trim()
        const cleanName = get().displayName.trim() || 'Builder'
        if (cleanAnswer.length < 3) {
          get().pushToast('error', 'Answer is too short.')
          return
        }
        if (get().submitting) return
        set({ submitting: true })
        try {
          if (gl.isEnabled()) {
            if (!get().userAddress) {
              get().pushToast('error', 'Connect wallet first.')
              return
            }
            const hash = await gl.submitAnswer(room.id, cleanName, cleanAnswer)
            get().pushToast('success', `Answer submitted ${shortHash(hash)}`)
            await get().syncRoom(room.id)
          } else {
            const player = get().userAddress ?? `mock://${cleanName.toLowerCase()}`
            set((state) => ({
              rooms: state.rooms.map((item) =>
                item.id === room.id
                  ? {
                      ...item,
                      submissions: [
                        ...item.submissions.filter((sub) => sub.player !== player),
                        {
                          player,
                          display_name: cleanName,
                          answer: cleanAnswer,
                        },
                      ],
                    }
                  : item,
              ),
            }))
            get().pushToast('success', 'Answer submitted in mock mode.')
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          get().pushToast('error', `Submit failed: ${message.slice(0, 100)}`)
        } finally {
          set({ submitting: false })
        }
      },

      finalizeSelectedRoom: async () => {
        const room = getSelectedRoom(get())
        if (!room) return
        if (room.submissions.length < 2) {
          get().pushToast('error', 'Need at least two submissions.')
          return
        }
        if (get().finalizing) return
        set({ finalizing: true })
        try {
          if (gl.isEnabled()) {
            if (!get().userAddress) {
              get().pushToast('error', 'Connect wallet first.')
              return
            }
            get().pushToast('info', 'Validators are judging the round...')
            const hash = await gl.finalizeRoom(room.id)
            get().pushToast('success', `Finalized ${shortHash(hash)}`)
            await get().syncRoom(room.id)
          } else {
            await new Promise((resolve) => window.setTimeout(resolve, 900))
            const result = mockJudge(room.submissions, room.xpTotal)
            set((state) => ({
              rooms: state.rooms.map((item) =>
                item.id === room.id
                  ? {
                      ...item,
                      status: 'finalized',
                      leaderboard: result.leaderboard,
                      reasoning: result.reasoning,
                    }
                  : item,
              ),
            }))
            get().pushToast('success', 'Mock validators finalized the leaderboard.')
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          get().pushToast('error', `Finalize failed: ${message.slice(0, 100)}`)
        } finally {
          set({ finalizing: false })
        }
      },

      refreshRooms: async () => {
        if (!gl.isEnabled() || !gl.getUserAddress()) return
        try {
          const rooms = await gl.listRooms()
          if (rooms.length === 0) return
          set((state) => ({
            rooms,
            selectedRoomId:
              state.selectedRoomId && rooms.some((room) => room.id === state.selectedRoomId)
                ? state.selectedRoomId
                : rooms[0]?.id ?? null,
          }))
        } catch {
          get().pushToast('error', 'Could not load rooms from contract.')
        }
      },

      syncRoom: async (roomId) => {
        if (!gl.isEnabled() || !gl.getUserAddress()) return
        try {
          const room = await gl.getRoom(roomId)
          if (!room) return
          set((state) => ({
            rooms: upsertRoom(state.rooms, room),
            selectedRoomId: room.id,
          }))
        } catch {
          get().pushToast('error', 'Could not sync room from contract.')
        }
      },

      pushToast: (kind, message) => {
        const id = ++toastCounter
        set((state) => ({ toasts: [...state.toasts, { id, kind, message }] }))
        window.setTimeout(() => get().dismissToast(id), 4200)
      },

      dismissToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
    }),
    {
      name: 'quest-arena-store',
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as Partial<State>
        return {
          selectedRoomId: state.selectedRoomId ?? initialRooms[0]?.id ?? null,
          displayName: state.displayName ?? 'Builder',
        }
      },
      partialize: (state) => ({
        selectedRoomId: state.selectedRoomId,
        displayName: state.displayName,
      }),
    },
  ),
)
