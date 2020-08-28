const buttonActions = {
  joinRoom: (event) => {
    console.log('Join Room Pressed')
    const socket = event.target.sceneEl.systems['networked-player'].socket
    socket.emit('logMessage', 'Join Room Event')
  },
  createRoom: (event) => {
    console.log('Create Room Pressed')
    const socket = event.target.sceneEl.systems['networked-player'].socket
    socket.emit('logMessage', 'Create Room Event')
  }
}