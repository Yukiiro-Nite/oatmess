const extraCubes = new Array(10).fill().map((_, i) => ({
  type: 'dynamic',
  position: { x: 0, y: 0.05 + i * 0.1, z: -1 },
  colliders: [{
    type: 'cuboid',
    width: 0.1,
    height: 0.1,
    depth: 0.1,
    density: 1,
    meta: {
      class: 'grabbable'
    },
  }],
  meta: {
    grabbable: ''
  },
}))

const worldConfig = {
  bodies: [
    {
      name: 'ground',
      type: 'static',
      colliders: [{
        type: 'cuboid',
        friction: 0.5,
        width: 10,
        height: 0.1,
        depth: 10,
        meta: {
          color: '#CCCCCC'
        }
      }]
    },
    {
      type: 'dynamic',
      position: { x: 0, y: 5, z: 0 },
      colliders: [{
        type: 'cuboid',
        width: 0.5,
        height: 0.5,
        depth: 0.5,
        density: 1,
        meta: {
          class: 'grabbable'
        },
      }],
      meta: {
        grabbable: ''
      },
      effect: (body, Rapier) => {
        body.applyTorqueImpulse(new Rapier.Vector(0.1, 0, 0), true)
      }
    },
    ...extraCubes
  ],
  joints: []
}

function ballChain(pos, size, length, density) {
  return {
    bodies: new Array(length).fill().map((_, i) => ({
      name: `chainLink_${i}`,
      type: 'dynamic',
      position: { x: pos.x + i*size, y: pos.y, z: pos.z },
      colliders: [{
        type: 'ball',
        density,
        friction: 0.5,
        restitution: 0.5,
        radius: size / 2,
        meta: {
          color: '#cc5555',
          class: 'grabbable'
        }
      }],
      meta: {
        grabbable: ''
      }
    })),
    joints: new Array(length-1).fill().map((_, i) => ({
      type: 'ball',
      body1: `chainLink_${i}`,
      body2: `chainLink_${i+1}`,
    }))
  }
}

module.exports = worldConfig