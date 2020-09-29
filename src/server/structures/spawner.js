const { Vector3 } = require('three')
const { getOffsetFromPose } = require("../utils/vectorUtils")

function spawner (pos, rot, rigidBodyGenerator, gameState) {
  let spawnTimer
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
    tick: function(bodyId) {
      if(!spawnTimer && gameState.started) {
        spawnTimer = setTimeout(() => {
          spawnTimer = undefined

          const offset = new Vector3(0, 0, -0.15)
          const newPos = getOffsetFromPose({ position: pos, rotation: rot }, offset)
          const rigidBodyConfig = rigidBodyGenerator(newPos, rot)
          this.addToWorld({ bodies: [rigidBodyConfig] })
        }, gameState.spawnFrequency)
      }
    }
  }
}

module.exports = spawner