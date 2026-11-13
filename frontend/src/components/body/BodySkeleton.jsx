import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { MeshStandardMaterial } from 'three'
import { systemForMeshName } from '../../lib/bodyRegions'

const MODEL_PATH = '/models/human-skeleton.glb'
useGLTF.preload(MODEL_PATH)

function createBoneMaterial(highlighted) {
  return new MeshStandardMaterial({
    color: highlighted ? '#7dd3fc' : '#c7d7ea',
    roughness: 0.5,
    metalness: 0,
    transparent: true,
    opacity: highlighted ? 0.75 : 0.22,
    depthWrite: false,
    emissive: highlighted ? '#22d3ee' : '#000000',
    emissiveIntensity: highlighted ? 0.3 : 0,
  })
}

export default function BodySkeleton({ selectedSystemId, onSelectSystem }) {
  const { scene } = useGLTF(MODEL_PATH)
  const model = useMemo(() => scene.clone(true), [scene])
  const materials = useMemo(() => ({ base: createBoneMaterial(false), highlight: createBoneMaterial(true) }), [])

  useEffect(() => {
    return () => {
      materials.base.dispose()
      materials.highlight.dispose()
    }
  }, [materials])

  useEffect(() => {
    model.traverse((object) => {
      if (!object.isMesh) return
      object.userData.systemId ??= systemForMeshName(object.name)
      object.material = object.userData.systemId === selectedSystemId ? materials.highlight : materials.base
    })
  }, [model, materials, selectedSystemId])

  return (
    <primitive
      object={model}
      onClick={(event) => {
        event.stopPropagation()
        onSelectSystem(event.object.userData.systemId)
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    />
  )
}
