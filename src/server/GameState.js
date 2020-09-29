const { EventEmitter } = require('events')
const defaultFrequency = 2000

class GameState extends EventEmitter {
  constructor(roundDuration, spawnFrequency = defaultFrequency) {
    super()
    this.players = {}
    this.started = false
    this.roundDuration = roundDuration
    this.spawnFrequency = spawnFrequency
  }

  addPlayer(id) {
    this.players[id] = {
      id,
      score: 0,
      ready: false
    }
  }

  removePlayer(id) {
    delete this.players[id]
  }

  addScore(id, value) {
    value = parseInt(value)
    const canAddScore = this.players[id]
      && !isNaN(value)
      && this.started
    if(canAddScore) {
      this.players[id].score += value
    }
  }

  setReady(id, state) {
    state = Boolean(state)
    if(this.players[id]) {
      this.players[id].ready = state
      this.emit('readyChange', [{ id, state }])
      this.startGame()
    }
  }

  resetPlayers() {
    Object.values(this.players).forEach(player => {
      player.score = 0
      player.ready = false
    })

    const readyState = Object.values(this.players)
      .map(player => ({ id: player.id, ready: player.ready }))

    this.emit('readyChange', readyState)
  }

  startGame() {
    const allReady = Object.values(this.players).every(player => player.ready)
    if(allReady) {
      const startTime = Date.now()
      this.started = setTimeout(() => this.endGame(), this.roundDuration)
      this.emit('gameStart', { startTime, roundDuration: this.roundDuration })
    }
  }

  endGame() {
    clearTimeout(this.started)
    this.started = false
    const scores = Object.values(this.players)
      .map(player => player.score)
    const highestScore = Math.max(...scores)
    const winners = Object.values(this.players)
      .filter(player => player.score === highestScore)
      .map(player => player.id)
    
    this.emit('gameEnd', { winners })

    this.resetPlayers()
  }
}

module.exports = GameState