import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js'

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()
const rgbeLoader = new RGBELoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

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
 * Update all materials
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child.isMesh && child.material.isMeshStandardMaterial) {
      // performance improvement: only set it to true for objects that need to cast and receive shadows, not all the objects in the scene
      child.castShadow = true
      child.receiveShadow = true
    }
  })
}

/**
 * Environment map
 */
// Intensity
scene.environmentIntensity = 1
gui
  .add(scene, 'environmentIntensity')
  .min(0)
  .max(10)
  .step(0.001)

// HDR (RGBE) equirectangular
rgbeLoader.load('/environmentMaps/0/2k.hdr', (environmentMap) => {
  environmentMap.mapping = THREE.EquirectangularReflectionMapping

  scene.background = environmentMap
  scene.environment = environmentMap
})

// directional light
const directionalLight = new THREE.DirectionalLight('#ffffff', 6)
directionalLight.position.set(-4, 6.5, 2.5)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)
scene.add(directionalLight)

// target
directionalLight.target.position.set(-3, 4, 0)
directionalLight.target.updateWorldMatrix()


const lightFolder = gui.addFolder('Directional Light')
lightFolder.add(directionalLight, 'intensity').min(0).max(30).step(0.01)
lightFolder.add(directionalLight, 'castShadow')
lightFolder.add(directionalLight.position, 'x').min(-10).max(10).step(0.001)
lightFolder.add(directionalLight.position, 'y').min(-10).max(10).step(0.001)
lightFolder.add(directionalLight.position, 'z').min(-10).max(10).step(0.001)

const directionLightHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
directionLightHelper.visible = false
scene.add(directionLightHelper)

lightFolder.add(directionLightHelper, 'visible').name('directionLightShadowHelper')

/**
 * Models
 */
// Helmet
gltfLoader.load(
  '/models/FlightHelmet/glTF/FlightHelmet.gltf',
  (gltf) => {
    gltf.scene.scale.set(10, 10, 10)
    scene.add(gltf.scene)

    updateAllMaterials()
  }
)

// hamburger
gltfLoader.setDRACOLoader(dracoLoader)
gltfLoader.load('/models/hamburger.glb', obj => {
  obj.scene.scale.set(0.25, 0.25, 0.25)
  obj.scene.position.x = -5
  obj.scene.position.y = 3

  scene.add(obj.scene)
})

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
camera.position.set(4, 5, 4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3.5
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: window.devicePixelRatio === 1, // screens with a pixel ratio above 1 don't need antialias
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// tone mapping
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 3

const toneMapping = gui.addFolder('Tone Mapping')
toneMapping.add(renderer, 'toneMapping', {
  No: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reingard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACESF: THREE.ACESFilmicToneMapping,
})
toneMapping.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.01)

/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()