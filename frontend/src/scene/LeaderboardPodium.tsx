import { Text } from '@react-three/drei'
import type { LeaderboardEntry } from '../types'

export function LeaderboardPodium({
  leaderboard,
}: {
  leaderboard: LeaderboardEntry[]
}) {
  const top = leaderboard.slice(0, 3)
  const positions: [number, number, number][] = [
    [0, 0, 3.3],
    [-1.35, 0, 3.45],
    [1.35, 0, 3.45],
  ]
  const heights = [1.2, 0.85, 0.65]
  return (
    <group>
      {positions.map((position, index) => (
        <group key={index} position={position}>
          <mesh position={[0, heights[index] / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.05, heights[index], 1.05]} />
            <meshStandardMaterial
              color={index === 0 ? '#ffd166' : index === 1 ? '#cbd5e1' : '#c08457'}
              roughness={0.55}
              metalness={0.1}
            />
          </mesh>
          <Text
            position={[0, heights[index] + 0.35, 0]}
            fontSize={0.22}
            color="#ffffff"
            anchorX="center"
          >
            {top[index]?.display_name ?? `#${index + 1}`}
          </Text>
          <Text
            position={[0, heights[index] + 0.08, 0]}
            fontSize={0.16}
            color="#7cf7ff"
            anchorX="center"
          >
            {top[index] ? `${top[index].xp} XP` : 'waiting'}
          </Text>
        </group>
      ))}
    </group>
  )
}

