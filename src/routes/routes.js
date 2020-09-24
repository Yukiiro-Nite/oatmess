const Path = require('path')
const RapierLoader = require('../server/rapier')
const worldConfig = require('../server/worldConfig')
const structures = require('../server/structures')
const { getPlayerPlacement, getNextIndex } = require('./playerPosition')
/**
 * rooms = {
 *   [roomId]: {
 *     players: {
 *       [playerId]: {
 *       }
 *     }
 *     isFull: boolean
 *     size: int,
 *     owner: string,
 *     engineReady: promise,
 *     engine: RapierEngine
 *   }
 * }
 */
const rooms = {}

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
    },
    logMessage(io, socket, msg) {
      const id = socket.id
      log(`[${id}] ${msg}`)
    },
    joinRoom(io, socket, msg) {
      const id = socket.id
      const roomId = msg.roomId
      const room = rooms[roomId]

      if(room && !room.isFull) {
        const index = getNextIndex(Object.values(room.players))
        const offset = getPlayerPlacement(index, room.size, 2)
        const newPlayer = { id, roomId, index, offset }
        room.players[id] = newPlayer
        room.isFull = Object.keys(room.players).length >= room.size
        socket.join(roomId)
        socket.to(roomId).emit('playerJoin', newPlayer)
        socket.emit('joinRoomSuccess', newPlayer)
        socket.emit('players', room.players)
        if(room.engine) {
          const spaceConfig = structures.playerSpace(newPlayer)
          room.engine.addToWorld(spaceConfig)
          socket.emit('worldUpdate', room.engine.getWorldState())
        }
        log(`[${id}] joined room ${roomId}`)
      } else if(room && room.isFull) {
        socket.emit('fullRoom', msg)
        log(`[${id}] could not join room ${roomId}: room is full.`)
      } else {
        socket.emit('noRoom', msg)
        log(`[${id}] could not join room ${roomId}: room does not exist.`)
      }
    },
    createRoom(io, socket, msg) {
      const id = socket.id
      const roomId = generateId()

      log(`[${id}] created room ${roomId}`)
      
      rooms[roomId] = {
        id: roomId,
        players: {},
        isFull: false,
        size: msg.size,
        owner: id
      }

      const engineReady = RapierLoader.ready.then(({ RapierEngine, Rapier }) => {
        const engine = new RapierEngine(0, -9.8, 0)
        engine.addToWorld(worldConfig)
        engine.on('worldUpdate', (event) => io.to(roomId).emit('worldUpdate', event))
        engine.on('removeBody', (event) => io.to(roomId).emit('removeBody', event))
        engine.start(1000 / 30)
        rooms[roomId].engine = engine

        return engine
      })

      rooms[roomId].engineReady = engineReady

      socket.emit('newRoom', { roomId })
    },
    playerUpdate(io, socket, msg) {
      const id = socket.id
      forRooms(socket, room => {
        room.players[id].parts = msg.parts
        room.engine.updateGrabJoints(id, msg)
        socket.to(room.id).emit('playerUpdate', { ...msg, id })
      })
    },
    grab(io, socket, msg) {
      msg.id = socket.id
      forRooms(socket, room => {
        if(room.engine) {
          room.engine.createGrabJoint(msg)
        }
      })
    },
    release(io, socket, msg) {
      msg.id = socket.id
      forRooms(socket, room => {
        if(room.engine) {
          room.engine.removeGrabJoint(msg)  
        }
      })
    },
    removeBodyByCollider(io, socket, msg) {
      forRooms(socket, room => {
        if(room.engine) {
          room.engine.removeRigidBodyByCollider(msg.colliderId)
        }
      })
    },
    disconnecting(io, socket) {
      const id = socket.id
      forRooms(socket, room => {
        if(room.engine) {
          room.engine.removePlayerGrabJoints(id)
        }
        delete room.players[id]
        room.isFull = Object.keys(room.players).length >= room.size
        socket.to(room.id).emit('playerLeave', { id })
      })
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

function forRooms(socket, forEachFn) {
  const roomIds = Object.keys(socket.rooms).filter(key => key !== socket.id)
  roomIds.forEach((roomId) => {
    const room = rooms[roomId]
    if(room) {
      forEachFn(room)
    }
  })
}