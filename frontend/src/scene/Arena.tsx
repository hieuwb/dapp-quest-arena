import { Clone, Text, useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import type { Group } from 'three'
import type { Room } from '../types'
import { LeaderboardPodium } from './LeaderboardPodium'
import { PlayerAvatar } from './PlayerAvatar'

const ASSET_BASE = '/assets/kenney-city-kit-roads'

function Model({
  path,
  position,
  rotation = [0, 0, 0],
  scale = 1,
}: {
  path: string
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}) {
  const gltf = useGLTF(path)
  return (
    <Clone
      object={gltf.scene as Group}
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    />
  )
}

useGLTF.preload(`${ASSET_BASE}/road-roundabout.glb`)
useGLTF.preload(`${ASSET_BASE}/road-straight.glb`)
useGLTF.preload(`${ASSET_BASE}/light-square.glb`)
useGLTF.preload(`${ASSET_BASE}/construction-cone.glb`)

export function Arena({ room }: { room: Room | null }) {
  const submissions = room?.submissions ?? []
  const slots = useMemo(() => {
    const count = Math.max(8, submissions.length)
    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2
      return {
        x: Math.cos(angle) * 4.8,
        z: Math.sin(angle) * 4.8,
        angle,
      }
    })
  }, [submissions.length])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[13, 96]} />
        <meshStandardMaterial color="#111827" roughness={0.9} />
      </mesh>

      <Model path={`${ASSET_BASE}/road-roundabout.glb`} position={[0, 0.02, 0]} scale={2.15} />
      {[-1, 1].map((side) => (
        <Model
          key={`road-${side}`}
          path={`${ASSET_BASE}/road-straight.glb`}
          position={[0, 0.01, side * 7.2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={1.7}
        />
      ))}

      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, index) => (
        <Model
          key={`lamp-${index}`}
          path={`${ASSET_BASE}/light-square.glb`}
          position={[Math.cos(angle) * 7, 0.02, Math.sin(angle) * 7]}
          rotation={[0, -angle, 0]}
          scale={1.4}
        />
      ))}

      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2
        return (
          <Model
            key={`cone-${index}`}
            path={`${ASSET_BASE}/construction-cone.glb`}
            position={[Math.cos(angle) * 6.1, 0.04, Math.sin(angle) * 6.1]}
            scale={1.2}
          />
        )
      })}

      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.4, 2.8, 1.2, 48]} />
        <meshStandardMaterial color="#243b80" emissive="#101b4d" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 1.31, 0]} castShadow>
        <cylinderGeometry args={[2.2, 2.2, 0.16, 48]} />
        <meshStandardMaterial color="#7cf7ff" emissive="#35cfff" emissiveIntensity={1.6} />
      </mesh>

      <Text
        position={[0, 2.5, -1.1]}
        rotation={[-0.25, 0, 0]}
        fontSize={0.36}
        color="#ffffff"
        maxWidth={5.2}
        textAlign="center"
        anchorX="center"
      >
        {room?.prompt ?? 'Choose a room to start Quest Arena'}
      </Text>

      {slots.map((slot, index) => (
        <PlayerAvatar
          key={`slot-${index}`}
          position={[slot.x, 0.08, slot.z]}
          rotation={[0, -slot.angle + Math.PI / 2, 0]}
          name={submissions[index]?.display_name ?? `Seat ${index + 1}`}
          active={Boolean(submissions[index])}
          rank={room?.leaderboard.findIndex((entry) => entry.player === submissions[index]?.player) ?? -1}
        />
      ))}

      <LeaderboardPodium leaderboard={room?.leaderboard ?? []} />
    </group>
  )
}
