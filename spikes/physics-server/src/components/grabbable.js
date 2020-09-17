AFRAME.registerComponent('grabbable', {
  schema: {},
  events: {
    mousedown: function (event) {
      this.socket.emit('grab', {
        bodyId: this.getId(),
        position: event.detail.intersection.point,
        part: this.getPartType(event.detail.cursorEl),
        srcPose: this.getPose(event.detail.cursorEl)
      })
    },
    mouseup: function (event) {
      this.socket.emit('release', {
        bodyId: this.getId(),
        part: this.getPartType(event.detail.cursorEl)
      })
    }
  },
  init: function () {
    this.socket = this.el.sceneEl.systems['networked-player'].socket
    this.getId = AFRAME.utils.bind(this.getId, this)
    this.getPose = AFRAME.utils.bind(this.getPose, this)
    this.getPartType = AFRAME.utils.bind(this.getPartType, this)
  },
  update: function () {},
  tick: function () {},
  remove: function () {},
  pause: function () {},
  play: function () {},
  getId: function() {
    const idStr = this.el.id.split('-').slice(-1)[0]
    return parseInt(idStr)
  },
  getPose: function(cursorEl) {
    if(cursorEl === this.el.sceneEl) {
      return {
        position: cursorEl.systems.camera.activeCameraEl.object3D.position,
        rotation: cursorEl.systems.camera.activeCameraEl.object3D.quaternion,
      }
    } else {
      return {
        position: cursorEl.object3D.position,
        rotation: cursorEl.object3D.quaternion
      }
    }
  },
  getPartType: function(cursorEl) {
    return cursorEl === this.el.sceneEl
      ? 'head'
      : cursorEl.id
  }
});
