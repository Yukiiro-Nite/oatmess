AFRAME.registerComponent('ingredient', {
  schema: {
    type: {default: 'apple'}
  },
  init: function () {
    setupIngredient(this.el, this.data.type)
  },
  update: function () {},
  tick: function () {},
  remove: function () {},
  pause: function () {},
  play: function () {}
});

const ingredients = {
  'apple': (el) => {
    el.setAttribute('geometry', {
      primitive: 'sphere',
      radius: 0.04
    })
    el.setAttribute('material', {
      color: 'red'
    })
  }
}

function setupIngredient(el, type) {
  const ingredient = ingredients[type]

  if(ingredient && ingredient instanceof Function) {
    ingredient(el)
  }
}