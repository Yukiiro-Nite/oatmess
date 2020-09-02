AFRAME.registerPrimitive('a-hex-input', {
  defaultComponents: {
    'hex-input': {}
  },
  mappings: {}
});

AFRAME.registerComponent('hex-input', {
  schema: {},
  init: function () {
    this.createInput = AFRAME.utils.bind(this.createInput, this)

    this.el.appendChild(this.createInput())
  },
  update: function () {},
  tick: function () {},
  remove: function () {},
  pause: function () {},
  play: function () {},
  createInput: function() {
    return htmlToElement(`
      <a-entity
        id="buttonPanel"
        input-panel
        grid="col: 4; gap: 0.5; cellWidth: 1.5; cellHeight: 1.5;"
      >
      ${
        new Array(16).fill().map((_, i) =>`
          <a-entity
            button="frameModel: #buttonFrame; buttonModel: #button_${i.toString(16).toUpperCase()}; value: ${i.toString(16).toUpperCase()};"
            mixin="buttonStyle"
          ></a-entity>
        `).join('\n')
      }
      </a-entity>
    `)
  }
})