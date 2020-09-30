AFRAME.registerComponent('crown', {
  schema: {},
  init: function () {
    this.el.setAttribute('particle-system', {
      preset: 'default',
      'max-age': 2
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