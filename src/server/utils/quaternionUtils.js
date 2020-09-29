const {
  Quaternion,
  Euler
} = require('three')

function multiply (rot1, rot2) {
  const quat1 = rot1 instanceof Quaternion
    ? rot1
    : new Quaternion().setFromEuler(new Euler(rot1.x, rot1.y, rot1.z))
  const quat2 = rot2 instanceof Quaternion
    ? rot2
    : new Quaternion().setFromEuler(new Euler(rot2.x, rot2.y, rot2.z))
  
  return quat1.multiply(quat2)
}

module.exports = {
  multiply
}