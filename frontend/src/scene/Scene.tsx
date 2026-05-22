import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, Environment, OrbitControls, Stars } from '@react-three/drei'
import { Arena } from './Arena'
import { CameraRig } from './CameraRig'
import type { Room } from '../types'

export function Scene({ room }: { room: Room | null }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ position: [7, 7, 10], fov: 48 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      className="absolute inset-0"
    >
      <color attach="background" args={['#080b1a']} />
      <fog attach="fog" args={['#080b1a', 18, 42]} />
      <Stars radius={90} depth={35} count={1400} factor={4} fade speed={0.35} />
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[8, 12, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[0, 4, 0]} intensity={2.8} color="#7cf7ff" distance={16} />
      <Environment preset="city" />
      <Arena room={room} />
      <CameraRig />
      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={7}
        maxDistance={18}
        maxPolarAngle={Math.PI / 2.08}
      />
      <AdaptiveDpr pixelated />
    </Canvas>
  )
}

