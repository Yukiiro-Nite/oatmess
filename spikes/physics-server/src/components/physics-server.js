AFRAME.registerSystem('physics-server', {
  schema: {},
  dependencies: ['networked-player'],
  init: function() {
    this.socket = this.el.systems['networked-player'].socket

    this.handleWorldUpdate = AFRAME.utils.bind(this.handleWorldUpdate, this)
    this.createBody = AFRAME.utils.bind(this.createBody, this)
    this.updateBody = AFRAME.utils.bind(this.updateBody, this)

    this.socket.on('worldUpdate', this.handleWorldUpdate)
  },
  handleWorldUpdate: function(msg) {
    msg.bodies.forEach((body) => {
      const bodyId = `body-${body.id}`
      const bodyEl = this.el.querySelector('#' + bodyId)

      if(!bodyEl) {
        this.createBody(bodyId, body)
      } else {
        this.updateBody(bodyEl, body)
      }
    })
  },
  createBody: function(id, body) {
    const el = htmlToElement(`
      <a-box
        id="${id}"
        height="0.5"
        width="0.5"
        depth="0.5"
        color="cyan"
      ></a-box>
    `)

    el.addEventListener('object3dset', function(event) {
      el.removeEventListener('object3dset', this)

      event.target.object3D.position.copy(body.position)
      event.target.object3D.quaternion.copy(body.rotation)
    })

    this.el.appendChild(el)
  },
  updateBody: function(el, body) {
    if(el && el.object3D) {
      el.object3D.position.copy(body.position)
      el.object3D.quaternion.copy(body.rotation)
    }
  }
})