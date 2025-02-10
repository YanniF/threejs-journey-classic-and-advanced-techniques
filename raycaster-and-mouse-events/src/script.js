import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js'
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// ducking duck
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let duckModel = null

gltfLoader.load('./models/Duck/glTF-Draco/Duck.gltf', (obj) => {
  duckModel = obj.scene.children[0]
  duckModel.rotation.y = - Math.PI
  duckModel.position.x = 4
  duckModel.position.y = -1.5
  duckModel.scale.set(.005, .005, .005)
  scene.add(duckModel)
})

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

scene.add(object1, object2, object3)

/**
 * raycaster
 */
const raycaster = new THREE.Raycaster()
let currentIntersect = null

/**
 * lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.8)
scene.add(ambientLight)

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
 * mouse event
 */
const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (event) => {
  mouse.x = event.clientX / sizes.width * 2 - 1
  mouse.y = -(event.clientY / sizes.height) * 2 + 1
})

window.addEventListener('click', () => {
  if (currentIntersect) {
    const objScale = currentIntersect.object.scale
    objScale.set(objScale.x - 0.1, objScale.y - 0.1, objScale.z - 0.1)

    switch(currentIntersect.object) {
      case object1:
        console.log('object 1 clicked')
        break
      case object2:
        console.log('object 2 clicked')
        break
      case object3:
        console.log('object 3 clicked')
        break
    }
  }
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
  raycaster.setFromCamera(mouse, camera)

  const objectsToTest = [object1, object2, object3]
  const intersects = raycaster.intersectObjects(objectsToTest)

  objectsToTest.forEach(item => item.material.color.set('#53ad1a'))
  intersects.forEach(item => item.object.material.color.set('#23cec0'))
  currentIntersect = intersects.length ? intersects[0] : null

  // test intersect with a model
  if (duckModel) {
    const modelIntersects = raycaster.intersectObject(duckModel)

    if (modelIntersects.length) {
        duckModel.scale.setScalar(.008)
    }
    else {
        duckModel.scale.setScalar(.005)
    }
  }

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()

document.querySelector('.message').style.display = 'block'
