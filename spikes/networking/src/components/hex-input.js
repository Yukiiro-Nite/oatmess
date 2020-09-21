AFRAME.registerPrimitive('a-hex-input', {
  defaultComponents: {
    'hex-input': {}
  },
  mappings: {}
});

AFRAME.registerComponent('hex-input', {
  schema: {},
  events: {
    change: function (event) {
      const val = event.target.value

      this.output.setAttribute('output', val)
    }
  },
  init: function () {
    this.createOutput = AFRAME.utils.bind(this.createOutput, this)
    this.createInput = AFRAME.utils.bind(this.createInput, this)
    this.hide = AFRAME.utils.bind(this.hide, this)
    this.show = AFRAME.utils.bind(this.show, this)
    this.el.hide = this.hide
    this.el.show = this.show

    this.outputId = `output-${generateId()}`
    this.el.appendChild(this.createOutput())
    this.el.appendChild(this.createInput())

    this.output = this.el.querySelector(`#${this.outputId}`)
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
        position="2.25 0 -1.5"
        output=""
      >
      </a-entity>
    `)
  },
  createInput: function() {
    return htmlToElement(`
      <a-entity input-panel>
        <a-entity
          id="buttonPanel"
          grid="col: 4; gap: 0.5; cellWidth: 1; cellHeight: 1;"
        >
        ${
          new Array(16).fill().map((_, i) =>`
            <a-box
              height="0.2"
              button="iconScale: 0.8 0.8 0.8; buttonModel: #icon_${i.toString(16).toUpperCase()}; value: ${i.toString(16).toUpperCase()};"
              mixin="buttonStyle"
            ></a-box>
          `).join('\n')
        }
        </a-entity>
        <a-box
          position="6.0 0 0.75"
          rotation="0 180 0"
          width="1.0"
          height="0.2"
          depth="2.5"
          material="color: #16161d"
          button="iconScale: 0.8 0.8 0.8; buttonModel: #arrow; value: back;"
          mixin="buttonStyle"
        ></a-box>
        <a-box
          position="6.0 0 3.75"
          width="1.0"
          height="0.2"
          depth="2.5"
          material="color: #16161d"
          button="iconScale: 0.8 0.8 0.8; buttonModel: #clear; value: clear;"
          mixin="buttonStyle"
        ></a-box>
        <a-box
          position="2.25 0 6.0"
          width="2.5"
          height="0.2"
          depth="1.0"
          material="color: #16161d"
          button="iconScale: 2.0 0.8 2.0; buttonModel: #enter; value: enter;"
          mixin="buttonStyle"
        ></a-box>
      </a-entity>
    `)
  },
  hide: function() {
    this.el.setAttribute('visible', false)
    this.el.flushToDOM()
  },
  show: function() {
    this.el.setAttribute('visible', true)
    this.el.flushToDOM()
  }
})