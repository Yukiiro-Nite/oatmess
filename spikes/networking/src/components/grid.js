AFRAME.registerComponent('grid', {
  schema: {
    col: { type: 'int', default: 1 },
    gap: { type: 'number', default: 0.5 },
    cellWidth: { type: 'number', default: 1 },
    cellHeight: { type: 'number', default: 1 }
  },
  init: function () {
    Array.from(this.el.children).forEach((el, index) => {
      const { col, gap, cellWidth, cellHeight } = this.data
      const pos = el.object3D.position
      const x = index % col
      const y = Math.floor(index / col)
      pos.add(new AFRAME.THREE.Vector3((cellWidth + gap) * x, 0, (cellHeight + gap) * y))
    })
  },
  update: function () {},
  tick: function () {},
  remove: function () {},
  pause: function () {},
  play: function () {}
});
