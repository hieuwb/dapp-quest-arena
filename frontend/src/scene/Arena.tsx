import { Clone, Text, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Mesh } from 'three'
import type { Group } from 'three'
import type { Room } from '../types'
import { LeaderboardPodium } from './LeaderboardPodium'
import { PlayerAvatar } from './PlayerAvatar'

const ASSET_BASE = '/assets/kenney-city-kit-roads'
const BADGE_COLORS = ['#7cf7ff', '#ffd166', '#ff6bcb', '#8aff80', '#ff8f5f']

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

function ValidatorDrone({
  angle,
  index,
  active,
}: {
  angle: number
  index: number
  active: boolean
}) {
  const ref = useRef<Mesh>(null)
  const color = BADGE_COLORS[index % BADGE_COLORS.length]

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.position.y = 2.15 + Math.sin(clock.elapsedTime * 1.8 + index) * 0.18
    ref.current.rotation.y = clock.elapsedTime * 1.2 + angle
  })

  return (
    <group position={[Math.cos(angle) * 3.15, 2.15, Math.sin(angle) * 3.15]}>
      <mesh ref={ref} castShadow>
        <octahedronGeometry args={[0.26, 0]} />
        <meshStandardMaterial
          color={active ? color : '#334155'}
          emissive={active ? color : '#111827'}
          emissiveIntensity={active ? 1.2 : 0.25}
          roughness={0.35}
          metalness={0.35}
        />
      </mesh>
      <pointLight color={color} intensity={active ? 0.45 : 0.1} distance={5} />
    </group>
  )
}

function HologramRing({ active }: { active: boolean }) {
  const ref = useRef<Mesh>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.z = clock.elapsedTime * 0.35
    ref.current.scale.setScalar(active ? 1 + Math.sin(clock.elapsedTime * 2.4) * 0.025 : 1)
  })

  return (
    <mesh ref={ref} position={[0, 1.48, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[2.55, 0.028, 12, 96]} />
      <meshStandardMaterial
        color={active ? '#7cf7ff' : '#35516d'}
        emissive={active ? '#35cfff' : '#102a43'}
        emissiveIntensity={active ? 1.8 : 0.4}
      />
    </mesh>
  )
}

function ArenaBanner({ room }: { room: Room | null }) {
  const status = room
    ? `${room.submissions.length}/20 players · ${room.xpTotal} XP · ${room.status}`
    : 'pick a weekly room'

  return (
    <group position={[0, 3.15, -4.35]} rotation={[-0.14, 0, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[6.7, 1.15, 0.08]} />
        <meshStandardMaterial
          color="#07111f"
          emissive="#123d5a"
          emissiveIntensity={0.35}
          roughness={0.5}
        />
      </mesh>
      <Text
        position={[0, 0.2, 0.08]}
        fontSize={0.28}
        color="#ffffff"
        maxWidth={6}
        textAlign="center"
        anchorX="center"
      >
        {room?.title ?? 'Quest Arena'}
      </Text>
      <Text
        position={[0, -0.26, 0.08]}
        fontSize={0.16}
        color="#7cf7ff"
        maxWidth={5.8}
        textAlign="center"
        anchorX="center"
      >
        {status.toUpperCase()}
      </Text>
    </group>
  )
}

export function Arena({ room }: { room: Room | null }) {
  const submissions = room?.submissions ?? []
  const isJudged = room?.status === 'finalized'
  const hasPlayers = submissions.length > 0
  const slots = useMemo(() => {
    const count = Math.max(12, submissions.length)
    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2
      return {
        x: Math.cos(angle) * 5.15,
        z: Math.sin(angle) * 5.15,
        angle,
      }
    })
  }, [submissions.length])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[13, 96]} />
        <meshStandardMaterial color="#0b1324" roughness={0.9} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <ringGeometry args={[5.85, 6.15, 96]} />
        <meshStandardMaterial
          color="#7cf7ff"
          emissive="#35cfff"
          emissiveIntensity={hasPlayers ? 0.95 : 0.35}
          transparent
          opacity={0.7}
        />
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
        <meshStandardMaterial
          color={isJudged ? '#ffd166' : '#7cf7ff'}
          emissive={isJudged ? '#ffb703' : '#35cfff'}
          emissiveIntensity={1.6}
        />
      </mesh>
      <HologramRing active={hasPlayers} />

      {Array.from({ length: 5 }, (_, index) => (
        <ValidatorDrone
          key={`validator-${index}`}
          angle={(index / 5) * Math.PI * 2}
          index={index}
          active={hasPlayers}
        />
      ))}

      <ArenaBanner room={room} />

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
          modelIndex={index}
        />
      ))}

      <LeaderboardPodium leaderboard={room?.leaderboard ?? []} />
    </group>
  )
}
