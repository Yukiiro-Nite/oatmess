AFRAME.registerComponent('player-ready', {
  schema: {
    on: { type: 'string' }
  },
  init: function () {
    this.handleReady = AFRAME.utils.bind(this.handleReady, this)

    this.el.addEventListener(this.data.on, this.handleReady)
  },
  handleReady: function(event) {
    const socket = this.el.sceneEl.systems['networked-player'].socket
    const readyState = event.target.value === 'ready'
      ? true
      : false

    socket.emit('playerReady', { state: readyState })
  }
});
