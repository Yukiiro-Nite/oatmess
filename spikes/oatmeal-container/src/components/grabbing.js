AFRAME.registerComponent('grabbing', {
  schema: {
    threshold: {default: 0.05}
  },
  init: function () {
    this.lastPosition = new AFRAME.THREE.Vector3()
    this.velocity = new AFRAME.THREE.Vector3()

    this.grabItem = AFRAME.utils.bind(this.grabItem, this)
    this.dropItem = AFRAME.utils.bind(this.dropItem, this)
    this.getClosestGrabbable = AFRAME.utils.bind(this.getClosestGrabbable, this)

    this.el.addEventListener('triggerdown', this.grabItem)
    this.el.addEventListener('triggerup', this.dropItem)
  },
  update: function () {},
  tick: function (uptime, delta) {
    if(this.currentItem) {
      this.el.object3D.getWorldPosition(this.currentItem.object3D.position)
      this.velocity.copy(
        this.el.object3D.position.clone()
          .sub(this.lastPosition)
          .multiplyScalar(1 / (delta / 1000))
      )
    }

    this.lastPosition.copy(this.el.object3D.position)
  },
  remove: function () {
    this.el.removeEventListener('triggerdown', this.grabItem)
    this.el.removeEventListener('triggerup', this.dropItem)
  },
  pause: function () {},
  play: function () {},
  grabItem: function(event) {
    const closestGrabbable = this.getClosestGrabbable(event.target)
    if(closestGrabbable) {
      console.log('Attempting to grab item', closestGrabbable)
      this.currentItem = closestGrabbable
      this.currentItem.removeAttribute('dynamic-body')
    }
  },
  dropItem: function(event) {
    console.log('Attempting to drop item', event)
    if(this.currentItem) {
      this.currentItem.setAttribute('dynamic-body', "")
      this.currentItem.body.applyLocalImpulse(this.velocity.multiplyScalar(20), new CANNON.Vec3(0, 0, 0));
      this.currentItem = undefined
    }
  },
  getClosestGrabbable: function(from) {
    const pos = from.object3D.position
    const grabbables = this.el.sceneEl.querySelectorAll('[grabbable]')

    if(grabbables && grabbables.length > 0) {
      let closestItem, closestDistance, currentDistance, isCloser
      for(let i=0; i < grabbables.length; i++) {
        currentDistance = pos.distanceTo(grabbables[i].object3D.position)
        isCloser = (currentDistance < this.data.threshold + grabbables[i].threshold)
          && (
            closestDistance === undefined
            || currentDistance < closestDistance
          )
        if(isCloser) {
          closestItem = grabbables[i]
          closestDistance = currentDistance
        }
      }

      return closestItem
    }
  }
});
