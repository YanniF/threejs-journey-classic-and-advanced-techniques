import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import * as CANNON from 'cannon-es'

/**
 * Debug
 */
const gui = new GUI()
const debugObject = {
  createSphere: () => {
    createSphere(
      Math.random() * 0.5 + 0.1, {
      x: (Math.random() - 0.5) * 5,
      y: 3,
      z: (Math.random() - 0.5) * 5
    })
  },
  createBox: () => {
    createBox(
      Math.random() + 0.08,
      Math.random() + 0.08,
      Math.random() + 0.08,
      {
        x: (Math.random() - 0.5) * 3,
        y: 4,
        z: (Math.random() - 0.5) * 3
      })
  },
  resetScene: () => {
    objectsToUpdate.forEach((object) => {
      // remove body
      object.body.removeEventListener('collide', playHitSound)
      world.removeBody(object.body)

      // remove mesh
      scene.remove(object.mesh)
    })

    objectsToUpdate.splice(0, objectsToUpdate.length)
  }
}
gui.add(debugObject, 'createSphere').name('Add Sphere')
gui.add(debugObject, 'createBox').name('Add Box')
gui.add(debugObject, 'resetScene').name('Reset Scene')

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sounds
 */
const hitSound = new Audio('/sounds/hit.mp3')

const playHitSound = (collision) => {
  const impactStrength = collision.contact.getImpactVelocityAlongNormal()

  if (impactStrength > 1) {
    hitSound.currentTime = 0
    hitSound.volume = impactStrength >= 10 ? 1 : impactStrength / 10
    hitSound.play()
  }
}

/**
 * Textures
 */
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
  '/textures/environmentMaps/0/px.png',
  '/textures/environmentMaps/0/nx.png',
  '/textures/environmentMaps/0/py.png',
  '/textures/environmentMaps/0/ny.png',
  '/textures/environmentMaps/0/pz.png',
  '/textures/environmentMaps/0/nz.png'
])

/**
 * Physics
 */
// world
const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world) // algorithm for testing collision
world.allowSleep = true
world.gravity.set(0, -9.82, 0)

// materials
const defaultMaterial = new CANNON.Material('default')
const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
  frictional: .1,
  restitution: .7,
})
world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial

// floor
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body({
  shape: floorShape,
})
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
world.addBody(floorBody)

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: '#7fa9cb',
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5
  })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

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
camera.position.set(- 3, 3, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Utils
 */
const objectsToUpdate = []
const sphereGeometry =  new THREE.SphereGeometry(1, 20, 20)

const createSphere = (radius, position) => {
  // to make things more performant, I could have used only one material, but I want to have different colors
  const mesh = new THREE.Mesh(
    sphereGeometry,
    new THREE.MeshStandardMaterial({
      color: new THREE.Color().setRGB(Math.random(), Math.random(), Math.random()),
      metalness: .3,
      roughness: .4,
      envMap: environmentMapTexture
    })
  )

  mesh.scale.set(radius, radius, radius)
  mesh.castShadow = true
  mesh.position.copy(position)

  scene.add(mesh)

  const body = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Sphere(radius)
  })
  body.position.copy(position)
  body.addEventListener('collide', playHitSound)

  world.addBody(body)

  objectsToUpdate.push({ mesh, body })
}

createSphere(.5, { x: 0, y: 3, z: 0 })

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({
  metalness: .3,
  roughness: .4,
  envMap: environmentMapTexture
})

const createBox = (width, height, depth, position) => {
  const mesh = new THREE.Mesh(boxGeometry, boxMaterial)

  mesh.scale.set(width, height, depth)
  mesh.castShadow = true
  mesh.position.copy(position)
  scene.add(mesh)

  // it's divided by 2 because it starts from the center of the box
  const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2))

  const body = new CANNON.Body({
    mass: 1,
    shape
  })
  body.position.copy(position)
  body.addEventListener('collide', playHitSound)

  world.addBody(body)

  objectsToUpdate.push({ mesh, body })
}

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - oldElapsedTime
  oldElapsedTime = elapsedTime

  // update physics world
  // 60 = 60 fps
  world.step(1 / 60, deltaTime, 3)

  objectsToUpdate.forEach(obj => {
    obj.mesh.position.copy(obj.body.position)
    obj.mesh.quaternion.copy(obj.body.quaternion)
  })

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
