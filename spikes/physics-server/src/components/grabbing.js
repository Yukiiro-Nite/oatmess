AFRAME.registerComponent('grabbing', {
  schema: {
    objects: { type: 'string' },
    threshold: { default: 0.1 }
  },
  events: {
    triggerdown: function () {
      const closestGrabbable = this.getClosestGrabbable(this.el)
      if(closestGrabbable) {
        this.currentItem = closestGrabbable
        
        closestGrabbable.dispatchEvent(new CustomEvent('mousedown', {
          detail: {
            cursorEl: this.el,
            intersection: {
              point: this.el.object3D.position
            }
          },
          bubbles: true
        }))
      }
    },
    triggerup: function () {
      if(this.currentItem) {
        // need to send velocity to server
        this.velocity
          .applyQuaternion(
            this.currentItem.object3D.quaternion.clone().inverse()
          )
          .multiplyScalar(0.1)
      
        this.currentItem.dispatchEvent(new CustomEvent('mouseup', {
          detail: { cursorEl: this.el, velocity: this.velocity },
          bubbles: true
        }))

        this.currentItem = undefined
      }
    }
  },
  init: function () {
    this.el.threshold = this.data.threshold
    this.lastPosition = new AFRAME.THREE.Vector3()
    this.velocity = new AFRAME.THREE.Vector3()

    this.grabItem = AFRAME.utils.bind(this.grabItem, this)
    this.dropItem = AFRAME.utils.bind(this.dropItem, this)
    this.getClosestGrabbable = AFRAME.utils.bind(this.getClosestGrabbable, this)
    this.isColliding = AFRAME.utils.bind(this.isColliding, this)
  },
  update: function () {},
  tick: function (uptime, delta) {
    if(this.currentItem) {
      this.velocity.copy(
        this.el.object3D.position.clone()
          .sub(this.lastPosition)
          .multiplyScalar(1 / (delta / 1000))
      )
    }

    this.lastPosition.copy(this.el.object3D.position)
  },
  remove: function () {},
  pause: function () {},
  play: function () {},
  getClosestGrabbable: function(from) {
    const pos = from.object3D.position
    const grabbables = this.el.sceneEl.querySelectorAll(this.data.objects)

    if(grabbables && grabbables.length > 0) {
      let closestItem, closestDistance, currentDistance, isCloser, globalPos
      globalPos = new AFRAME.THREE.Vector3()
      for(let i=0; i < grabbables.length; i++) {
        grabbables[i].object3D.getWorldPosition(globalPos)
        currentDistance = pos.distanceTo(globalPos)
        isCloser =  closestDistance === undefined
          || currentDistance < closestDistance
        if(isCloser) {
          closestItem = grabbables[i]
          closestDistance = currentDistance
        }
      }

      return this.isColliding(from, closestItem, closestDistance) && closestItem
    }
  },
  isColliding: function(a, b, dist) {
    // a should always be a sphere, since we're using distance from hand.
    const bGeometry = b.getAttribute('geometry')
    const aPos = new AFRAME.THREE.Vector3()
    a.object3D.getWorldPosition(aPos)

    if(bGeometry.primitive === 'sphere') {
      return dist <= a.threshold + bGeometry.radius
    } else if (bGeometry.primitive === 'box') {
      // just using aabb bounding box here
      const box = new AFRAME.THREE.Box3()
      box.setFromObject(b.object3D)
      
      const x = Math.max(box.min.x, Math.min(aPos.x, box.max.x))
      const y = Math.max(box.min.y, Math.min(aPos.y, box.max.y))
      const z = Math.max(box.min.z, Math.min(aPos.z, box.max.z))
      const distance = Math.hypot(x - aPos.x, y - aPos.y, z - aPos.z)
  
      return distance < a.threshold;
    }
  }
});