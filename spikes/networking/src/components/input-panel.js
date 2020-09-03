AFRAME.registerComponent('input-panel', {
  schema: {},
  init: function () {
    this.el.value = ''
    this.handlePressed = AFRAME.utils.bind(this.handlePressed, this)
    this.appendValue = AFRAME.utils.bind(this.appendValue, this)
    this.back = AFRAME.utils.bind(this.back, this)
    this.clear = AFRAME.utils.bind(this.clear, this)
    this.enter = AFRAME.utils.bind(this.enter, this)
    this.emitChange = AFRAME.utils.bind(this.emitChange, this)
    this.submit = AFRAME.utils.bind(this.submit, this)

    this.handlers = {
      back: this.back,
      clear: this.clear,
      enter: this.enter
    }
    
    this.el.appendValue = this.appendValue
    this.el.back = this.back
    this.el.clear = this.clear
    this.el.enter = this.enter
    this.el.submit = this.submit
    this.el.addEventListener('pressed', this.handlePressed)
  },
  update: function () {},
  tick: function () {},
  remove: function () {},
  pause: function () {},
  play: function () {},
  handlePressed: function(event) {
    const handler = this.handlers[event.detail.value]
    if(handler && handler instanceof Function) {
      handler()
    } else {
      this.appendValue(event.detail.value)
    }
  },
  back: function() {
    if(this.el.value && this.el.value.length > 0) {
      this.el.value = this.el.value.substr(0, this.el.value.length-1)
      this.emitChange()
    }
  },
  clear: function() {
    if(this.el.value && this.el.value.length > 0) {
      this.el.value = ''
      this.emitChange()
    }
  },
  enter: function() {
    if(this.el.value && this.el.value.length > 0) {
      this.submit()
    }
  },
  appendValue: function(val) {
    this.el.value += val
    this.emitChange()
  },
  emitChange: function() {
    this.el.dispatchEvent(new CustomEvent('change', { bubbles: true }))
  },
  submit: function() {
    this.el.dispatchEvent(new CustomEvent('submit', { bubbles: true }))
  }
});
