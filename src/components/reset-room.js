AFRAME.registerComponent('reset-room', {
  schema: {
    on: { type: 'string' }
  },
  init: function () {
    this.handleReset = AFRAME.utils.bind(this.handleReset, this)

    this.el.addEventListener(this.data.on, this.handleReset)
  },
  update: function () {},
  tick: function () {},
  remove: function () {},
  pause: function () {},
  play: function () {},
  handleReset: function() {
    const socket = this.el.sceneEl.systems['networked-player'].socket

    socket.emit('resetRoom')
  }
});
