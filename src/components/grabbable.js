AFRAME.registerComponent('grabbable', {
  schema: {},
  events: {
    mousedown: function (event) {
      const bodyId = getId(this.el)
      const position = event.detail.intersection.point

      console.log(`Grabbing rigid body ${bodyId} at location: `, position)

      this.socket.emit('grab', {
        bodyId,
        position,
        part: getPartType(event.detail.cursorEl),
        srcPose: getPose(event.detail.cursorEl)
      })
    },
    mouseup: function (event) {
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
