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
  if(el === getSceneEl()) {
    return {
      position: el.systems.camera.activeCameraEl.object3D.position,
      rotation: el.systems.camera.activeCameraEl.object3D.quaternion,
    }
  } else {
    return {
      position: el.object3D.position,
      rotation: el.object3D.quaternion
    }
  }
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