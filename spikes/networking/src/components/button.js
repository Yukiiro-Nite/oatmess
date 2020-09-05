/**
 * The button component emits a click event when the user interacts with the element.
 * - for desktop and mobile, the button activates when the user presses the screen
 *   - can use raycast for this.
 * - for gaze based vr, a button activates when it is looked at
 * - for controller based vr, the button activates when the user presses the button.
 * 
 * I need to make a separate project for inputs...
 */
AFRAME.registerComponent('button', {
  schema: {
    frameId: { type: 'string' },
    frameModel: { type: 'string' },
    buttonModel: { type: 'string' },
    value: { type: 'string' }
  },
  init: function () {
    this.setupManualButton = AFRAME.utils.bind(this.setupManualButton, this)
    this.setupCustomButton = AFRAME.utils.bind(this.setupCustomButton, this)
    this.createFrame = AFRAME.utils.bind(this.createFrame, this)
    this.createButton = AFRAME.utils.bind(this.createButton, this)
    this.handleCollision = _.debounce(
      AFRAME.utils.bind(this.handleCollision, this),
      200,
      { leading: true, trailing: false }
    )
    this.frameId = this.data.frameId || `frame-${generateId()}`

    if(this.data.frameModel && this.data.buttonModel) {
      this.setupCustomButton()
    } else {
      this.setupManualButton()
    }
  },
  update: function () {},
  tick: function () {},
  remove: function () {},
  pause: function () {},
  play: function () {},
  setupManualButton: function() {
    // dynamic body, static body frame, and constraint needs to be set up manually on the manual button
    this.el.addEventListener('collide', this.handleCollision)
  },
  setupCustomButton: function() {
    this.frame = this.createFrame()
    this.button = this.createButton()
    
    const frameReady = new Promise((resolve) => {
      this.frame.addEventListener('model-loaded', function(event) {
        event.target.removeEventListener('model-loaded', this)
        resolve()
      })
    })
    const buttonReady = new Promise((resolve) => {
      this.button.addEventListener('model-loaded', function(event) {
        event.target.removeEventListener('model-loaded', this)
        resolve()
      })
    })
    Promise.all([frameReady, buttonReady]).then(() => {
      this.frame.setAttribute('static-body', '')

      this.button.setAttribute('dynamic-body', '')
      this.button.setAttribute('constraint', {
        target: `#${this.frameId}`,
        type: 'lock',
        collideConnected: false
      })
      this.button.addEventListener('collide', this.handleCollision)
    })

    this.el.append(this.frame, this.button)
  },
  createFrame: function () {
    return htmlToElement(`
      <a-entity
        id="${this.frameId}"
        gltf-model="${this.data.frameModel}"
      ></a-entity
    `)
  },
  createButton: function() {
    return htmlToElement(`
      <a-entity
        gltf-model="${this.data.buttonModel}"
      ></a-entity
    `)
  },
  handleCollision: function(event) {
    const notFrame = event.detail.body.el.getAttribute('id') !== this.frameId

    if(notFrame) {
      event.bubbles = true
      event.detail.value = this.data.value
      this.el.value = this.data.value
      this.el.dispatchEvent(new CustomEvent('pressed', event))
    }
  }
});
