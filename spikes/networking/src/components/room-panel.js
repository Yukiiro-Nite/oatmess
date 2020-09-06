AFRAME.registerPrimitive('a-room-panel', {
  defaultComponents: {
    'room-panel': {}
  },
  mappings: {}
});

AFRAME.registerComponent('room-panel', {
  schema: {},
  events: {
    pressed: function(event) {
      const val = event.target.value

      const action = this.actions[val]
      const isButtonColliding = event.detail.body.el.hasAttribute('button')

      if(action && action instanceof Function && !isButtonColliding) {
        action()
      }
    }
  },
  init: function () {
    this.originalPos = this.el.object3D.position.clone()
    this.createPanel = AFRAME.utils.bind(this.createPanel, this)
    this.createHexInput = AFRAME.utils.bind(this.createHexInput, this)
    this.joinRoom = AFRAME.utils.bind(this.joinRoom, this)
    this.createRoom = AFRAME.utils.bind(this.createRoom, this)
    this.hide = AFRAME.utils.bind(this.hide, this)
    this.show = AFRAME.utils.bind(this.show, this)

    this.actions = {
      joinRoom: this.joinRoom,
      createRoom: this.createRoom
    }

    this.el.appendChild(this.createPanel())
  },
  update: function () {},
  tick: function () {},
  remove: function () {},
  pause: function () {},
  play: function () {},
  createPanel: function() {
    const pos = this.el.object3D.position
    const scale = this.el.object3D.scale
    const button = { w: 3, h: 0.1, d: 1.5 }
    // TODO: buttons don't move when pressed
    // may need to move button component into a wrapping entity.
    return htmlToElement(`
      <a-entity>
        <a-entity
          position="${pos.x - 1.75} ${pos.y} ${pos.z}"
          id="frame-joinRoom"
          static-body="shape: none"
          shape="shape: box; halfExtents: ${button.w * scale.x / 2} ${button.h * scale.y / 2} ${button.d * scale.z / 2};"
        ></a-entity>
        <a-box
          position="${pos.x - 1.75} ${pos.y} ${pos.z}"
          color="#2a4b85"
          width="${button.w}"
          height="${button.h}"
          depth="${button.d}"
          grid="row: 1; gap: 0.25; cellWidth: 1; cellHeight: 1; hCenter: true;"
          button="frameId: frame-joinRoom; value: joinRoom;"
          dynamic-body="shape: none;"
          shape="shape: box; halfExtents: ${button.w * scale.x / 2} ${button.h * scale.y / 2} ${button.d * scale.z / 2};"
          constraint="target: #frame-joinRoom; type: lock; collideConnected: false;"
          mixin="buttonStyle"
        >
          <a-entity
            position="0 0.05 0"
            gltf-model="#arrow"
          ></a-entity>
          <a-entity
            position="0 0.05 0"
            gltf-model="#home"
          ></a-entity>
        </a-box>

        <a-entity
          position="${pos.x + 1.75} ${pos.y} ${pos.z}"
          id="frame-createRoom"
          static-body="shape: none"
          shape="shape: box; halfExtents: ${button.w * scale.x / 2} ${button.h * scale.y / 2} ${button.d * scale.z / 2};"
        ></a-entity>
        <a-box
          position="${pos.x + 1.75} ${pos.y} ${pos.z}"
          color="#24571f"
          width="${button.w}"
          height="${button.h}"
          depth="${button.d}"
          grid="row: 1; gap: 0.25; cellWidth: 1; cellHeight: 1; hCenter: true;"
          button="value: createRoom;"
          dynamic-body="shape: none;"
          shape="shape: box; halfExtents: ${button.w * scale.x / 2} ${button.h * scale.y / 2} ${button.d * scale.z / 2};"
          constraint="target: #frame-createRoom; type: lock; collideConnected: false;"
          mixin="buttonStyle"
        >
          <a-entity
            position="0 0.05 0"
            gltf-model="#plus"
          ></a-entity>
          <a-entity
            position="0 0.05 0"
            gltf-model="#home"
          ></a-entity>
        </a-box>
      </a-entity>
    `)
  },
  createHexInput: function() {
    const pos = this.originalPos
    return htmlToElement(`
      <a-hex-input
        scale="0.02 0.02 0.02"
        position="${pos.x} ${pos.y} ${pos.z}"
        rotation="45 0 0"
        join-room="on: submit;"
      ></a-hex-input>
    `)
  },
  createRoomIdOutput: function() {
    const pos = this.originalPos
    return htmlToElement(`
      <a-entity
        id="${this.outputId}"
        scale="0.02 0.02 0.02"
        position="${pos.x} ${pos.y} ${pos.z}"
        output=""
        grid="row: 1; gap: 0.5; cellWidth: 1.0; cellHeight: 1.0; hCenter: true;"
      ></a-entity>
    `)
  },
  joinRoom: function() {
    console.log('joinRoom Pressed')
    const hexInput = this.createHexInput()
    const scene = this.el.sceneEl

    this.hide()
    scene.appendChild(hexInput)
  },
  createRoom: function() {
    const socket = this.el.sceneEl.systems['networked-player'].socket
    console.log('createRoom Pressed')

    socket.emit('createRoom', { size: 4 })

    socket.on('newRoom', (msg) => {
      this.hide()
      socket.emit('joinRoom', msg)
      this.outputId = `output-${msg.roomId}`
      this.el.sceneEl.appendChild(this.createRoomIdOutput())

      const output = this.el.sceneEl.querySelector(`#${this.outputId}`)
      output.setAttribute('output', msg.roomId)
    })
  },
  hide: function() {
    this.el.object3D.position.add(new AFRAME.THREE.Vector3(0, -1000, 0))
  },
  show: function() {
    this.el.object3D.position.copy(this.originalPos)
  }
})