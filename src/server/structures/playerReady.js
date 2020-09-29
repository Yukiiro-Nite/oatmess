const { getOffsetFromPose } = require("../utils/vectorUtils")
const { multiply } = require("../utils/quaternionUtils")

const red = '#852f2e'
const green = '#24571f'

function playerReady(pose, playerId, gameState) {
  const buttonPosition = getOffsetFromPose(pose, { x: 0, y: 1.0, z: -0.4 })
  const buttonRotation = multiply(pose.rotation, { x: Math.PI / 4, y: 0, z: 0 })
  const indicatorPosition = getOffsetFromPose(pose, { x: 0, y: 2.5, z: 0 })
  const indicatorRotation = multiply(pose.rotation, { x: -Math.PI / 2, y: Math.PI, z: 0 })

  return [
    {
      type: 'static',
      position: buttonPosition,
      rotation: buttonRotation,
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
        name: `statusSwitch-${playerId}`,
        visible: true
      },
      postInit: function (body) {
        const bodyId = body.handle()
        gameState.on('readyChange', (changes) => {
          const playerChange = changes.find(change => change.id === playerId)
          if(playerChange) {
            const buttonColliderId = body.collider(0).handle()
            const meta = this.meta.collider[buttonColliderId]
            if(meta) {
              meta.color = playerChange.state
                ? red
                : green
              meta.button.buttonModel = playerChange.state
                ? '#clear'
                : '#checkmark'
              meta.button.value = playerChange.state
                ? 'not ready'
                : 'ready'
            }
          }
        })
      }
    },
    {
      type: 'static',
      position: indicatorPosition,
      rotation: indicatorRotation,
      meta: {
        name: `statusIndicator-${playerId}`,
        button: {
          iconScale: '0.16 0.16 0.16',
          buttonModel: '#clear'
        },
        geometry: {
          primitive: 'box',
          width: 0.2,
          height: 0.04,
          depth: 0.2,
        },
        material: {
          color: red
        }
      },
      postInit: function (body) {
        const bodyId = body.handle()
        gameState.on('readyChange', (changes) => {
          const playerChange = changes.find(change => change.id === playerId)
          if(playerChange) {
            const meta = this.meta.body[bodyId]
            if(meta) {
              meta.material.color = playerChange.state
                ? green
                : red
              meta.button.buttonModel = playerChange.state
                ? '#checkmark'
                : '#clear'
            }
          }
        })
      }
    },
  ]
}

module.exports = playerReady