AFRAME.registerComponent('output', {
  schema: {type: 'string'},
  init: function () {
    this.createEl = AFRAME.utils.bind(this.createEl, this)
    this.createPanel = AFRAME.utils.bind(this.createPanel, this)
  },
  update: function () {
    const val = this.data
    this.cellWidth = 1
    this.padding = 0

    Array.from(this.el.children).forEach(child => this.el.removeChild(child))

    this.el.appendChild(this.createPanel())
    val.split('').forEach((char, index) => {
      this.el.appendChild(this.createEl(char, index))
    })
    console.log(`Output updated to: ${val}, updating grid.`)
    setTimeout(() => this.el.dispatchEvent(new CustomEvent('updateGrid', { bubbles: false })))
  },
  createPanel: function() {
    return htmlToElement(`
      <a-box
        visible="${this.data.length > 0}"
        width="${(this.data.length * (this.cellWidth + this.padding)) - this.padding}"
        height="0.1"
        position="0 -0.05 0"
        material="color: #16161d"
      ></a-box>
    `)
  },
  createEl: function(char, index) {
    const offset = this.data.length
      ? ((this.data.length - 1) * (this.cellWidth + this.padding) / 2.0)
      : 0
    const x = (this.cellWidth + this.padding) * index - offset
    return htmlToElement(`
      <a-entity
        scale="0.8 0.8 0.8"
        position="${x} 0 0"
        gltf-model="#icon_${char}"
      ></a-entity
    `)
  }
});
