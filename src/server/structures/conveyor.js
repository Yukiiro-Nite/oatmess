const { Vector3 } = require('three')
const { rapierVectorToThree } = require("../utils/vectorUtils")
const defaultSpeed = -0.004

function conveyor (pos, rot, speed = defaultSpeed) {
  return {
    type: 'static',
    position: { x: pos.x, y: pos.y, z: pos.z },
    rotation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w },
    colliders: [{
      type: 'cuboid',
      width: 0.2,
      height: 0.02,
      depth: 0.8,
      density: 1,
      meta: {},
    }],
    meta: {
      'gltf-model': '#conveyor'
    },
    collisionTick: function(body1, body2) {
      const otherBody = this.world.getRigidBody(body2)
      const offset = new Vector3(0, 0, speed)
        .applyQuaternion(rot)
      if(otherBody) {
        const newPosition = rapierVectorToThree(otherBody.translation()).add(offset)
        otherBody.setTranslation(newPosition.x, newPosition.y, newPosition.z, true)
      }
    }
  }
}

module.exports = conveyor