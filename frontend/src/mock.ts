import type { LeaderboardEntry, Room, RoomSpec, Submission } from './types'

export const weeklyRoomSpecs: RoomSpec[] = [
  {
    id: 'weekly-genlayer-explainer',
    title: 'Optimistic Democracy Explainer',
    prompt:
      'Explain Optimistic Democracy to a new Discord member in under 40 words.',
    rubric:
      'Reward accuracy, clarity, community tone, and a memorable explanation.',
    duration_minutes: 10,
    xp_total: 1000,
  },
  {
    id: 'builder-meme-pitch',
    title: 'Builder Meme Pitch',
    prompt:
      'Write a one-liner that turns GenLayer AI consensus into a memorable community meme.',
    rubric:
      'Reward originality, humor, GenLayer relevance, and brevity.',
    duration_minutes: 8,
    xp_total: 800,
  },
  {
    id: 'validator-judge',
    title: 'Validator Judge',
    prompt:
      'Describe one game mechanic that only works because validators can judge subjective outputs.',
    rubric:
      'Reward feasibility, creativity, and clear use of subjective AI consensus.',
    duration_minutes: 12,
    xp_total: 1200,
  },
]

export const initialRooms: Room[] = weeklyRoomSpecs.map((spec) => ({
  id: spec.id,
  title: spec.title,
  prompt: spec.prompt,
  rubric: spec.rubric,
  status: 'open',
  createdBy: 'mock://foundation',
  durationMinutes: spec.duration_minutes,
  submissions: [],
  leaderboard: [],
  reasoning: '',
  xpTotal: spec.xp_total,
}))

export function mockJudge(submissions: Submission[], xpTotal: number): {
  leaderboard: LeaderboardEntry[]
  reasoning: string
} {
  const ranked = [...submissions]
    .map((submission) => ({
      submission,
      score: Math.min(
        100,
        45 +
          Math.round(submission.answer.length / 8) +
          (submission.answer.toLowerCase().includes('consensus') ? 12 : 0) +
          (submission.answer.toLowerCase().includes('validator') ? 10 : 0),
      ),
    }))
    .sort((a, b) => b.score - a.score)

  const weights = ranked.map((_, index) => Math.max(1, ranked.length - index))
  const totalWeight = weights.reduce((sum, value) => sum + value, 0)
  let remainingXp = xpTotal
  const leaderboard = ranked.map((entry, index) => {
    const isLast = index === ranked.length - 1
    const xp = isLast
      ? remainingXp
      : Math.floor((xpTotal * weights[index]) / totalWeight)
    remainingXp -= xp
    return {
      player: entry.submission.player,
      display_name: entry.submission.display_name,
      score: entry.score,
      xp,
      reason:
        index === 0
          ? 'Strong clarity and GenLayer relevance.'
          : 'Solid contribution to the round.',
    }
  })

  return {
    leaderboard,
    reasoning: 'Mock validators ranked answers by clarity, creativity, and protocol relevance.',
  }
}

