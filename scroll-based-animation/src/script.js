import * as THREE from 'three'
import GUI from 'lil-gui'
import gsap from 'gsap'

/**
 * Debug
 */
const gui = new GUI()

const parameters = {
  materialColor: '#bc8ecd'
}

gui.addColor(parameters, 'materialColor').onChange(() => {
  material.color.set(parameters.materialColor)
  particlesMaterial.color.set(parameters.materialColor)
})

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
const objectsDistance = 4

// Texture
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('textures/gradients/3-purple.jpg')
gradientTexture.magFilter = THREE.NearestFilter
gradientTexture.colorSpace = THREE.SRGBColorSpace

// Material
const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture
})

// Mesh
const mesh1 = new THREE.Mesh(
  new THREE.TorusGeometry(1, .4, 16, 60),
  material
)

const mesh2 = new THREE.Mesh(
  new THREE.ConeGeometry(1, 2, 32),
  material
)

const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(.8, .35, 100, 16),
  material
)

const sectionMeshes = [mesh1, mesh2, mesh3]

// mesh1.position.y = 0
mesh2.position.y = -objectsDistance
mesh3.position.y = -objectsDistance * 2

mesh1.position.x = 2
mesh2.position.x = -2
mesh3.position.x = 2

scene.add(mesh1, mesh2, mesh3)

/**
 * Particles
 */
// Geometry
const particlesCount = 300
const positions = new Float32Array(particlesCount * 3)

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3] = (Math.random() - .5) * 10
  positions[i * 3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * sectionMeshes.length
  positions[i * 3 + 2] = (Math.random() - .5) * 10
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

// Material
const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: .05
})

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.position.set(1, 1, 0)
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
// Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Scroll
 */
let scrollY = window.scrollY
let currentSection = 0

window.addEventListener('scroll', () => {
  scrollY = window.scrollY

  const newSection = Math.round(scrollY / sizes.height)

  if (newSection !== currentSection) {
    currentSection = newSection

    gsap.to(sectionMeshes[currentSection].rotation, {
      duration: 1.5,
      ease: 'power2.inOut',
      x: '+=6',
      y: '+=3',
      z: '+=1.5'
    })
  }
})

/**
 * Cursor
 */
const cursor = {
  x: 0,
  y: 0,
}

window.addEventListener('mousemove', (e) => {
  cursor.x = e.clientX / sizes.width - .5
  cursor.y = e.clientY / sizes.height - .5
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  // animate meshes
  sectionMeshes.forEach(mesh => {
    mesh.rotation.x += deltaTime * .1
    mesh.rotation.y += deltaTime * .12
  })

  // animate camera
  camera.position.y = -scrollY / sizes.height * objectsDistance

  const parallaxX = -cursor.x * .5
  const parallaxY = cursor.y * .5
  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
