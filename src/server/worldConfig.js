const room = require('./structures/room')

const extraCubes = new Array(20).fill().map((_, i) => ({
  type: 'dynamic',
  position: { x: 1, y: 0.035 + i * 0.07, z: 0 },
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
    'gltf-model': '#apple'
  },
}))

const worldConfig = {
  bodies: [
    ...room(
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0, w: 0 },
      { width: 5, height: 3, depth: 5, thickness: 0.1 }
    )
  ],
  joints: []
}

module.exports = worldConfig