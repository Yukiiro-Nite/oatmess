const defaultRotation = { x: 0, y: 0, z: 0, w: 0 }

/**
 * Returns a list of rigid body configs that create a pot.
 * @param {Vec3} pos - Position of the pot.
 * @param {Vec4} rot - Quaternion rotation of the pot.
 * @param {Object} size - Size of the pot.
 * @param {number} size.width - Width of the pot.
 * @param {number} size.height - Height of the pot.
 * @param {number} size.depth - Depth of the pot.
 * @param {number} size.thickness - Thickness of the walls of the pot.
 */
function pot(pos, rot = defaultRotation, size) {
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
      rotation: rot,
      colliders: [
        {
          // bottom
          type: 'cuboid',
          position: { x: 0, y: -h/2 + t/2, z: 0 },
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
      rotation: rot,
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

module.exports = pot