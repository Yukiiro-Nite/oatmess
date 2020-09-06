AFRAME.registerComponent('output', {
  schema: {type: 'string'},
  init: function () {
    this.createEl = AFRAME.utils.bind(this.createEl, this)
  },
  update: function () {
    const val = this.data

    Array.from(this.el.children).forEach(child => this.el.removeChild(child))

    val.split('').forEach(char => {
      const el = this.createEl(char)

      this.el.appendChild(el)
    })
    console.log(`Output updated to: ${val}, updating grid.`)
    setTimeout(() => this.el.dispatchEvent(new CustomEvent('updateGrid', { bubbles: false })))
  },
  tick: function () {},
  remove: function () {},
  pause: function () {},
  play: function () {},
  createEl: function(char) {
    return htmlToElement(`
      <a-entity
        gltf-model="#button_${char}"
      ></a-entity
    `)
  }
});
