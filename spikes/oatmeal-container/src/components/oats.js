AFRAME.registerComponent('oats', {
  schema: {},
  init: function () {
    this.ingredients = []

    this.handleCollision = AFRAME.utils.bind(this.handleCollision, this)

    this.el.addEventListener('collide', this.handleCollision)
  },
  update: function () {},
  tick: function () {},
  remove: function () {},
  pause: function () {},
  play: function () {},
  handleCollision: function (event) {
    const ingredient = event.detail.body.el.ingredient
    this.ingredients.push(ingredient)

    this.el.sceneEl.removeChild(event.detail.body.el)
    console.log('Current ingredients: ', this.ingredients)
  }
});
