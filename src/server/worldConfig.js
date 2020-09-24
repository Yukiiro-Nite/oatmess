const extraCubes = new Array(20).fill().map((_, i) => ({
  type: 'dynamic',
  position: { x: 1, y: 0.035 + i * 0.07, z: 0 },
  colliders: [{
    type: 'cuboid',
    width: 0.07,
    height: 0.07,
    depth: 0.07,
    density: 1,
    meta: {
      class: 'grabbable',
      removable: true
    },
  }],
  meta: {
    grabbable: true,
    'gltf-model': '#apple'
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
    ...extraCubes,
    ...pot(
      { x: 0, y: 0, z: -1 },
      { width: 0.4, height: 0.4, depth: 0.4, thickness: 0.02 }
    )
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

function pot(pos, size) {
  const { x, y, z } = pos
  const {
    width: w,
    height: h,
    depth: d,
    thickness: t
  } = size;

  return [
    {
      name: 'potBody',
      type: 'static',
      position: { x, y: y + h/2, z },
      colliders: [
        {
          // bottom
          type: 'cuboid',
          position: { x: 0, y: -w/2 + t/2, z: 0 },
          width: w - 2*t,
          height: t,
          depth: d - 2*t,
          density: 1,
          meta: { color: '#807e84' }
        },
        {
          // front
          type: 'cuboid',
          position: { x: 0, y: 0, z: d/2 - t/2 },
          width: w,
          height: h,
          depth: t,
          density: 1,
          meta: { color: '#807e84' }
        },
        {
          // back
          type: 'cuboid',
          position: { x: 0, y: 0, z: -d/2 + t/2 },
          width: w,
          height: h,
          depth: t,
          density: 1,
          meta: { color: '#807e84' }
        },
        {
          // right
          type: 'cuboid',
          position: { x: w/2 - t/2, y: 0, z: 0 },
          width: t,
          height: h,
          depth: d - 2*t,
          density: 1,
          meta: { color: '#807e84' }
        },
        {
          // left
          type: 'cuboid',
          position: { x: -w/2 + t/2, y: 0, z: 0 },
          width: t,
          height: h,
          depth: d - 2*t,
          density: 1,
          meta: { color: '#807e84' }
        }
      ]
    },
    {
      name: 'insidePot',
      type: 'static',
      position: { x, y: y + h/2, z },
      colliders: [{
        type: 'cuboid',
        width: w - 2*t,
        height: h - 2*t,
        depth: d - 2*t,
        density: 1,
        meta: { color: '#442a1e' }
      }],
      meta: {
        'remove-collided': ''
      }
    }
  ]
}

module.exports = worldConfig