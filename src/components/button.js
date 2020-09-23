AFRAME.registerComponent('button', {
  schema: {
    /** gltf model id to use as a frame for the button. */
    frameModel: { type: 'string' },
    /** gltf model id to use as the button geometry. */
    buttonModel: { type: 'string' },
    /**
     * Value of the button.
     * Can be used in event listener via `event.target.value`
     */
    value: { type: 'string' },
    /**
     * Distance of ray intersection to be considered a press.
     * defaults to 1cm
     */
    pressDistance: { type: 'number', default: 0.01 },
    iconScale: { type: 'vec3', default: {x: 1, y: 1, z: 1}}
  },
  events: {
    'raycaster-intersected': function (event) {
      this.getIntersection = () => event.detail.getIntersection(this.el)
      this.caster = event.detail.el
    },
    'raycaster-intersected-cleared': function (event) {
      this.getIntersection = undefined
      this.caster = undefined
      this.pressed = false
    },
  },
  init: function () {
    this.el.value = this.data.value
    this.pressed = false
    this.createFrame = AFRAME.utils.bind(this.createFrame, this)
    this.createButton = AFRAME.utils.bind(this.createButton, this)
    this.emitPressStart = AFRAME.utils.bind(this.emitPressStart, this)
    this.emitPressEnd = AFRAME.utils.bind(this.emitPressEnd, this)

    if(this.data.frameModel) {
      this.el.appendChild(this.createFrame())
    }

    if(this.data.buttonModel) {
      this.el.appendChild(this.createButton())
    }
  },
  update: function () {
    this.el.value = this.data.value
  },
  tick: function () {
    // I should check to see if the user is in vr before I check this..
    if(this.getIntersection && this.getIntersection instanceof Function) {
      const dist = this.getIntersection().distance
      if(dist <= this.data.pressDistance) {
        this.emitPressStart()
      } else {
        this.emitPressEnd()
      }
    }
  },
  createFrame: function () {
    return htmlToElement(`
      <a-entity
        gltf-model="${this.data.frameModel}"
      ></a-entity
    `)
  },
  createButton: function() {
    const height = this.el.getAttribute('height') || 0
    const offset = height / 2.0
    return htmlToElement(`
      <a-entity
        position="0 ${offset} 0"
        scale="${AFRAME.utils.coordinates.stringify(this.data.iconScale)}"
        gltf-model="${this.data.buttonModel}"
      ></a-entity
    `)
  },
  emitPressStart: function () {
    if(!this.pressed) {
      this.pressed = true
      this.caster.dispatchEvent(new CustomEvent('pressStart'))
    }
  },
  emitPressEnd: function () {
    if(this.pressed) {
      this.pressed = false
      this.caster.dispatchEvent(new CustomEvent('pressEnd'))
    }
  }
})