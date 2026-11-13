import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import BodySkeleton from './BodySkeleton'
import BodyOrgans from './BodyOrgans'

export default function BodyScene({ heartRate, selectedSystemId, statusBySystem, onSelectSystem }) {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 1.0, 4.4], fov: 28 }}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 4, 5]} intensity={1.2} color="#e6f1ff" />
      <pointLight position={[-2, 1.5, 2]} intensity={6} color="#22d3ee" distance={10} />
      <pointLight position={[2, 0, -3]} intensity={4} color="#3b82f6" distance={10} />
      <Stars radius={40} depth={20} count={400} factor={2} saturation={0} fade speed={0.3} />
      <Suspense fallback={null}>
        <BodySkeleton selectedSystemId={selectedSystemId} onSelectSystem={onSelectSystem} />
        <BodyOrgans
          heartRate={heartRate}
          selectedSystemId={selectedSystemId}
          statusBySystem={statusBySystem}
          onSelectSystem={onSelectSystem}
        />
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableDamping
        minDistance={2.4}
        maxDistance={6.5}
        target={[0, 0.92, 0]}
      />
    </Canvas>
  )
}
