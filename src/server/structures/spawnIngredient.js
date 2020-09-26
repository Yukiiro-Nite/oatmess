const apple = require('./apple')

const ingredients = [
  apple
]

function spawnIngredient(pos, rot) {
  const randomIndex = Math.floor(Math.random() * ingredients.length)
  return ingredients[randomIndex](pos, rot)
}

module.exports = spawnIngredient