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
const playerReady = require('./playerReady')

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
function playerSpace(player, gameState) {
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
    { width: 0.4, height: 0.4, depth: 0.4, thickness: 0.02 },
    player.id,
    gameState
  )
  const spawnerConfigs = [
    spawner(
      getOffsetFromPose(player.offset, { x: -0.3, y: 0.5, z: 0.3 }),
      offsetQuat,
      spawnIngredient,
      gameState
    ),
    spawner(
      getOffsetFromPose(player.offset, { x: 0.3, y: 0.5, z: 0.3 }),
      offsetQuat,
      spawnIngredient,
      gameState
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
  const playerReadyConfig = playerReady(player.offset, player.id, gameState)
  return {
    bodies: [
      ...potConfig,
      ...spawnerConfigs,
      ...conveyorConfigs,
      ...playerReadyConfig
    ],
    joints: []
  }
}

module.exports = playerSpace