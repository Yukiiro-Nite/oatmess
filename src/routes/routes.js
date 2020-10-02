const second = 1000
const TPS = second/30

const Path = require('path')
const RapierLoader = require('../server/rapier')
const worldConfig = require('../server/worldConfig')

const players = {}
let bodies
let engine, engineReady

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
      const id = socket.id
      log(`connection from ${id}`)
      players[id] = { id }
      if(!engine && !engineReady) {
        engineReady = RapierLoader.ready.then(({ RapierEngine, Rapier }) => {
          engine = new RapierEngine(0, -9.8, 0)
          const ids = engine.addToWorld(worldConfig)
          bodies = ids.bodies
          engine.on('worldUpdate', (event) => io.emit('worldUpdate', event))
          engine.on('removeBody', (event) => io.emit('removeBody', event))

          engine.start(TPS)
        })
      }

      engineReady.then(() => {
        if(!engine.running) {
          engine.start(TPS)
        }
        socket.emit('worldUpdate', engine.getWorldState())
      })
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
      if(engine) {
        engine.createGrabJoint(msg)
      }
    },
    release(io, socket, msg) {
      msg.id = socket.id
      if(engine) {
        engine.removeGrabJoint(msg)  
      }
    },
    resetRoom(io, socket) {
      if(engine && bodies && bodies.length > 0) {
        bodies.forEach(bodyId => {
          engine.removeRigidBodyById(bodyId)
        })

        const ids = engine.addToWorld(worldConfig)
        bodies = ids.bodies

        io.emit('worldUpdate', engine.getWorldState())
      }
    },
    disconnecting(io, socket) {
      const id = socket.id
      delete players[id]
      socket.broadcast.emit('playerLeave', { id })
      if(Object.keys(players).length === 0 ) {
        engine.stop()
      }
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