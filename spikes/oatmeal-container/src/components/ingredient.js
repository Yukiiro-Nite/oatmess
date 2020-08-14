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

    el.ingredient = {
      type: 'apple',
      value: 1
    }
  }
}

function setupIngredient(el, type) {
  const setupFn = ingredients[type]

  if(setupFn && setupFn instanceof Function) {
    setupFn(el)
  }
}