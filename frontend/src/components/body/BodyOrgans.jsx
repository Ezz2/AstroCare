import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { SphereGeometry, Vector3 } from 'three'
import { STATUS_META } from '../../lib/health'

const ORGANS = [
  {
    id: 'brain',
    systemId: 'brain',
    label: 'Brain',
    position: [0, 1.66, 0.005],
    scale: [0.068, 0.052, 0.08],
    color: '#e8a9b7',
    bumps: 0.07,
    frequency: 7,
    taper: 0,
  },
  {
    id: 'heart',
    systemId: 'heart',
    label: 'Heart',
    position: [0.025, 1.2, 0.045],
    rotation: [0, 0, -0.5],
    scale: [0.052, 0.06, 0.046],
    color: '#b23a48',
    bumps: 0.06,
    frequency: 3,
    taper: 0.45,
    beat: true,
  },
  {
    id: 'lungs-left',
    systemId: 'lungs',
    label: 'Lungs',
    position: [-0.075, 1.2, -0.005],
    scale: [0.058, 0.18, 0.08],
    color: '#d98b94',
    bumps: 0.04,
    frequency: 2.5,
    taper: 0.2,
    breathe: true,
  },
  {
    id: 'lungs-right',
    systemId: 'lungs',
    label: 'Lungs',
    position: [0.075, 1.2, -0.005],
    scale: [0.058, 0.18, 0.08],
    color: '#d98b94',
    bumps: 0.04,
    frequency: 2.5,
    taper: 0.2,
    breathe: true,
  },
  {
    id: 'pancreas',
    systemId: 'pancreas',
    label: 'Pancreas',
    position: [0.01, 1.06, 0.06],
    rotation: [0, 0, 0.12],
    scale: [0.1, 0.022, 0.03],
    color: '#e6b976',
    bumps: 0.1,
    frequency: 4,
    taper: 0,
  },
]

function organGeometry({ bumps, frequency, taper }) {
  const geometry = new SphereGeometry(1, 48, 48)
  const positions = geometry.attributes.position
  const v = new Vector3()
  for (let i = 0; i < positions.count; i++) {
    v.fromBufferAttribute(positions, i)
    const noise = Math.sin(v.x * frequency * 3.1) * Math.cos(v.y * frequency * 2.3) * Math.sin(v.z * frequency * 2.7)
    const k = 1 + bumps * noise
    const t = 1 - taper * Math.max(0, -v.y)
    positions.setXYZ(i, v.x * k * t, v.y * k, v.z * k * t)
  }
  geometry.computeVertexNormals()
  return geometry
}

function emissiveFor(status, selected) {
  if (selected) return { color: '#22d3ee', intensity: 0.45 }
  if (status === 'alert') return { color: STATUS_META.alert.glow, intensity: 0.35 }
  if (status === 'watch') return { color: STATUS_META.watch.glow, intensity: 0.25 }
  return { color: '#000000', intensity: 0 }
}

function Organ({ organ, status, selected, heartRate, onSelect }) {
  const ref = useRef(null)
  const geometry = useMemo(() => organGeometry(organ), [organ])
  const emissive = emissiveFor(status, selected)
  const [sx, sy, sz] = organ.scale

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame(({ clock }) => {
    const mesh = ref.current
    if (!mesh) return
    const t = clock.elapsedTime
    let factor = 1
    if (organ.beat) factor = 1 + 0.035 * Math.max(0, Math.sin(t * Math.PI * 2 * ((heartRate || 70) / 60)))
    if (organ.breathe) factor = 1 + 0.025 * Math.sin(t * Math.PI * 2 * 0.25)
    mesh.scale.set(sx * factor, sy * factor, sz * factor)
  })

  return (
    <mesh
      ref={ref}
      geometry={geometry}
      position={organ.position}
      rotation={organ.rotation}
      scale={organ.scale}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(organ.systemId)
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      <meshPhysicalMaterial
        color={organ.color}
        roughness={0.42}
        clearcoat={0.6}
        clearcoatRoughness={0.35}
        emissive={emissive.color}
        emissiveIntensity={emissive.intensity}
      />
    </mesh>
  )
}

export default function BodyOrgans({ heartRate, selectedSystemId, statusBySystem, onSelectSystem }) {
  return ORGANS.map((organ) => (
    <Organ
      key={organ.id}
      organ={organ}
      status={statusBySystem[organ.systemId]}
      selected={selectedSystemId === organ.systemId}
      heartRate={heartRate}
      onSelect={onSelectSystem}
    />
  ))
}
