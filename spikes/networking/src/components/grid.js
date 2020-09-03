AFRAME.registerComponent('grid', {
  schema: {
    col: { type: 'int', default: 1 },
    row: { type: 'int'},
    gap: { type: 'number', default: 0.5 },
    cellWidth: { type: 'number', default: 1 },
    cellHeight: { type: 'number', default: 1 },
    center: {type: 'boolean', default: false}
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
    const { col, row, gap, cellWidth, cellHeight } = this.data
    Array.from(this.el.children).forEach((el, index) => {
      const pos = el.object3D.position
      const x = row
        ? Math.floor(index / row)
        : index % col
      const y = row
        ? index % row
        : Math.floor(index / col)
      pos.add(new AFRAME.THREE.Vector3((cellWidth + gap) * x, 0, (cellHeight + gap) * y))
    })

    // TODO: Fix this, it doesn't work correctly for some reason
    if(this.data.center) {
      const columns = col || Math.floor(this.el.children.length / row)
      const rows = row || Math.floor(this.el.children.length / col)
      this.el.object3D.position.copy(
        this.oldPosition.clone().sub(
          new AFRAME.THREE.Vector3(-(cellWidth + gap) * columns / 2, 0, (cellHeight + gap) * rows / 2)
        )
      )
    }
  }
});
