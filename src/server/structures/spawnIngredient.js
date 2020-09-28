const apple = require('./apple')
const banana = require('./banana')

const ingredients = [
  apple,
  banana
]

function spawnIngredient(pos, rot) {
  const randomIndex = Math.floor(Math.random() * ingredients.length)
  return ingredients[randomIndex](pos, rot)
}

module.exports = spawnIngredient