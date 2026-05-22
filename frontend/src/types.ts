export type RoomStatus = 'open' | 'locked' | 'finalized'

export type Submission = {
  player: string
  display_name: string
  answer: string
}

export type LeaderboardEntry = {
  player: string
  display_name: string
  score: number
  xp: number
  reason: string
}

export type Room = {
  id: string
  title: string
  prompt: string
  rubric: string
  status: RoomStatus
  createdBy: string
  durationMinutes: number
  submissions: Submission[]
  leaderboard: LeaderboardEntry[]
  reasoning: string
  xpTotal: number
}

export type RoomSpec = {
  id: string
  title: string
  prompt: string
  rubric: string
  duration_minutes: number
  xp_total: number
}

export type ToastKind = 'info' | 'success' | 'error'

export type Toast = {
  id: number
  kind: ToastKind
  message: string
}

