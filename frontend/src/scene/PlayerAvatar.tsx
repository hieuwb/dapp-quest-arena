import { Text } from '@react-three/drei'

export function PlayerAvatar({
  position,
  rotation,
  name,
  active,
  rank,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  name: string
  active: boolean
  rank: number
}) {
  const color = rank === 0 ? '#ffd166' : active ? '#7cf7ff' : '#334155'
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.65, 0]} castShadow>
        <capsuleGeometry args={[0.24, 0.65, 8, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={active ? color : '#000000'}
          emissiveIntensity={active ? 0.32 : 0}
        />
      </mesh>
      <mesh position={[0, 1.28, 0]} castShadow>
        <sphereGeometry args={[0.25, 18, 18]} />
        <meshStandardMaterial color={active ? '#f8fafc' : '#64748b'} />
      </mesh>
      <Text
        position={[0, 1.75, 0]}
        fontSize={0.18}
        color={active ? '#ffffff' : '#94a3b8'}
        anchorX="center"
        maxWidth={1.4}
      >
        {name}
      </Text>
    </group>
  )
}

