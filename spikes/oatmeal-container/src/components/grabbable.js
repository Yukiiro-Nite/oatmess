AFRAME.registerComponent('grabbable', {
  schema: {
    threshold: {default: 0.05}
  },
  init: function () {
    this.el.threshold = this.data.threshold
  },
  update: function () {},
  tick: function () {},
  remove: function () {},
  pause: function () {},
  play: function () {}
});
