const defaultRoomMeta = {
  room: {},
  floor: { color: '#fed6c1' },
  ceiling: { color: '#fffafe' },
  walls: { color: '#cbc289' }
}

/**
 * Returns a list of rigid body configs that create a room.
 * @param {Vec3} pos - Position of the room.
 * @param {Vec4} rot - Quaternion rotation of the room.
 * @param {Object} size - Size of the room.
 * @param {number} size.width - Width of the room.
 * @param {number} size.height - Height of the room.
 * @param {number} size.depth - Depth of the room.
 * @param {number} size.thickness - Thickness of the walls of the room.
 * @param {Object} meta - Object to spread onto colliders and body.
 * @param {Object} meta.room - Meta object to spread on the room rigid body.
 * @param {Object} meta.floor - Meta object to spread on the floor collider.
 * @param {Object} meta.walls - Meta object to spread on the wall colliders.
 * @param {Object} meta.ceiling - Meta object to spread on the ceiling collider.
 */
function room(pos, rot, size, meta = defaultRoomMeta) {
  const { x, y, z } = pos
  const {
    width: w,
    height: h,
    depth: d,
    thickness: t
  } = size;

  return [
    {
      name: 'roomBody',
      type: 'static',
      position: { x, y: y + h/2, z },
      rotation: rot,
      colliders: [
        {
          // bottom
          type: 'cuboid',
          position: { x: 0, y: -h/2 - t/2, z: 0 },
          width: w,
          height: t,
          depth: d,
          density: 1,
          meta: meta.floor
        },
        {
          // top
          type: 'cuboid',
          position: { x: 0, y: h/2 + t/2, z: 0 },
          width: w,
          height: t,
          depth: d,
          density: 1,
          meta: meta.ceiling
        },
        {
          // front
          type: 'cuboid',
          position: { x: 0, y: 0, z: d/2 + t/2 },
          width: w + 2*t,
          height: h + 2*t,
          depth: t,
          density: 1,
          meta: meta.walls
        },
        {
          // back
          type: 'cuboid',
          position: { x: 0, y: 0, z: -d/2 - t/2 },
          width: w + 2*t,
          height: h + 2*t,
          depth: t,
          density: 1,
          meta: meta.walls
        },
        {
          // right
          type: 'cuboid',
          position: { x: w/2 + t/2, y: 0, z: 0 },
          width: t,
          height: h + 2*t,
          depth: d,
          density: 1,
          meta: meta.walls
        },
        {
          // left
          type: 'cuboid',
          position: { x: -w/2 - t/2, y: 0, z: 0 },
          width: t,
          height: h + 2*t,
          depth: d,
          density: 1,
          meta: meta.walls
        }
      ],
      meta: meta.room
    }
  ]
}

module.exports = room