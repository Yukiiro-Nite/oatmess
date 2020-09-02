AFRAME.registerComponent('poke', {
  schema: {
    hand: { type: 'string' }
  },
  offsetPosition: {
    right: new AFRAME.THREE.Vector3(0.0275, 0.0425, -0.09),
    left: new AFRAME.THREE.Vector3(-0.0275, 0.0425, -0.09)
  },
  init: function () {
    this.handlePointStart = AFRAME.utils.bind(this.handlePointStart, this)
    this.handlePointEnd = AFRAME.utils.bind(this.handlePointEnd, this)
    this.createPointer = AFRAME.utils.bind(this.createPointer, this)

    this.el.addEventListener('pointingstart', this.handlePointStart)
    this.el.addEventListener('pointingend', this.handlePointEnd)
  },
  update: function () {},
  tick: function () {},
  remove: function () {},
  pause: function () {},
  play: function () {},
  createPointer: function () {
    const el = htmlToElement(`
      <a-entity
        static-body="shape: sphere; sphereRadius: 0.01"
      ></a-entity
    `)
    const pos = this.offsetPosition[this.data.hand]
    const posStr = `${pos.x} ${pos.y} ${pos.z}`
    el.setAttribute('position', posStr)

    return el
  },
  handlePointStart: function () {
    this.pointer = this.createPointer()
    this.el.appendChild(this.pointer)
  },
  handlePointEnd: function () {
    this.el.removeChild(this.pointer)
  }
});
