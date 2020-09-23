AFRAME.registerComponent('grabbable', {
  schema: {},
  events: {
    mousedown: function (event) {
      console.log('mousedown', event)
      this.socket.emit('grab', {
        bodyId: getId(this.el),
        position: event.detail.intersection.point,
        part: getPartType(event.detail.cursorEl),
        srcPose: getPose(event.detail.cursorEl)
      })
    },
    mouseup: function (event) {
      console.log('mouseup', event)
      this.socket.emit('release', {
        bodyId: getId(this.el),
        part: getPartType(event.detail.cursorEl),
        velocity: event.detail.velocity || new AFRAME.THREE.Vector3()
      })
    }
  },
  init: function () {
    this.socket = this.el.sceneEl.systems['networked-player'].socket
  }
});
