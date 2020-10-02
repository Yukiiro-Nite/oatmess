const defaultRotation = { x: 0, y: 0, z: 0, w: 0 }

function longRect(pos, rot = defaultRotation) {
  return {
    type: 'dynamic',
    position: { x: pos.x, y: pos.y, z: pos.z },
    rotation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w },
    colliders: [{
      type: 'cuboid',
      width: 0.04,
      height: 0.05,
      depth: 0.25,
      density: 1,
      meta: {
        class: 'grabbable',
        color: '#8e8e00'
      },
    }],
    meta: {
      grabbable: true
    },
  }
}

module.exports = longRect