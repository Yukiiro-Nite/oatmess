const second = 1000
const minute = 60 * second
const TPS = second/30

const Path = require('path')
const RapierLoader = require('../server/rapier')
const worldConfig = require('../server/worldConfig')
const structures = require('../server/structures')
const { getPlayerPlacement, getNextIndex } = require('./playerPosition')
const GameState = require('../server/GameState')
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
        room.gameState.addPlayer(id)
        socket.join(roomId)
        socket.to(roomId).emit('playerJoin', newPlayer)
        socket.emit('joinRoomSuccess', newPlayer)
        socket.emit('players', room.players)
        if(room.engine) {
          const spaceConfig = structures.playerSpace(newPlayer, room.gameState)
          const structureIds = room.engine.addToWorld(spaceConfig)
          newPlayer.space = structureIds
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

      if(room.engine && !room.engine.running) {
        room.engine.start(TPS)
      }
    },
    createRoom(io, socket, msg) {
      const id = socket.id
      const roomId = generateId()

      log(`[${id}] created room ${roomId}`)
      const gameState = new GameState(0.5 * minute)

      gameState.on('gameStart', (event) => io.to(roomId).emit('gameStart', event))
      gameState.on('gameEnd', (event) => io.to(roomId).emit('gameEnd', event))
      
      rooms[roomId] = {
        id: roomId,
        players: {},
        isFull: false,
        size: msg.size,
        owner: id,
        gameState
      }

      const engineReady = RapierLoader.ready.then(({ RapierEngine, Rapier }) => {
        const engine = new RapierEngine(0, -9.8, 0)
        engine.addToWorld(worldConfig)
        engine.on('worldUpdate', (event) => io.to(roomId).emit('worldUpdate', event))
        engine.on('removeBody', (event) => io.to(roomId).emit('removeBody', event))
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
    playerReady(io,  socket, msg) {
      forRooms(socket, room => {
        room.gameState.setReady(socket.id, msg.state)
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
    disconnecting(io, socket) {
      const id = socket.id
      forRooms(socket, room => {
        room.gameState.removePlayer(id)
        if(room.engine) {
          const playerSpace = room.players[id].space
          room.engine.removePlayerGrabJoints(id)
          playerSpace.bodies.forEach((bodyId) => {
            room.engine.removeRigidBodyById(bodyId)
          })
        }
        delete room.players[id]
        room.isFull = Object.keys(room.players).length >= room.size
        socket.to(room.id).emit('playerLeave', { id })

        if(Object.keys(room.players).length === 0) {
          room.engine.stop()
          room.gameState.endGame()
        }
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