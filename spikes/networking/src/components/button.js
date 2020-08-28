/**
 * The button component emits a click event when the user interacts with the element.
 * - for desktop and mobile, the button activates when the user presses the screen
 *   - can use raycast for this.
 * - for gaze based vr, a button activates when it is looked at
 * - for controller based vr, the button activates when the user presses the button.
 */
AFRAME.registerComponent('button', {
  schema: {},
  init: function () {
    this.position = this.el.object3D.position.clone()
    this.handleCollision = AFRAME.utils.bind(this.handleCollision, this)
    this.el.addEventListener('collide', this.handleCollision)
  },
  update: function () {},
  tick: function (time) {
    // this.el.object3D.position.copy(
    //   this.position.clone().add(new THREE.Vector3(0, 0, Math.sin(time / 100) / 100))
    // )
  },
  remove: function () {},
  pause: function () {},
  play: function () {},
  handleCollision: function(event) {
    const actionName = event.target.getAttribute('action')
    const actionFn = buttonActions[actionName]

    if(actionFn && actionFn instanceof Function) {
      actionFn(event)
    }
  }
});
