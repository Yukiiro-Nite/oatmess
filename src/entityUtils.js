/**
 * Returns the current scene element.
 */
function getSceneEl () {
  return document.querySelector('a-scene')
}

/**
 * Gets the handle out of the id of an element.
 * @param {HTMLElement} el - An element to get an id from.
 */
function getId (el) {
  const idStr = el.id.split('-').slice(-1)[0]
  return parseInt(idStr)
}

/**
 * Gets the pose of an element.
 * @param {HTMLElement} el - An element to get a pose from.
 */
function getPose (el) {
  const position = new AFRAME.THREE.Vector3()
  const rotation = new AFRAME.THREE.Quaternion()
  if(el === getSceneEl()) {
    el.systems.camera.activeCameraEl.object3D.getWorldPosition(position)
    el.systems.camera.activeCameraEl.object3D.getWorldQuaternion(rotation)
    return {
      position: el.systems.camera.activeCameraEl.object3D.position,
      rotation: el.systems.camera.activeCameraEl.object3D.quaternion,
    }
  } else {
    el.object3D.getWorldPosition(position)
    el.object3D.getWorldQuaternion(rotation)
  }

  return { position, rotation }
}

/**
 * Gets the part type of an element.
 * @param {HTMLElement} el - An element to get the part type from.
 */
function getPartType (el) {
  return el === getSceneEl()
    ? 'head'
    : el.id
}