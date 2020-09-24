const { EventEmitter } = require('events')
const { Vector3, Quaternion } = require('three')

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
 * Pose containing position and rotation
 * @typedef {Object} Pose
 * @property {Vec3} position
 * @property {Vec4} rotation
 */

/**
 * Configuration options for a rigid body.
 * @typedef {Object} RigidBodyConfig
 * @property {String} type - Type of rigid body. One of ['static', 'dynamic', 'kinematic']
 * @property {Vec3} position - Initial position of the rigid body.
 * @property {Vec4} rotation - Initial rotation of the rigid body.
 */

/**
 * Configuration options for a joint.
 * @typedef {Object} JointConfig
 * @property {String} type - Type of joint. One of ['ball', 'revolute']
 * @property {number} handle1 - Handle for the first rigid body of the joint.
 * @property {number} handle2 - Handle for the second rigid body of the joint.
 * @property {Vec3} anchor1 - (Optional) First anchor of the joint. Defaults to origin.
 * @property {Vec3} anchor1 - (Optional) Second anchor of the joint. Defaults to `body2.position - body1.position`.
 * @property {Vec3} axis1 - (Optional) First axis in revolute joint.
 * @property {Vec3} axis2 - (Optional) Second axis in revolute joint.
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
      this.grabJointMap = {}

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

    /**
     * Used to create and add a joint to the world.
     * @param {JointConfig} options - Options for creating a joint.
     * @returns {Rapier.Joint} Joint
     */
    createJoint(options = {}) {
      const body1 = this.world.getRigidBody(options.handle1)
      const body2 = this.world.getRigidBody(options.handle2)

      if(!options.anchor1) {
        options.anchor1 = new Rapier.Vector(0, 0, 0)
      } else {
        options.anchor1 = new Rapier.Vector(options.anchor1.x, options.anchor1.y, options.anchor1.z)
      }

      if(!options.anchor2) {
        const pos1 = body1.translation()
        const pos2 = body2.translation()
        options.anchor2 = new Rapier.Vector(pos2.x - pos1.x, pos2.y - pos1.y, pos2.z - pos1.z)
      } else {
        options.anchor2 = new Rapier.Vector(options.anchor2.x, options.anchor2.y, options.anchor2.z)
      }

      const jointDesc = this.createJointDesc(options)
      const joint = this.world.createJoint(jointDesc, body1, body2)

      return joint
    }

    createJointDesc(options = {}) {
      let desc

      switch(options.type) {
        case 'ball':
          desc = Rapier.JointDesc.ball(
            options.anchor1,
            options.anchor2
          )
          break
        case 'revolute':
          desc = Rapier.JointDesc.revolute(
            options.anchor1,
            options.axis1,
            options.anchor2,
            options.axis2
          )
          break
        default:
          desc = new Rapier.JointDesc()
      }

      return desc
    }

    /**
     * 
     * @param {Object} options - Config object for creating a grab joint.
     * @param {String} options.id - User id of the grab joint.
     * @param {number} options.bodyId - Handle of the body being grabbed.
     * @param {Vec3} options.position - Position of where the grabbing is happening.
     * @param {String} options.part - Name of the part doing the grabbing. One player can grab with more than one part at a time.
     * @param {Pose} options.srcPose - Pose of the part doing the grabbing.
     */
    createGrabJoint(options = {}) {
      const hasGrab = this.grabJointMap[options.id]
        && this.grabJointMap[options.id][options.part]

      if(hasGrab) {
        this.removeGrabJoint(options)
      }

      const grabbedBody = this.world.getRigidBody(options.bodyId)
      grabbedBody.wakeUp()
      const grabbingBody = this.createRigidBody({
        type: 'kinematic',
        position: options.position
      })

      const grabJoint = this.createJoint({
        type: 'ball',
        handle1: grabbingBody.handle(),
        handle2: grabbedBody.handle()
      })

      this.grabJointMap[options.id] = {
        ...this.grabJointMap[options.id],
        [options.part]: {
          grabbingBody,
          grabbedBody,
          grabJoint,
          srcPose: options.srcPose,
          grabOrigin: options.position
        }
      }
    }

    updateGrabJoints(id, playerUpdate) {
      const hasGrab = this.grabJointMap[id]
        && playerUpdate.parts.some(partUpdate => this.grabJointMap[id][partUpdate.part])
      if(hasGrab) {
        playerUpdate.parts
          .filter(partUpdate => this.grabJointMap[id][partUpdate.part])
          .forEach(partUpdate => {
            this.updateGrabJoint({
              id,
              part: partUpdate.part,
              newPose: {
                position: partUpdate.position,
                rotation: partUpdate.quaternion
              }
            })
          })
      }
    }

    /**
     * @param {Object} options - Config object for removing a grab joint.
     * @param {String} options.id - User id of the grab joint.
     * @param {String} options.part - Name of the part doing the grabbing. One player can grab with more than one part at a time.
     * @param {Pose} options.newPose - New pose of the grabbing part.
     */
    updateGrabJoint(options = {}) {
      const grabJointData = this.grabJointMap[options.id]
        && this.grabJointMap[options.id][options.part]
      if(grabJointData) {
        const newPos = applyPose(grabJointData.grabOrigin, grabJointData.srcPose, options.newPose)

        grabJointData.grabbingBody.setTranslation(newPos.x, newPos.y, newPos.z)
      }
    }

    removePlayerGrabJoints(id) {
      const playerGrabJoints = this.grabJointMap[id]

      if(playerGrabJoints) {
        Object.entries(playerGrabJoints).forEach(([part, grabJointData]) => {
          this.removeGrabJoint({ id, part })
        })
      }
    }

    /**
     * 
     * @param {Object} options - Config object for removing a grab joint.
     * @param {String} options.id - User id of the grab joint.
     * @param {String} options.part - Name of the part doing the grabbing. One player can grab with more than one part at a time.
     */
    removeGrabJoint(options = {}) {
      const grabJointData = this.grabJointMap[options.id]
        && this.grabJointMap[options.id][options.part]
      if(grabJointData) {
        const grabbingBodyId = grabJointData.grabbingBody.handle()
        this.removeRigidBody(grabJointData.grabbingBody)
        if(options.velocity) {
          const vel = new Rapier.Vector(options.velocity.x, options.velocity.y, options.velocity.z)
          grabJointData.grabbedBody.applyForce(vel)
        }
        delete this.grabJointMap[options.id][options.part]
        return grabbingBodyId
      }
    }

    removeRigidBodyByCollider(colliderId) {
      const collider = this.world.getCollider(colliderId)
      if(collider) {
        const body = collider.parent()
        const bodyId = body.handle()
        this.removeRigidBody(body)
        return bodyId
      }
    }

    removeRigidBody(body) {
      const colliderCount = body.numColliders()
      let colliderId

      for(let i=0; i < colliderCount; i++){
        colliderId = body.collider(i).handle()
        delete this.meta.collider[colliderId]
      }

      delete this.meta.body[body.handle()]

      this.world.removeRigidBody(body)
    }

    initializeWorld(worldConfig) {
      const namedBodies = {}
      worldConfig.bodies.forEach((bodyConfig) => {
        const body = this.createRigidBody(bodyConfig)
        if(bodyConfig.effect && bodyConfig.effect instanceof Function) {
          bodyConfig.effect(body, Rapier)
        }
        if(bodyConfig.name) {
          namedBodies[bodyConfig.name] = body
        }
      })

      worldConfig.joints.forEach((joint) => {
        joint.handle1 = namedBodies[joint.body1].handle()
        joint.handle2 = namedBodies[joint.body2].handle()

        this.createJoint(joint)
      })
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
  const type = collider.shapeType()
  const radius = collider.radius()
  const halfExtents = collider.halfExtents()
  const size = halfExtents && {
    width: halfExtents.x * 2,
    height: halfExtents.y * 2,
    depth: halfExtents.z * 2
  }

  // I don't like that I have to calculate this every time I serialize
  // unfortunately, collider pos and quat are in world space, which is inconvienient
  // when rebuilding a nested object on the front end.
  return {
    id,
    type,
    radius,
    size,
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

function applyPose(point, srcPose, newPose) {
  const p = new Vector3(point.x, point.y, point.z)
  const srcPos = new Vector3(srcPose.position.x, srcPose.position.y, srcPose.position.z)
  const newPos = new Vector3(newPose.position.x, newPose.position.y, newPose.position.z)
  const newRot = new Quaternion(newPose.rotation.x, newPose.rotation.y, newPose.rotation.z, newPose.rotation.w)
  const dist = srcPos.distanceTo(p)

  return new Vector3(0, 0, -1)
    .applyQuaternion(newRot)
    .multiplyScalar(dist)
    .add(newPos)
}

module.exports = {
  ready
}