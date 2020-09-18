AFRAME.registerComponent('remove-collided', {
  schema: {},
  events: {
    'collision-start': function(event) {
      if(event.detail.collider.hasAttribute('removable')) {
        this.socket.emit('removeBodyByCollider', { colliderId: event.detail.handle })
      }
    }
  },
  init: function () {
    this.socket = this.el.sceneEl.systems['networked-player'].socket
  },
  update: function () {},
  tick: function () {},
  remove: function () {},
  pause: function () {},
  play: function () {}
});
