const Path = require('path')
const RapierEngine = require('../server/rapier')
let engine

// // Hack to get world.step working
// const { performance } = require('perf_hooks');
// globalThis.performance = performance;
// // end hack
// const RapierLoader = import('@dimforge/rapier3d')
// let IO
// let engine
// RapierLoader.then(RAPIER => {
//   let world = new RAPIER.World(0.0, -9.81, 0.0);

//   let groundRigidBodyDesc = new RAPIER.RigidBodyDesc("static");
//   let groundRigidBody = world.createRigidBody(groundRigidBodyDesc);
//   let groundColliderDesc = RAPIER.ColliderDesc.cuboid(10.0, 0.1, 10.0);
//   groundColliderDesc.setTranslation(0, -0.05, 0);
//   groundRigidBody.createCollider(groundColliderDesc);

//   let rigidBodyDesc = new RAPIER.RigidBodyDesc("dynamic");
//   rigidBodyDesc.setTranslation(0.0, 5.0, 0.0);
//   let rigidBody = world.createRigidBody(rigidBodyDesc);

//   let colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
//   colliderDesc.density = 1.0;
//   let collider = rigidBody.createCollider(colliderDesc);
  
//   rigidBody.applyTorqueImpulse(new RAPIER.Vector(5, 0, 0), true)

//   // Game loop. Replace by your own game loop system.
//   let gameLoop = () => {
//     world.step();

//     const serializedBodies = []

//     IO && IO.emit('worldUpdate', [ serializeBody(rigidBody) ])

//     setTimeout(gameLoop, 1000 / 20);
//   };

//   gameLoop();
// })

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
        engine = RapierEngine.start(io)
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