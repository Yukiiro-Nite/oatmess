const defaultRotation = { x: 0, y: 0, z: 0, w: 0 }

function sardine(pos, rot = defaultRotation) {
  return {
    type: 'dynamic',
    position: { x: pos.x, y: pos.y, z: pos.z },
    rotation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w },
    colliders: [{
      type: 'cuboid',
      width: 0.06,
      height: 0.03,
      depth: 0.2,
      density: 1,
      meta: {
        class: 'grabbable',
        removable: true
      },
    }],
    meta: {
      grabbable: true,
      'gltf-model': '#sardine',
      taste: -1
    },
  }
}

module.exports = sardine