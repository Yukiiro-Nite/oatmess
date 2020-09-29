const defaultRotation = { x: 0, y: 0, z: 0, w: 0 }

function apple(pos, rot = defaultRotation) {
  return {
    type: 'dynamic',
    position: { x: pos.x, y: pos.y, z: pos.z },
    rotation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w },
    colliders: [{
      type: 'cuboid',
      width: 0.07,
      height: 0.07,
      depth: 0.07,
      density: 1,
      meta: {
        class: 'grabbable',
        removable: true
      },
    }],
    meta: {
      grabbable: true,
      'gltf-model': '#apple',
      taste: 1
    },
  }
}

module.exports = apple