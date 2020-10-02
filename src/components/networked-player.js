AFRAME.registerSystem('networked-player', {
  schema: {},
  parts: {
    head: function (id) {
      return htmlToElement(`
        <a-box
          id="${id}"
          height="0.25"
          width="0.15"
          depth="0.3"
          color="orange"
        >
        </a-box>
      `)
    },
    rightHand: function (id) {
      return htmlToElement(`
        <a-box
          id="${id}"
          height="0.07"
          width="0.02"
          depth="0.18"
          color="orange"
        ></a-box>
      `)
    },
    leftHand: function (id) {
      return htmlToElement(`
        <a-box
          id="${id}"
          height="0.07"
          width="0.02"
          depth="0.18"
          color="orange"
        ></a-box>
      `)
    }
  },
  init: function () {
    this.socket = io()

    this.handlePlayerJoin = AFRAME.utils.bind(this.handlePlayerJoin, this)
    this.handlePlayerUpdate = AFRAME.utils.bind(this.handlePlayerUpdate, this)
    this.handlePlayerLeave = AFRAME.utils.bind(this.handlePlayerLeave, this)

    this.emitPlayerUpdate = AFRAME.utils.bind(this.emitPlayerUpdate, this)
    this.attachNetworkedPlayer = AFRAME.utils.bind(this.attachNetworkedPlayer, this)
    this.detachNetworkedPlayer = AFRAME.utils.bind(this.detachNetworkedPlayer, this)
    this.createPart = AFRAME.utils.bind(this.createPart, this)
    this.updatePart = AFRAME.utils.bind(this.updatePart, this)
    this.getPlayerHeight = AFRAME.utils.bind(this.getPlayerHeight, this)

    this.socket.on('playerJoin', this.handlePlayerJoin)
    this.socket.on('playerUpdate', this.handlePlayerUpdate)
    this.socket.on('playerLeave', this.handlePlayerLeave)

    setTimeout(() => {
      this.attachNetworkedPlayer()
    }, 100)
  },
  handlePlayerJoin: function (msg) {
    console.log('Got socket event: playerJoin', msg)
  },
  handlePlayerUpdate: function (msg) {
    msg.parts.forEach((partMsg) => {
      const partId = `${partMsg.part}-${msg.id}`
      const part = this.el.querySelector('#' + partId)

      if(!part) {
        this.createPart(partId, partMsg)
      } else {
        this.updatePart(part, partMsg)
      }
    })
  },
  handlePlayerLeave: function (msg) {
    console.log('Got socket event: playerLeave', msg)
    const playerHead = this.el.querySelector(`#head-${msg.id}`)
    const playerRightHand = this.el.querySelector(`#rightHand-${msg.id}`)
    const playerLeftHand = this.el.querySelector(`#leftHand-${msg.id}`)

    playerHead && this.el.removeChild(playerHead)
    playerRightHand && this.el.removeChild(playerRightHand)
    playerLeftHand && this.el.removeChild(playerLeftHand)
  },
  handleGameStart: function(msg) {
    console.log('game started: ', msg)
    setTimeout(() => this.setPlayerStatusVisibility(false), 500)

    if(this.lastWinners && this.lastWinners.length > 0) {
      this.lastWinners.forEach((winnerId) => {
        const winnerEl = winnerId === this.id
          ? this.el.querySelector('#camera .crownMount')
          : this.el.querySelector(`#head-${winnerId} .crownMount`)
        winnerEl.removeAttribute('crown')
      })
    }
  },
  handleGameEnd: function(msg) {
    setTimeout(() => this.setPlayerStatusVisibility(true), 500)
    this.lastWinners = msg.winners;
    msg.winners.forEach((winnerId) => {
      const winnerEl = winnerId === this.id
          ? this.el.querySelector('#camera .crownMount')
          : this.el.querySelector(`#head-${winnerId} .crownMount`)
      winnerEl.setAttribute('crown', true)
    })
    console.log('game ended: ', msg)
  },
  joinRoom: function (roomId) {
    this.socket.emit('joinRoom', { roomId })
  },
  emitPlayerUpdate: function (msg) {
    this.socket.emit('playerUpdate', msg)
  },
  attachNetworkedPlayer: function () {
    // get player parts
    const playerHead = this.el.systems.camera.activeCameraEl
    const playerRightHand = this.el.querySelector('#rightHand')
    const playerLeftHand = this.el.querySelector('#leftHand')

    // network player parts
    playerHead && playerHead.setAttribute('networked-player', { part: 'head' })
    playerRightHand && playerRightHand.setAttribute('networked-player', { part: 'rightHand' })
    playerLeftHand && playerLeftHand.setAttribute('networked-player', { part: 'leftHand' })
  },
  detachNetworkedPlayer: function () {
    const playerHead = this.el.systems.camera.activeCameraEl
    const playerRightHand = this.el.querySelector('#rightHand')
    const playerLeftHand = this.el.querySelector('#leftHand')
    
    playerHead && playerHead.removeAttribute('networked-player')
    playerRightHand && playerRightHand.removeAttribute('networked-player')
    playerLeftHand && playerLeftHand.removeAttribute('networked-player')
  },
  createPart: function (id, msg) {
    const partFn = this.parts[msg.part]

    if(partFn && partFn instanceof Function) {
      const part = partFn(id)

      part.addEventListener('object3dset', function (event) {
        if(event.target === part) {
          part.removeEventListener('object3dset', this)
          event.target.object3D.position.copy(msg.position)
          event.target.object3D.quaternion.copy(msg.quaternion)
        }
      })

      this.el.appendChild(part)
    }
  },
  updatePart: function (part, msg) {
    part.object3D.position.copy(msg.position)
    part.object3D.quaternion.copy(msg.quaternion)
  },
  getPlayerHeight: function() {
    const cameraPosition = new AFRAME.THREE.Vector3()
    this.el.systems.camera.activeCameraEl.object3D.getWorldPosition(cameraPosition)

    return cameraPosition.y
  },
});

AFRAME.registerComponent('networked-player', {
  schema: {
    part: { type: 'string' },
    positionThreshold: { type: 'number', default: 0.05},
    rotationThreshold: { type: 'number', default: 0.1}
  },
  init: function () {
    this.posePosition = new AFRAME.THREE.Vector3()
    this.poseQuaternion = new AFRAME.THREE.Quaternion()

    this.poseChanged = AFRAME.utils.bind(this.poseChanged, this)
    this.getPose = AFRAME.utils.bind(this.getPose, this)
    this.serializePose = AFRAME.utils.bind(this.serializePose, this)

    this.oldPose = this.getPose()
  },
  update: function () {},
  tick: function () {
    if(this.poseChanged()) {
      this.system.emitPlayerUpdate({
        parts: [
          this.serializePose(this.getPose())
        ]
      })
    }
  },
  remove: function () {},
  pause: function () {},
  play: function () {},
  poseChanged: function () {
    let changed = false

    if(this.el.object3D.position.distanceTo(this.oldPose.position) >= this.data.positionThreshold) {
      changed = true
    }

    if(this.el.object3D.quaternion.angleTo(this.oldPose.quaternion) >= this.data.rotationThreshold) {
      changed = true
    }

    if(changed) {
      this.oldPose = this.getPose()
    }

    return changed
  },
  getPose: function () {
    this.el.object3D.getWorldPosition(this.posePosition)
    this.el.object3D.getWorldQuaternion(this.poseQuaternion)

    return {
      part: this.data.part,
      position: this.posePosition,
      quaternion: this.poseQuaternion
    }
  },
  serializePose: function (pose) {
    // for some reason, when a quaternion is serialized,
    // we only get the _x, _y, _z, and _w components.
    // when the message goes to other clients, they are expecting
    // x, y, z, and w components, and the rotation was not getting applied.
    // because of that, we have to do this serialization.
    pose.quaternion = {
      x: pose.quaternion.x,
      y: pose.quaternion.y,
      z: pose.quaternion.z,
      w: pose.quaternion.w
    }

    return pose
  }
});
