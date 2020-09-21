/**
 * @param {String} HTML representing a single element
 * @return {Element}
 */
function htmlToElement(html) {
  var template = document.createElement('template');
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstChild;
}

let last = 0
function generateId() {
  let next = Date.now()
  if(next <= last) {
    last++
  } else {
    last = next
  }

  return last.toString(16).toUpperCase()
}

function getCounterPose(position, rotation, distance) {
  position = new AFRAME.THREE.Vector3(position.x, position.y, position.z)
  quaternion = new AFRAME.THREE.Quaternion()
    .setFromEuler(new AFRAME.THREE.Euler(rotation.x, rotation.y, rotation.z))
  const offsetPosition = new AFRAME.THREE.Vector3(0, 0, -1)
  offsetPosition
    .applyQuaternion(quaternion)
    .multiplyScalar(distance)

  return {
    position: position.add(offsetPosition),
    quaternion
  }
}