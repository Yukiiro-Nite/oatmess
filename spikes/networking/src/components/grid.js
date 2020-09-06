AFRAME.registerComponent('grid', {
  schema: {
    col: { type: 'int', default: 1 },
    row: { type: 'int'},
    gap: { type: 'number', default: 0.5 },
    cellWidth: { type: 'number', default: 1 },
    cellHeight: { type: 'number', default: 1 },
    hCenter: {type: 'boolean', default: false},
    vCenter: {type: 'boolean', default: false},
  },
  init: function () {
    this.oldPosition = this.el.object3D.position.clone()
    this.updateGrid = AFRAME.utils.bind(this.updateGrid, this)

    this.updateGrid()

    this.el.addEventListener('updateGrid', this.updateGrid)
  },
  update: function () {},
  tick: function () {},
  remove: function () {},
  pause: function () {},
  play: function () {},
  updateGrid: function() {
    console.log('Updating grid')
    const { col, row, gap, cellWidth, cellHeight } = this.data
    const columns = col || Math.floor(this.el.children.length / row)
    const rows = row || Math.floor(this.el.children.length / col)
    Array.from(this.el.children).forEach((el, index) => {
      const pos = el.object3D.position
      const x = row
        ? Math.floor(index / row)
        : index % col
      const y = row
        ? index % row
        : Math.floor(index / col)
      pos.add(new AFRAME.THREE.Vector3((cellWidth + gap) * x, 0, (cellHeight + gap) * y))

      if(this.data.hCenter) {
        pos.sub(new AFRAME.THREE.Vector3((cellWidth + gap) * columns / 2, 0, 0))
      }
      if(this.data.vCenter) {
        pos.sub(new AFRAME.THREE.Vector3(0, 0, (cellHeight + gap) * rows / 2))
      }
    })
  }
});
