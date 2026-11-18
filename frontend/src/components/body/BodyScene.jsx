import { Suspense, useEffect, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { BufferGeometry, Float32BufferAttribute } from 'three'
import BodySkeleton from './BodySkeleton'
import BodyOrgans from './BodyOrgans'
import useTheme from '../../theme/useTheme'

function LightModeStars() {
  const geometry = useMemo(() => {
    const starCount = 2200
    const positions = new Float32Array(starCount * 3)

    for (let index = 0; index < starCount; index += 1) {
      const radius = 18 + Math.random() * 22
      const polar = Math.acos(2 * Math.random() - 1)
      const azimuth = Math.random() * Math.PI * 2
      const offset = index * 3

      positions[offset] = radius * Math.sin(polar) * Math.cos(azimuth)
      positions[offset + 1] = radius * Math.cos(polar)
      positions[offset + 2] = radius * Math.sin(polar) * Math.sin(azimuth)
    }

    const starGeometry = new BufferGeometry()
    starGeometry.setAttribute(
      'position',
      new Float32BufferAttribute(positions, 3),
    )
    return starGeometry
  }, [])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <points geometry={geometry}>
      <pointsMaterial
        color="#102f47"
        size={0.22}
        sizeAttenuation
        transparent
        opacity={1}
        depthWrite={false}
      />
    </points>
  )
}

export default function BodyScene({ heartRate, selectedSystemId, statusBySystem, onSelectSystem }) {
  const { theme } = useTheme()

  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 1.0, 4.4], fov: 28 }}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 4, 5]} intensity={1.2} color="#e6f1ff" />
      <pointLight position={[-2, 1.5, 2]} intensity={6} color="#22d3ee" distance={10} />
      <pointLight position={[2, 0, -3]} intensity={4} color="#3b82f6" distance={10} />
      {theme === 'light' ? (
        <LightModeStars />
      ) : (
        <Stars radius={40} depth={20} count={400} factor={2} saturation={0} fade speed={0.3} />
      )}
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
