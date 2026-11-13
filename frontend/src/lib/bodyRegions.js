const MESH_SYSTEM_RULES = [
  { systemId: 'brain', pattern: /cranium|skull/i },
  { systemId: 'lungs', pattern: /\brib|sternum/i },
]

export function systemForMeshName(name) {
  return MESH_SYSTEM_RULES.find((rule) => rule.pattern.test(name))?.systemId ?? 'musculoskeletal'
}
