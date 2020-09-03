AFRAME.registerPrimitive('a-hex-input', {
  defaultComponents: {
    'hex-input': {}
  },
  mappings: {}
});

AFRAME.registerComponent('hex-input', {
  schema: {},
  init: function () {
    this.createOutput = AFRAME.utils.bind(this.createOutput, this)
    this.createInput = AFRAME.utils.bind(this.createInput, this)
    this.handleChange = AFRAME.utils.bind(this.handleChange, this)

    this.outputId = `output-${generateId()}`
    this.el.appendChild(this.createOutput())
    this.el.appendChild(this.createInput())

    this.output = this.el.querySelector(`#${this.outputId}`)

    this.el.addEventListener('change', this.handleChange)
  },
  update: function () {},
  tick: function () {},
  remove: function () {},
  pause: function () {},
  play: function () {},
  createOutput: function() {
    return htmlToElement(`
      <a-entity
        id="${this.outputId}"
        position="3 0 -2"
        output=""
        grid="row: 1; gap: 0.5; cellWidth: 1.0; cellHeight: 1.0; center: true;"
      >
      </a-box>
    `)
  },
  createInput: function() {
    return htmlToElement(`
      <a-entity input-panel>
        <a-entity
          id="buttonPanel"
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
        <a-entity
          position="8.0 0 0"
          rotation="0 180 0"
          button="frameModel: #buttonFrame; buttonModel: #arrow; value: back;"
          mixin="buttonStyle"
        ></a-entity>
        <a-entity
          position="8.0 0 2.0"
          button="frameModel: #buttonFrame; buttonModel: #clear; value: clear;"
          mixin="buttonStyle"
        ></a-entity>
        <a-entity
          position="3.0 0 8.0"
          button="frameModel: #buttonFrame; buttonModel: #enter; value: enter;"
          mixin="buttonStyle"
        ></a-entity>
      </a-entity>
    `)
  },
  handleChange: function(event) {
    const val = event.target.value

    this.output.setAttribute('output', val)
  }
})