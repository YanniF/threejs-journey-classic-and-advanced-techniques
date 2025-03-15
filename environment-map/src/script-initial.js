import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import {GLTFLoader, RGBELoader, EXRLoader} from "three/addons";

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()
// const cubeTextureLoader = new THREE.CubeTextureLoader()
const rgbeLoader = new RGBELoader()
// const exrLoader = new EXRLoader()
// const textureLoader = new THREE.TextureLoader()

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
 * environment maps
 */
// LDR cube texture
// const cubeEnvMap = cubeTextureLoader.load([
//   '/environmentMaps/2/px.png',
//   '/environmentMaps/2/nx.png',
//   '/environmentMaps/2/py.png',
//   '/environmentMaps/2/ny.png',
//   '/environmentMaps/2/pz.png',
//   '/environmentMaps/2/nz.png',
// ])
//
// scene.background = cubeEnvMap
// scene.environment = cubeEnvMap

// EXR loader
// exrLoader.load('/environmentMaps/nvidiaCanvas-4k.exr', (hdri) => {
//   hdri.mapping = THREE.EquirectangularReflectionMapping
//
//   scene.background = hdri
//   scene.environment = hdri
// })

// LDR
// const envMap = textureLoader.load('/environmentMaps/blockadesLabsSkybox/anime_art_style_japan_streets_with_cherry_blossom_.jpg')
// envMap.mapping = THREE.EquirectangularReflectionMapping
// envMap.colorSpace = THREE.SRGBColorSpace
// scene.background = envMap
// scene.environment = envMap

// HDR texture
rgbeLoader.load('/environmentMaps/2/2k.hdr', (hdri) => {
  hdri.mapping = THREE.EquirectangularReflectionMapping

  scene.background = hdri
  scene.environment = hdri
})


scene.environmentIntensity = 1
scene.backgroundIntensity = 1
scene.backgroundBlurriness = 0

gui.add(scene, 'environmentIntensity').min(0).max(10).step(0.01).name('Env intensity')
gui.add(scene, 'backgroundIntensity').min(0).max(1).step(0.001).name('Background intensity')
gui.add(scene, 'backgroundBlurriness').min(0).max(1).step(0.001).name('Background Blurriness')
gui.add(scene.backgroundRotation, 'y').min(0).max(Math.PI * 2).step(0.001).name('Background rotation Y')
gui.add(scene.environmentRotation, 'y').min(0).max(Math.PI * 2).step(0.001).name('Env rotation Y')

/**
 * Torus Knot
 */
const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
  new THREE.MeshStandardMaterial({color: '#aaaaaa', roughness: .3, metalness: 1})
)
// torusKnot.material.envMap = cubeEnvMap
torusKnot.position.x = -4
torusKnot.position.y = 4
scene.add(torusKnot)

/**
 * models
 */
gltfLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf',
  (gltf) => {
    gltf.scene.scale.set(10, 10, 10)
    scene.add(gltf.scene)
  },
  undefined,
  (error) => console.error(error)
)

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
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
const tick = () => {
  // Time
  const elapsedTime = clock.getElapsedTime()

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()