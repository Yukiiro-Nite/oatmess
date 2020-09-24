const {
  Vector3,
  Quaternion,
  Euler
} = require('three')
const pot = require('./pot')
const apple = require('./apple')

/**
 * Returns a config object to add a player space to a world.
 * @param {Object} player 
 * @param {String} player.id - Socket id of the player.
 * @param {String} player.roomId - Room id of the room the player joined.
 * @param {Number} player.index - Index of the player.
 * @param {Object} player.offset - Offset pose of the player.
 * @param {Vec3} player.offset.position
 * @param {Vec3} player.offset.rotation
 */
function playerSpace(player) {
  const potPose = getCounterPose(player.offset.position, player.offset.rotation, 0.4)
  const potConfig = pot(
    potPose.position,
    undefined,
    { width: 0.4, height: 0.4, depth: 0.4, thickness: 0.02 }
  )
  const appleConfig = [
    apple({ ...player.offset.position, y: 0.5 } )
  ]
  return {
    bodies: [
      ...potConfig,
      ...appleConfig
    ],
    joints: []
  }
}

function getCounterPose(position, rotation, distance) {
  position = new Vector3(position.x, position.y, position.z)
  quaternion = new Quaternion()
    .setFromEuler(new Euler(rotation.x, rotation.y, rotation.z))
  const offsetPosition = new Vector3(0, 0, -1)
  offsetPosition
    .applyQuaternion(quaternion)
    .multiplyScalar(distance)

  return {
    position: position.add(offsetPosition),
    quaternion
  }
}

module.exports = playerSpace