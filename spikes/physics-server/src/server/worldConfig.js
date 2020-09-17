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
    {
      name: 'ball1',
      type: 'dynamic',
      position: { x:  0, y: 7, z: 0 },
      colliders: [{
        type: 'ball',
        density: 1,
        friction: 0.5,
        restitution: 0.5,
        radius: 0.25,
        meta: {
          color: '#cc5555',
          class: 'grabbable'
        }
      }],
      meta: {
        grabbable: ''
      }
    },
    {
      name: 'ball2',
      type: 'dynamic',
      position: { x:  0, y: 7.5, z: 0 },
      colliders: [{
        type: 'ball',
        density: 1,
        friction: 0.5,
        restitution: 0.5,
        radius: 0.25,
        meta: {
          color: '#cc5555',
          class: 'grabbable'
        }
      }],
      meta: {
        grabbable: ''
      }
    }
  ],
  joints: [
    {
      type: 'ball',
      body1: 'ball1',
      body2: 'ball2'
    }
  ]
}

module.exports = worldConfig