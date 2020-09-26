const {
  Vector3,
  Quaternion,
  Euler
} = require('three')
const pot = require('./pot')
const apple = require('./apple')
const spawner = require('./spawner')
const conveyor = require('./conveyor')
const spawnIngredient = require('./spawnIngredient')
const { getCounterPose, getOffsetFromPose } = require('../utils/vectorUtils')

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
  const offsetQuat = new Quaternion()
    .setFromEuler(new Euler(
      player.offset.rotation.x,
      player.offset.rotation.y,
      player.offset.rotation.z
    ))
  const potPose = getCounterPose(player.offset, 0.4)
  const potConfig = pot(
    potPose.position,
    undefined,
    { width: 0.4, height: 0.4, depth: 0.4, thickness: 0.02 }
  )
  const appleConfig = [
    apple({ ...player.offset.position, y: 0.5 })
  ]
  const spawnerConfigs = [
    spawner(
      getOffsetFromPose(player.offset, { x: -0.3, y: 0.5, z: 0.3 }),
      offsetQuat,
      spawnIngredient
    ),
    spawner(
      getOffsetFromPose(player.offset, { x: 0.3, y: 0.5, z: 0.3 }),
      offsetQuat,
      spawnIngredient
    )
  ]
  const conveyorConfigs = [
    conveyor(
      getOffsetFromPose(player.offset, { x: -0.3, y: 0.41, z: -0.2 }),
      offsetQuat
    ),
    conveyor(
      getOffsetFromPose(player.offset, { x: 0.3, y: 0.41, z: -0.2 }),
      offsetQuat
    ),
  ]
  return {
    bodies: [
      ...potConfig,
      ...appleConfig,
      ...spawnerConfigs,
      ...conveyorConfigs
    ],
    joints: []
  }
}

// function getCounterPose(position, rotation, distance) {
//   position = new Vector3(position.x, position.y, position.z)
//   quaternion = new Quaternion()
//     .setFromEuler(new Euler(rotation.x, rotation.y, rotation.z))
//   const offsetPosition = new Vector3(0, 0, -1)
//   offsetPosition
//     .applyQuaternion(quaternion)
//     .multiplyScalar(distance)

//   return {
//     position: position.add(offsetPosition),
//     quaternion
//   }
// }

// function getOffsetFromPose(pose, offset) {
//   const position = new Vector3(pose.position.x, pose.position.y, pose.position.z)
//   const quaternion = new Quaternion()
//     .setFromEuler(new Euler(pose.rotation.x, pose.rotation.y, pose.rotation.z))
//   const offsetPos = new Vector3(offset.x, offset.y, offset.z)
//   offsetPos
//     .applyQuaternion(quaternion)
//     .add(position)

//   return offsetPos
// }

module.exports = playerSpace