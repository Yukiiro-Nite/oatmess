const Path = require('path')
const RapierLoader = require('../server/rapier')
let engine

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
      if(!engine) {
        RapierLoader.ready.then(({ RapierEngine, Rapier }) => {
          engine = new RapierEngine(0, -9.8, 0)

          const ground = engine.createRigidBody({
            type: 'static',
            colliders: [{
              type: 'cuboid',
              width: 10,
              height: 0.1,
              depth: 10
            }]
          })

          const testObject = engine.createRigidBody({
            type: 'dynamic',
            position: { x: 0, y: 5, z: 0 },
            colliders: [{
              type: 'cuboid',
              width: 0.5,
              height: 0.5,
              depth: 0.5,
              density: 1
            }]
          })

          testObject.applyTorqueImpulse(new Rapier.Vector(0.1, 0, 0), true)

          engine.on('worldUpdate', (event) => io.emit('worldUpdate', event))

          engine.start(1000 / 20)
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
      socket.broadcast.emit('playerUpdate', { ...msg, id })
    },
    disconnecting(io, socket) {
      const id = socket.id
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