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
        ></a-box>
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

    this.handleFullRoom = AFRAME.utils.bind(this.handleFullRoom, this)
    this.handleNoRoom = AFRAME.utils.bind(this.handleNoRoom, this)
    this.handleJoinRoomSuccess = AFRAME.utils.bind(this.handleJoinRoomSuccess, this)

    this.handlePlayerJoin = AFRAME.utils.bind(this.handlePlayerJoin, this)
    this.handlePlayerUpdate = AFRAME.utils.bind(this.handlePlayerUpdate, this)
    this.handlePlayerLeave = AFRAME.utils.bind(this.handlePlayerLeave, this)

    this.handleGameStart = AFRAME.utils.bind(this.handleGameStart, this)
    this.handleGameEnd = AFRAME.utils.bind(this.handleGameEnd, this)

    this.joinRoom = AFRAME.utils.bind(this.joinRoom, this)
    this.emitPlayerUpdate = AFRAME.utils.bind(this.emitPlayerUpdate, this)
    this.attachNetworkedPlayer = AFRAME.utils.bind(this.attachNetworkedPlayer, this)
    this.detachNetworkedPlayer = AFRAME.utils.bind(this.detachNetworkedPlayer, this)
    this.createPart = AFRAME.utils.bind(this.createPart, this)
    this.updatePart = AFRAME.utils.bind(this.updatePart, this)
    this.createRoomIdOutput = AFRAME.utils.bind(this.createRoomIdOutput, this)
    this.getPlayerHeight = AFRAME.utils.bind(this.getPlayerHeight, this)


    this.socket.on('fullRoom', this.handleFullRoom)
    this.socket.on('noRoom', this.handleNoRoom)
    this.socket.on('joinRoomSuccess', this.handleJoinRoomSuccess)

    this.socket.on('playerJoin', this.handlePlayerJoin)
    this.socket.on('playerUpdate', this.handlePlayerUpdate)
    this.socket.on('playerLeave', this.handlePlayerLeave)

    this.socket.on('gameStart', this.handleGameStart)
    this.socket.on('gameEnd', this.handleGameEnd)
  },
  handleFullRoom: function (msg) {
    console.log('Got socket event: fullRoom', msg)
  },
  handleNoRoom: function (msg) {
    console.log('Got socket event: noRoom', msg)
  },
  handleJoinRoomSuccess: function (msg) {
    this.attachNetworkedPlayer(msg)
  },
  handlePlayers: function (msg) {
    console.log('Got socket event: players', msg)
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
  },
  handleGameEnd: function(msg) {
    console.log('game ended: ', msg)
  },
  joinRoom: function (roomId) {
    this.socket.emit('joinRoom', { roomId })
  },
  emitPlayerUpdate: function (msg) {
    this.socket.emit('playerUpdate', msg)
  },
  attachNetworkedPlayer: function (msg) {
    // hide the hex input
    this.el.querySelector('#hexInput').hide()

    // get player parts
    const playerRig = this.el.querySelector('#playerRig')
    const playerHead = this.el.systems.camera.activeCameraEl
    const playerRightHand = this.el.querySelector('#rightHand')
    const playerLeftHand = this.el.querySelector('#leftHand')

    // set player rig offset
    playerRig.object3D.position.add(msg.offset.position)
    playerRig.object3D.rotation.set(
      msg.offset.rotation.x,
      msg.offset.rotation.y,
      msg.offset.rotation.z
    )

    // network player parts
    playerHead && playerHead.setAttribute('networked-player', { part: 'head' })
    playerRightHand && playerRightHand.setAttribute('networked-player', { part: 'rightHand' })
    playerLeftHand && playerLeftHand.setAttribute('networked-player', { part: 'leftHand' })

    // set up player space
    const outputId = `output-${msg.roomId}`
    const outputEl = this.createRoomIdOutput(outputId, msg.offset.position, msg.offset.rotation)
    this.el.appendChild(outputEl)

    const output = this.el.querySelector(`#${outputId}`)
    output.setAttribute('output', msg.roomId)
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
        part.removeEventListener('object3dset', this)
        event.target.object3D.position.copy(msg.position)
        event.target.object3D.quaternion.copy(msg.quaternion)
      })

      this.el.appendChild(part)
    }
  },
  updatePart: function (part, msg) {
    part.object3D.position.copy(msg.position)
    part.object3D.quaternion.copy(msg.quaternion)
  },
  createRoomIdOutput: function(id, pos, rot) {
    const counterPose = getCounterPose(pos, rot, 0.3)
    counterPose.position.y += (this.getPlayerHeight() - 0.3)

    const rotation = new AFRAME.THREE.Euler()
      .setFromQuaternion(counterPose.quaternion)
      .toVector3()
      .multiplyScalar(180 / Math.PI)
    rotation.x += 90
    
    return htmlToElement(`
      <a-entity
        id="${id}"
        scale="0.02 0.02 0.02"
        rotation="${rotation.x} ${rotation.y} ${rotation.z}"
        position="${counterPose.position.x} ${counterPose.position.y} ${counterPose.position.z}"
        output=""
      ></a-entity>
    `)
  },
  getPlayerHeight: function() {
    const cameraPosition = new AFRAME.THREE.Vector3()
    this.el.systems.camera.activeCameraEl.object3D.getWorldPosition(cameraPosition)

    return cameraPosition.y
  }
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
