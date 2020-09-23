/**
 * Returns the offset position and rotation for a player
 * @param {number} index - Index of the player to place.
 * @param {number} total - Total number of players.
 * @param {number} space - How much space should be between players.
 * @returns {Object} { position, rotation }
 */
function getPlayerPlacement(index, total, space) {
  const angle = Math.PI / total
  const radius = space / (2 * Math.sin(angle))
  const position = {
    x: Math.cos(2 * angle * index) * radius,
    y: 0,
    z: Math.sin(2 * angle * index) * radius,
  }
  const rotation = {
    x: 0,
    y: (Math.PI / 2) - 2 * angle * index, // camera view is 90 deg from camera rotation
    z: 0
  }

  return { position, rotation }
}

/**
 * @param {Object[]} players - list of player information used to determine the next player index.
 * @returns {int} Next player index
 */
function getNextIndex(players) {
  const playerNumbers = players
    ? players
      .map(({ index }) => index)
      .sort()
    : []
  let foundNextIndex = false
  let nextIndex = 0

  for(let i = 0; i < playerNumbers.length && !foundNextIndex; i++) {
    foundNextIndex = playerNumbers[i] !== i
    if(!foundNextIndex) {
      nextIndex = i + 1
    }
  }

  return nextIndex
}

module.exports = {
  getPlayerPlacement,
  getNextIndex
}