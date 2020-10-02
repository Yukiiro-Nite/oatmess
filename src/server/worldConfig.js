const room = require('./structures/room')
const cube = require('./structures/cube')
const longRect = require('./structures/longRect')

const roomConfig = room(
  { x: 0, y: 0, z: 0 },
  { x: 0, y: 0, z: 0, w: 0 },
  { width: 5, height: 3, depth: 5, thickness: 0.1 }
)

const tableConfig = {
  type: 'static',
  position: { x: 0, y: 1.0, z: -0.4 },
  colliders: [{
    type: 'cuboid',
    width: 1,
    height: 0.02,
    depth: 0.5,
    meta: {
      color: '#442a1e'
    },
  }],
}

const cubeConfig = cube({ x: -0.25, y: 1.36, z: -0.4 })
const longRectConfig = longRect({ x: 0.25, y: 1.36, z: -0.4 })

const worldConfig = {
  bodies: [
    ...roomConfig,
    tableConfig,
    cubeConfig,
    longRectConfig
  ],
  joints: []
}

module.exports = worldConfig