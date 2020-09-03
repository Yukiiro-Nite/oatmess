AFRAME.registerComponent('join-room', {
  schema: {
    on: { type: 'string' }
  },
  init: function () {
    this.handleJoin = AFRAME.utils.bind(this.handleJoin, this)

    this.el.addEventListener(this.data.on, this.handleJoin)
  },
  update: function () {},
  tick: function () {},
  remove: function () {},
  pause: function () {},
  play: function () {},
  handleJoin: function(event) {
    const roomId = event.target.value

    console.log('Got roomId: ', roomId)

    event.target.clear()
  }
});
