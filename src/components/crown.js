AFRAME.registerComponent('crown', {
  schema: {},
  init: function () {
    this.el.setAttribute('particle-system', {
      preset: 'default',
      maxAge: 1,
      positionSpread: { x: 0, y: 0, z: 0 },
      type: 3,
      accelerationValue: { x: 0, y: 0, z: 0 },
      accelerationSpread: { x: 0, y: 0.05, z: 0 },
      velocityValue: { x: 0, y: 0.0, z: 0 },
      velocitySpread: { x: 0.4, y: 0.05, z: 0.4 },
      color: '#fffafe,#d66c00',
      size: 0.01
    })
  },
  update: function () {},
  tick: function () {},
  remove: function () {
    this.el.removeAttribute('particle-system')
  },
  pause: function () {},
  play: function () {}
});