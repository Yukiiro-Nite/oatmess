const {
  Vector3,
  Quaternion,
  Euler
} = require('three')

function getCounterPose(pose, distance) {
  const offset = new Vector3(0, 0, -1)
    .multiplyScalar(distance)
  const position = getOffsetFromPose(pose, offset)
  const quaternion = new Quaternion()
    .setFromEuler(new Euler(pose.rotation.x, pose.rotation.y, pose.rotation.z))

  return {
    position,
    quaternion
  }
}

function getOffsetFromPose(pose, offset) {
  const position = pose.position instanceof Vector3
    ? pose.position
    : new Vector3(pose.position.x, pose.position.y, pose.position.z)
  const quaternion = pose.rotation instanceof Quaternion
    ? pose.rotation
    : new Quaternion()
    .setFromEuler(new Euler(pose.rotation.x, pose.rotation.y, pose.rotation.z))
  const offsetPos = new Vector3(offset.x, offset.y, offset.z)
  offsetPos
    .applyQuaternion(quaternion)
    .add(position)

  return offsetPos
}

function xyzToRapierVector(Rapier, vec)  {
  return new Rapier.Vector(vec.x, vec.y, vec.z)
}

function rapierVectorToThree(vec) {
  return new Vector3(vec.x, vec.y, vec.z)
}

module.exports = {
  getCounterPose,
  getOffsetFromPose,
  xyzToRapierVector,
  rapierVectorToThree
}