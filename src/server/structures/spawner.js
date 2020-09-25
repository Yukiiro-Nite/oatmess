function spawner (pos, rot, rigidBodyGenerator) {
  return {
    type: 'static',
    position: { x: pos.x, y: pos.y, z: pos.z },
    rotation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w },
    colliders: [{
      type: 'cuboid',
      width: 0.2,
      height: 0.2,
      depth: 0.2,
      density: 1,
      meta: {},
    }],
    meta: {
      'gltf-model': '#spawner'
    },
  }
}

module.exports = spawner