const Path = require('path')
/**
 * rooms = {
 *   [roomId]: {
 *     players: {
 *       [playerId]: {
 *       }
 *     }
 *     isFull: boolean
 *     size: int,
 *     owner: string
 *   }
 * }
 */
const rooms = {}

exports.config = {
  routes: {
    get: {
      '/socket.io.js': (req, res) => {
        const path = Path.resolve(__dirname, '../../node_modules/socket.io-client/dist/socket.io.js');
        res.sendFile(path);
      },
    }
  },
  socketEvents: {
    connection(io, socket) {
      const id = socket.id
      log(`connection from ${id}`)
    },
    joinRoom(io, socket, msg) {
      const id = socket.id
      const roomId = msg.roomId
      const room = rooms[roomId]
      if(room && !room.isFull) {
        room.players[id] = {}
        room.isFull = Object.keys(room.players).length >= room.size
        socket.join(roomId)
        socket.to(roomId).emit('playerJoin', { id })
      } else if(room && room.isFull) {
        socket.emit('fullRoom', msg)
      } else {
        socket.emit('noRoom', msg)
      }
    },
    createRoom(io, socket, msg) {
      const id = socket.id
      const roomId = generateId()
      
      rooms[roomId] = {
        players: {},
        isFull: false,
        size: msg.size,
        owner: id
      }

      socket.emit('newRoom', { roomId })
    },
    playerUpdate(io, socket, msg) {
      const id = socket.id
      const roomIds = Object.keys(socket.rooms).filter(key => key !== id)
      roomIds.forEach(roomId => {
        const room = rooms[roomId]
        if(room) {
          room.players[id] = msg
          socket.to(roomId).emit('playerUpdate', { ...msg, id })
        }
      })
    },
    disconnecting(io, socket) {
      const id = socket.id
      const roomIds = Object.keys(socket.rooms).filter(key => key !== id)
      roomIds.forEach(roomId => {
        const room = rooms[roomId]
        if(room) {
          delete room.players[id]
          socket.to(roomId).emit('playerLeave', { id })
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

  return last.toString(16)
}