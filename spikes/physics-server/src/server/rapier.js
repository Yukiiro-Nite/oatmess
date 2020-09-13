// Hack to get world.step working
const { performance } = require('perf_hooks');
globalThis.performance = performance;
// end hack
const RapierLoader = import('@dimforge/rapier3d')

function start(io) {
  return RapierLoader.then(Rapier => {
    let world = new Rapier.World(0.0, -9.81, 0.0);
  
    let groundRigidBodyDesc = new Rapier.RigidBodyDesc("static");
    let groundRigidBody = world.createRigidBody(groundRigidBodyDesc);
    let groundColliderDesc = Rapier.ColliderDesc.cuboid(10.0, 0.1, 10.0);
    groundColliderDesc.setTranslation(0, -0.05, 0);
    groundRigidBody.createCollider(groundColliderDesc);
  
    let rigidBodyDesc = new Rapier.RigidBodyDesc("dynamic");
    rigidBodyDesc.setTranslation(0.0, 5.0, 0.0);
    let rigidBody = world.createRigidBody(rigidBodyDesc);
  
    let colliderDesc = Rapier.ColliderDesc.cuboid(0.5, 0.5, 0.5);
    colliderDesc.density = 1.0;
    let collider = rigidBody.createCollider(colliderDesc);
    
    rigidBody.applyTorqueImpulse(new Rapier.Vector(5, 0, 0), true)
  
    // Simple Game Loop, replace later.
    let gameLoop = () => {
      world.step();


      const serializedBodies = []
  
      io.emit('worldUpdate', [ serializeBody(rigidBody) ])
  
      setTimeout(gameLoop, 1000 / 20);
    };
  
    gameLoop();

    return { world, Rapier };
  })
}

function serializeBody(body) {
  const pos = body.translation()
  const quat = body.rotation()

  return {
    id: body.handle(),
    position: {
      x: pos.x,
      y: pos.y,
      z: pos.z
    },
    quaternion: {
      x: quat.x,
      y: quat.y,
      z: quat.z,
      w: quat.w
    }
  }
}

module.exports = {
  start
}