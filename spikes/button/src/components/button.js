AFRAME.registerComponent('button', {
  schema: {
    value: { type: 'string' },
    /**
     * distance of ray intersection to be considered a press.
     * defaults to 1cm
     */
    pressDistance: { type: 'number', default: 0.01 }
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
    this.emitPressStart = AFRAME.utils.bind(this.emitPressStart, this)
    this.emitPressEnd = AFRAME.utils.bind(this.emitPressEnd, this)

    this.pressed = false
    this.el.value = this.data.value
  },
  update: function () {
    this.el.value = this.data.value
  },
  tick: function () {
    // I should check to see if the user is in vr before I check this..
    if(this.getIntersection) {
      const dist = this.getIntersection().distance
      if(dist <= this.data.pressDistance) {
        this.emitPressStart()
      } else {
        this.emitPressEnd()
      }
    }
  },
  remove: function () {},
  pause: function () {},
  play: function () {},
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