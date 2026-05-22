import { Clone, Text, useGLTF } from '@react-three/drei'
import type { Group } from 'three'

const CHARACTER_BASE = '/assets/kenney-blocky-characters'
const CHARACTER_MODELS = [
  'character-a.glb',
  'character-c.glb',
  'character-f.glb',
  'character-i.glb',
  'character-l.glb',
  'character-o.glb',
  'character-r.glb',
]

CHARACTER_MODELS.forEach((model) => useGLTF.preload(`${CHARACTER_BASE}/${model}`))

export function PlayerAvatar({
  position,
  rotation,
  name,
  active,
  rank,
  modelIndex = 0,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  name: string
  active: boolean
  rank: number
  modelIndex?: number
}) {
  const color = rank === 0 ? '#ffd166' : active ? '#7cf7ff' : '#334155'
  const model = CHARACTER_MODELS[modelIndex % CHARACTER_MODELS.length]
  const gltf = useGLTF(`${CHARACTER_BASE}/${model}`)

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[0.48, 0.56, 0.1, 28]} />
        <meshStandardMaterial
          color={active ? '#102a43' : '#1f2937'}
          emissive={active ? color : '#000000'}
          emissiveIntensity={active ? 0.45 : 0}
          roughness={0.55}
        />
      </mesh>
      <group position={[0, 0.12, 0]} scale={active ? 0.58 : 0.44}>
        <Clone object={gltf.scene as Group} castShadow receiveShadow />
      </group>
      <mesh position={[0, 1.64, 0]} visible={active}>
        <torusGeometry args={[0.38, 0.018, 10, 48]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
      </mesh>
      <Text
        position={[0, 1.92, 0]}
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
