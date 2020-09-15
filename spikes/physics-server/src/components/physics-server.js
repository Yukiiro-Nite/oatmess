AFRAME.registerSystem('physics-server', {
  schema: {},
  bodyDefaults: {

  },
  colliderDefaults: {
    color: '#ff00ff'
  },
  dependencies: ['networked-player'],
  init: function() {
    this.socket = this.el.systems['networked-player'].socket

    this.handleWorldUpdate = AFRAME.utils.bind(this.handleWorldUpdate, this)
    this.createBody = AFRAME.utils.bind(this.createBody, this)
    this.updateBody = AFRAME.utils.bind(this.updateBody, this)
    this.createCollider = AFRAME.utils.bind(this.createCollider, this)
    this.updateCollider = AFRAME.utils.bind(this.updateCollider, this)
    this.metaToAttributes = AFRAME.utils.bind(this.metaToAttributes, this)
    this.stringifyMeta = AFRAME.utils.bind(this.stringifyMeta, this)

    this.socket.on('worldUpdate', this.handleWorldUpdate)
  },
  handleWorldUpdate: function(msg) {
    msg.bodies.forEach((body) => {
      const bodyId = `body-${body.id}`
      const bodyEl = this.el.querySelector('#' + bodyId)

      if(!bodyEl) {
        const el = this.createBody(bodyId, body)
        this.el.appendChild(el)
      } else {
        this.updateBody(bodyEl, body)
      }
    })
  },
  createBody: function(id, body) {
    const pos = body.position
    const quat = new AFRAME.THREE.Quaternion(body.rotation.x, body.rotation.y, body.rotation.z, body.rotation.w)
    const rot = new AFRAME.THREE.Euler().setFromQuaternion(quat)
    const meta = AFRAME.utils.extendDeep({}, this.bodyDefaults, body.meta)
    const el = htmlToElement(`
      <a-entity
        id="${id}"
        position="${pos.x} ${pos.y} ${pos.z}"
        rotation="${rot.x} ${rot.y} ${rot.z}"
        ${this.metaToAttributes(meta)}
      ></a-entity>
    `)

    body.colliders.forEach((collider) => {
      const colliderEl = this.createCollider(collider)
      colliderEl && el.appendChild(colliderEl)
    })

    return el
  },
  updateBody: function(el, body) {
    if(el && el.object3D) {
      el.object3D.position.copy(body.position)
      el.object3D.quaternion.copy(body.rotation)
    }
  },
  createCollider: function(collider) {
    const colliderId = `collider-${collider.id}`
    const pos = collider.position
    const quat = new AFRAME.THREE.Quaternion(collider.rotation.x, collider.rotation.y, collider.rotation.z, collider.rotation.w)
    const rot = new AFRAME.THREE.Euler().setFromQuaternion(quat)
    const meta = AFRAME.utils.extendDeep({}, this.colliderDefaults, collider.meta)
    let el

    if(collider.type === 'Ball') {
      el = htmlToElement(`
        <a-sphere
          id="${colliderId}"
          position="${pos.x} ${pos.y} ${pos.z}"
          rotation="${rot.x} ${rot.y} ${rot.z}"
          radius="${collider.radius}"
          ${this.metaToAttributes(meta)}
        ></a-sphere>
      `)
    } else if(collider.type === 'Cuboid') {
      el = htmlToElement(`
        <a-box
          id="${colliderId}"
          position="${pos.x} ${pos.y} ${pos.z}"
          rotation="${rot.x} ${rot.y} ${rot.z}"
          width="${collider.size.width}"
          height="${collider.size.height}"
          depth="${collider.size.depth}"
          ${this.metaToAttributes(meta)}
        ></a-box>
      `)
    }

    return el
  },
  updateCollider: function(el, collider) {
    // TODO: update this later if needed.
    if(el && el.object3D) {
      el.object3D.position.copy(collider.position)
      el.object3D.quaternion.copy(collider.rotation)
    }
  },
  metaToAttributes: function(meta) {
    if(!meta) {
      return ''
    } else {
      let str = ''

      Object.entries(meta).forEach(([key, value]) => {
        str += `${key}=${this.stringifyMeta(value)}\n`
      })

      return str
    }
  },
  stringifyMeta: function(value) {
    const isVector = typeof value.x === 'number'
      && typeof value.y === 'number'
      && typeof value.z === 'number'
    if(isVector) {
      return AFRAME.utils.coordinates.stringify(value)
    } else if(Array.isArray(value)) {
      return value.join(' ')
    } else if(typeof value === 'object') {
      return AFRAME.utils.styleParser.stringify(value)
    } else {
      return value.toString()
    }
  }
})