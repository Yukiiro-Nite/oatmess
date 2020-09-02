AFRAME.registerComponent('input-panel', {
  schema: {},
  init: function () {
    this.value = ''
    this.handlePressed = AFRAME.utils.bind(this.handlePressed, this)
    this.el.addEventListener('pressed', this.handlePressed)
  },
  update: function () {},
  tick: function () {},
  remove: function () {},
  pause: function () {},
  play: function () {},
  handlePressed: function(event) {
    this.value += event.detail.value
    console.log('input panel value is: ', this.value)
  }
});
