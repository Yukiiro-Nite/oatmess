const Path = require('path')
const RapierLoader = require('../server/rapier')
const worldConfig = require('../server/worldConfig')
let engine, engineLoading

exports.config = {
  routes: {
    get: {
      '/socket.io.js': (req, res) => {
        const path = Path.resolve(process.cwd(), './node_modules/socket.io-client/dist/socket.io.js');
        res.sendFile(path);
      },
    }
  },
  socketEvents: {
    connection(io, socket) {
      if(!engine && !engineLoading) {
        engineLoading = RapierLoader.ready.then(({ RapierEngine, Rapier }) => {
          engine = new RapierEngine(0, -9.8, 0)

          const namedBodies = {}
          worldConfig.bodies.forEach((bodyConfig) => {
            const body = engine.createRigidBody(bodyConfig)
            if(bodyConfig.effect && bodyConfig.effect instanceof Function) {
              bodyConfig.effect(body, Rapier)
            }
            if(bodyConfig.name) {
              namedBodies[bodyConfig.name] = body
            }
          })

          worldConfig.joints.forEach((joint) => {
            joint.handle1 = namedBodies[joint.body1].handle()
            joint.handle2 = namedBodies[joint.body2].handle()

            engine.createJoint(joint)
          })

          engine.on('worldUpdate', (event) => io.emit('worldUpdate', event))

          engine.start(1000 / 30)
        })
      } else {
        engineLoading.then(() => {
          socket.emit('worldUpdate', engine.getWorldState())
        })
      }

      const id = socket.id
      log(`connection from ${id}`)
      socket.broadcast.emit('playerJoin', { id })
    },
    logMessage(io, socket, msg) {
      const id = socket.id
      log(`[${id}] ${msg}`)
    },
    playerUpdate(io, socket, msg) {
      const id = socket.id
      engine.updateGrabJoints(id, msg)
      socket.broadcast.emit('playerUpdate', { ...msg, id })
    },
    grab(io, socket, msg) {
      msg.id = socket.id
      // log(`[${msg.id}] grabbed object ${msg.bodyId}`)
      engine.createGrabJoint(msg)
    },
    release(io, socket, msg) {
      msg.id = socket.id
      // log(`[${msg.id}] released object ${msg.bodyId}`)
      const grabbingBodyId = engine.removeGrabJoint(msg)
      if(grabbingBodyId !== undefined) {
        io.emit('removeBody', { id: grabbingBodyId })
      }
    },
    removeBodyByCollider(io, socket, msg) {
      const bodyId = engine.removeRigidBodyByCollider(msg.colliderId)
      if(bodyId !== undefined) {
        io.emit('removeBody',  { id: bodyId })
      }
    },
    disconnecting(io, socket) {
      const id = socket.id
      engine.removePlayerGrabJoints(id)
      socket.broadcast.emit('playerLeave', { id })
    },
    disconnect(io, socket) {
      const id = socket.id
      log(`disconnect from ${id}`)
    }
  }
}

function log(...args) {
  const time = (new Date()).toTimeString().slice(0,8)
  console.log(`[${time}] `, ...args)
}


let last = 0
function generateId() {
  let next = Date.now()
  if(next <= last) {
    last++
  } else {
    last = next
  }

  return last.toString(16).toUpperCase()
}