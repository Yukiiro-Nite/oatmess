const { EventEmitter } = require('events');
// Hack to get world.step working
const { performance } = require('perf_hooks');
globalThis.performance = performance;
// end hack
const RapierLoader = import('@dimforge/rapier3d')

/**
 * Vector of length 3.
 * @typedef {Object} Vec3
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

 /**
 * Vector of length 4.
 * @typedef {Object} Vec4
 * @property {number} x
 * @property {number} y
 * @property {number} z
 * @property {number} w
 */

/**
 * Configuration options for a rigid body.
 * @typedef {Object} RigidBodyConfig
 * @property {String} type - Type of rigid body. One of ['static', 'dynamic', 'kinematic']
 * @property {Vec3} position - Initial position of the rigid body.
 * @property {Vec4} rotation - Initial rotation of the rigid body.
 */

const ready = RapierLoader.then((Rapier) => {
  class RapierEngine extends EventEmitter {
    constructor(gravityX, gravityY, gravityZ, positionThreshold = 0.001, rotationThreshold = 0.015) {
      super()
      this.positionThreshold = positionThreshold
      this.rotationThreshold = rotationThreshold
      this.world = new Rapier.World(gravityX, gravityY, gravityZ)
      this.eventQueue = new Rapier.EventQueue(true)
      this.running = false
      this.oldBodyMap = {}
      this.meta = {
        body: {},
        collider: {}
      }

      return this
    }

    start(tps) {
      this.running = true
      this.gameTick(tps)
    }

    stop() {
      clearTimeout(this.currentTimeout)
      this.running = false
    }

    gameTick(tps) {
      // this.world.step()
      this.world.stepWithEvents(this.eventQueue)
      const worldDiff = this.getWorldDiff()

      if(worldDiff) {
        this.emit('worldUpdate', worldDiff)
      }

      if(this.running) {
        this.currentTimeout = setTimeout(() => this.gameTick(tps), tps)
      }
    }

    getWorldDiff() {
      const worldState = this.getWorldState()
      const updatedBodies = worldState.bodies.filter((body) => {
        const oldBody = this.oldBodyMap[body.id]

        if(!oldBody) {
          this.oldBodyMap[body.id] = body
          return true
        }

        const dist = distance(oldBody.position, body.position)
        const angle = angleTo(oldBody.rotation, body.rotation)

        if(dist >= this.positionThreshold || angle >= this.rotationThreshold) {
          this.oldBodyMap[body.id] = body
          return true
        }
      })

      if(updatedBodies.length > 0 || worldState.events.length > 0) {
        return {
          bodies: updatedBodies,
          events: worldState.events
        }
      }
    }

    getWorldState() {
      const worldState = {
        bodies: [],
        events: []
      }

      this.world.forEachRigidBody((body) => {
        worldState.bodies.push(serializeBody(body, this.meta))
      })

      this.eventQueue.drainContactEvents((handle1, handle2, started) => {
        worldState.events.push({ handle1, handle2, started })
      })

      // Skipping proximity events, I don't think they are useful for this app.

      this.eventQueue.clear()
      return worldState
    }

    /**
     * Used to create and add a rigid body to the world.
     * @param {RigidBodyConfig} options - Options for creating a rigid body.
     * @returns {Rapier.RigidBody} RigidBody
     */
    createRigidBody(options = {}) {
      const bodyDesc = new Rapier.RigidBodyDesc(options.type)
      options.position && bodyDesc.setTranslation(options.position.x, options.position.y,  options.position.z)
      options.rotation && bodyDesc.setRotation(options.rotation.x, options.rotation.y,  options.rotation.z, options.rotation.w)
      const body = this.world.createRigidBody(bodyDesc)

      if(options.meta) {
        this.meta.body[body.handle()] = options.meta
      }

      if(options.colliders && options.colliders.length > 0) {
        options.colliders.forEach(colliderConfig => {
          const colliderDesc = this.createColliderDesc(colliderConfig)
          const collider = body.createCollider(colliderDesc)

          if(colliderConfig.meta) {
            this.meta.collider[collider.handle()] = colliderConfig.meta
          }
        })
      }

      return body
    }

    createColliderDesc(options = {}) {
      let desc

      switch(options.type) {
        case 'ball':
          desc = Rapier.ColliderDesc.ball(options.radius)
          break
        case 'cuboid':
          desc = Rapier.ColliderDesc.cuboid(
            options.width / 2,
            options.height / 2,
            options.depth / 2
          )
          break
        default:
          desc = new Rapier.ColliderDesc()
      }
      setProp('density', options, desc)
      setProp('friction', options, desc)
      setProp('isSensor', options, desc)
      setProp('restitution', options, desc)

      options.position && desc.setTranslation(options.position.x, options.position.y,  options.position.z)
      options.rotation && desc.setRotation(options.rotation.x, options.rotation.y,  options.rotation.z, options.rotation.w)

      return desc
    }
  }

  return {
    RapierEngine,
    Rapier
  }
})

function serializeBody(body, meta = {}) {
  const id = body.handle()
  const pos = body.translation()
  const rot = body.rotation()
  const colliders = serializeColliders(body, meta)

  return {
    id,
    position: {
      x: pos.x,
      y: pos.y,
      z: pos.z
    },
    rotation: {
      x: rot.x,
      y: rot.y,
      z: rot.z,
      w: rot.w
    },
    colliders,
    meta: meta.body[id]
  }
}

function serializeColliders(body, meta = {}) {
  const colliders = []
  const count = body.numColliders()

  for(let i=0; i < count; i++) {
    colliders.push(serializeCollider(body.collider(i), meta))
  }

  return colliders
}

function serializeCollider(collider, meta) {
  const id = collider.handle()
  const pos = collider.translation()
  const rot = collider.rotation()
  const parent = collider.parent()
  const parentPos = parent.translation()
  const parentRot = parent.rotation()

  // I don't like that I have to calculate this every time I serialize
  // unfortunately, collider pos and quat are in world space, which is inconvienient
  // when rebuilding a nested object on the front end.
  return {
    id,
    position: {
      x: pos.x - parentPos.x,
      y: pos.y - parentPos.y,
      z: pos.z - parentPos.z
    },
    rotation: {
      x: rot.x - parentRot.x,
      y: rot.y - parentRot.y,
      z: rot.z - parentRot.z,
      w: rot.w - parentRot.w,
    },
    meta: meta.collider[id]
  }
}

function distance(from, to) {
  return Math.hypot(to.x - from.x, to.y - from.y, to.z - from.z)
}

function angleTo(from, to) {
  return 2 * Math.acos(Math.abs(clamp(dot(from, to), -1, 1)))
}

function clamp(val, min, max) {
  return val > min
    ? val < max
      ? val
      : max
    : min
}

function dot(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z + v1.w * v2.w
}

function setProp(key, from, to) {
  const val = from[key]
  if(val !== undefined) {
    to[key] = val
  }
}

module.exports = {
  ready
}