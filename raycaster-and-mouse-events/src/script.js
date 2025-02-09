import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
const object1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({color: '#53ad1a'})
)
object1.position.x = -2

const object2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({color: '#53ad1a'})
)

const object3 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({color: '#53ad1a'})
)
object3.position.x = 2

const cylinderObject = new THREE.CylinderGeometry(0.4, 0.3, 0.2, 8)
const fakeRayCaster = new THREE.Mesh(
  cylinderObject,
  new THREE.MeshBasicMaterial({color: '#ad31de'})
)
fakeRayCaster.position.set(-3, 0, 0)
fakeRayCaster.rotation.z = Math.PI * 0.5

const wireMesh = new THREE.Mesh(cylinderObject, new THREE.MeshBasicMaterial({
  color: '#8b10bb',
  wireframe: true,
}));
wireMesh.scale.setScalar(1.001);
fakeRayCaster.add(wireMesh)

scene.add(object1, object2, object3, fakeRayCaster)

/**
 * raycaster
 */
const raycaster = new THREE.Raycaster()
const rayOrigin = new THREE.Vector3(-3, 0, 0)
const rayDirection = new THREE.Vector3(10, 0, 0)
rayDirection.normalize()
raycaster.set(rayOrigin, rayDirection)

// const intersect = raycaster.intersectObject(object2)
// console.log('intersect', intersect)
//
// const intersects = raycaster.intersectObjects([object1, object2, object3])
// console.log('intersects', intersects)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // animate objects
  object1.position.y = Math.sin(elapsedTime * 1.5) * 1.5
  object2.position.y = Math.sin(elapsedTime) * 1.5
  object3.position.y = Math.sin(elapsedTime * 0.5) * 1.5

  // cast a ray
  const objectsToTest = [object1, object2, object3]
  const intersects = raycaster.intersectObjects(objectsToTest)

  objectsToTest.forEach(item => item.material.color.set('#53ad1a'))
  intersects.forEach(item => item.object.material.color.set('#8b10bb'))

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
