const { getOffsetFromPose } = require("../utils/vectorUtils")
const { multiply } = require("../utils/quaternionUtils")

const red = '#852f2e'
const green = '#24571f'

function playerReady(pose, playerId, gameState) {
  const buttonPosition = getOffsetFromPose(pose, { x: 0, y: 1.0, z: -0.4 })
  const buttonRotation = multiply(pose.rotation, { x: 0, y: 0, z: 0 })
  const indicatorPosition = getOffsetFromPose(pose, { x: 0, y: 2.5, z: 0 })
  const indicatorRotation = multiply(pose.rotation, { x: -Math.PI / 2, y: Math.PI, z: 0 })

  return [
    readyButton(buttonPosition, buttonRotation, playerId, gameState),
    notReadyIndicator(indicatorPosition, indicatorRotation, playerId, gameState)
  ]
}

const button = (position, rotation, playerId) => ({
  type: 'static',
  position,
  rotation,
  colliders: [{
    type: 'cuboid',
    width: 0.1,
    height: 0.02,
    depth: 0.1,
    meta: {
      button: {
        iconScale: '0.08 0.08 0.08',
        buttonModel: '#checkmark',
        value: 'ready'
      },
      mixin: 'buttonStyle',
      color: green,
      'player-ready': 'on: click;'
    }
  }],
  meta: {
    class: 'statusSwitch',
    name: `statusSwitch-${playerId}`,
    visible: true
  }
})

function readyButton(position, rotation, playerId, gameState) {
  const buttonConfig = button(position, rotation, playerId)

  buttonConfig.postInit = function (body) {
    const bodyId = body.handle()
    const engine = this
    gameState.on('readyChange', function swapToNotReady(changes) {
      const playerChange = changes.find(change => change.id === playerId)
      if(playerChange && playerChange.state) {
        gameState.removeListener('readyChange', swapToNotReady)
        engine.removeRigidBodyById(bodyId)
        const nextButton = notReadyButton(position, rotation, playerId, gameState)
        engine.addToWorld({ bodies: [nextButton] })
      }
    })
  }

  return buttonConfig
}

function notReadyButton(position, rotation, playerId, gameState) {
  const buttonConfig = button(position, rotation, playerId)

  buttonConfig.colliders[0].meta.button.buttonModel = '#clear'
  buttonConfig.colliders[0].meta.button.value = 'not ready'
  buttonConfig.colliders[0].meta.color = red
  buttonConfig.postInit = function (body) {
    const bodyId = body.handle()
    const engine = this
    gameState.on('readyChange', function swapToReady(changes) {
      const playerChange = changes.find(change => change.id === playerId)
      if(playerChange && !playerChange.state) {
        gameState.removeListener('readyChange', swapToReady)
        engine.removeRigidBodyById(bodyId)
        const nextButton = readyButton(position, rotation, playerId, gameState)
        engine.addToWorld({ bodies: [nextButton] })
      }
    })
  }

  return buttonConfig
}

const indicator = (position, rotation, playerId) => ({
  type: 'static',
  position,
  rotation,
  meta: {
    class: 'statusIndicator',
    name: `statusIndicator-${playerId}`,
    button: {
      iconScale: '0.16 0.16 0.16',
      buttonModel: '#clear'
    },
    // used for positioning the button. Normally button expects to be on an a-box
    // TODO: Replace button height code to use geometry instead of attributes
    height: 0.04,
    geometry: {
      primitive: 'box',
      width: 0.2,
      height: 0.04,
      depth: 0.2,
    },
    material: {
      color: red
    }
  }
})

function readyIndicator(position, rotation, playerId, gameState) {
  const indicatorConfig = indicator(position, rotation, playerId)

  indicatorConfig.meta.button.buttonModel = '#checkmark'
  indicatorConfig.meta.material.color = green
  indicatorConfig.postInit = function (body) {
    const bodyId = body.handle()
    const engine = this
    gameState.on('readyChange', function swapToReady(changes) {
      const playerChange = changes.find(change => change.id === playerId)
      if(playerChange && !playerChange.state) {
        gameState.removeListener('readyChange', swapToReady)
        engine.removeRigidBodyById(bodyId)
        const nextButton = notReadyIndicator(position, rotation, playerId, gameState)
        engine.addToWorld({ bodies: [nextButton] })
      }
    })
  }

  return indicatorConfig
}

function notReadyIndicator(position, rotation, playerId, gameState) {
  const indicatorConfig = indicator(position, rotation, playerId)

  indicatorConfig.postInit = function (body) {
    const bodyId = body.handle()
    const engine = this
    gameState.on('readyChange', function swapToReady(changes) {
      const playerChange = changes.find(change => change.id === playerId)
      if(playerChange && playerChange.state) {
        gameState.removeListener('readyChange', swapToReady)
        engine.removeRigidBodyById(bodyId)
        const nextButton = readyIndicator(position, rotation, playerId, gameState)
        engine.addToWorld({ bodies: [nextButton] })
      }
    })
  }

  return indicatorConfig
}

module.exports = playerReady