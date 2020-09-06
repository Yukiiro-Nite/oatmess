AFRAME.registerComponent('log', {
  schema: {
    on: { type: 'string' }
  },
  init: function () {
    this.handleEvent = AFRAME.utils.bind(this.handleEvent, this)

    this.el.addEventListener(this.data.on, this.handleEvent)
  },
  update: function () {},
  tick: function () {},
  remove: function () {
    this.el.removeEventListener(this.data.on, this.handleEvent)
  },
  pause: function () {},
  play: function () {},
  handleEvent: function(event) {
    console.log(`Logging event: ${this.data.on}: `, event)
  }
});
