import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'
import * as CANNON from 'cannon-es'

const images = [
	"https://res.cloudinary.com/vth20/image/upload/v1673801128/bau-cua/nldy4lswr136nhnluqwy.png", //bau
	"https://res.cloudinary.com/vth20/image/upload/v1673801127/bau-cua/xb4m41ctnqka22loukrc.png", //cua
	"https://res.cloudinary.com/vth20/image/upload/v1673801128/bau-cua/w4aya0r0agh9ofwpgiuq.png", //tom
	"https://res.cloudinary.com/vth20/image/upload/v1673801127/bau-cua/pqpsg24ykibvxwkxubfk.png", //ca
	"https://res.cloudinary.com/vth20/image/upload/v1673801129/bau-cua/cojizdxyklkyujbysiss.png", //nai
	"https://res.cloudinary.com/vth20/image/upload/v1673801128/bau-cua/jarou4msolhk4mkkmvtv.png", //ga
]
let vibrate = false;
const cubes = [];
const positions = [{ x: -2, y: 3, z: -1 }, { x: 0, y: 3, z: -1 }, { x: 2, y: 3, z: -1 }]
const scene = new THREE.Scene()

const showAxesHelper = false

if(showAxesHelper) {
	const axesHelper = new THREE.AxesHelper(5);
	scene.add(axesHelper);
}


// anhs sangs
const createLight = (x, y, z, power) => {
	const light = new THREE.SpotLight()
	light.position.set(x, y, z)
	light.angle = Math.PI / 4
	light.penumbra = 0.5
	light.castShadow = true
	light.shadow.mapSize.width = 1024
	light.shadow.mapSize.height = 1024
	light.shadow.camera.near = 0.5
	light.shadow.camera.far = 20
	if (power) {
		light.power = power
	}
	scene.add(light)
}
createLight(2.5, 5, 5)
createLight(-2.5, 5, 5)
// createLight(10, 10, -10, 0.9)
// createLight(-10, 10, -10, 0.9)
const camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,1000)
// set vi tri camera
camera.position.set(2, 5, 4)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.y = 0.5

const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)
// world.broadphase = new CANNON.NaiveBroadphase()
// ;(world.solver as CANNON.GSSolver).iterations = 10
// world.allowSleep = true

const phongMaterial = new THREE.MeshPhongMaterial()

//cube textureloader
let loader = new THREE.TextureLoader()

var cubeMaterial = images.map(image => {
	return new THREE.MeshLambertMaterial({ map: loader.load(image) })
});

function randomCubeMaterial() {

}

const cube = function (x, y, z, size = 1) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.size = size;
	const SPEED = 0.1;
	const cubeGeometry = new THREE.BoxGeometry(size, size, size)
	this.cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial)
	const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
	const cubeBody = new CANNON.Body({ mass: 1 })

	this.draw = function () {
		// cube geometry
		this.cubeMesh.position.x = x
		this.cubeMesh.position.y = y
		this.cubeMesh.position.z = z
		this.cubeMesh.castShadow = true
		scene.add(this.cubeMesh)
		cubeBody.addShape(cubeShape)
		cubeBody.position.x = this.cubeMesh.position.x
		cubeBody.position.y = this.cubeMesh.position.y
		cubeBody.position.z = this.cubeMesh.position.z
		world.addBody(cubeBody)
	}

	this.update = function () {
		// Copy coordinates from Cannon to Three.js
		this.cubeMesh.position.set(
			cubeBody.position.x,
			cubeBody.position.y,
			cubeBody.position.z
		)
		this.cubeMesh.quaternion.set(
			cubeBody.quaternion.x,
			cubeBody.quaternion.y,
			cubeBody.quaternion.z,
			cubeBody.quaternion.w
		)
	}

	this.startVibrate = function () {
		vibrate = true
		if (this.cubeMesh.position.y <3) {
			this.cubeMesh.position.y = this.cubeMesh.position.y+0.5;
		}
		this.cubeMesh.rotation.x -= Math.abs(SPEED * Math.random());
		this.cubeMesh.rotation.y -= Math.abs(SPEED * Math.random());
		this.cubeMesh.rotation.z -= Math.abs(SPEED * Math.random());
		// cubeBody.rotate
	}
	this.stopVibrate = function () {
		// Copy coordinates from Cannon to Three.js
		vibrate = false
		console.log(this.cubeMesh.rotation.x);
		console.log(this.cubeMesh.rotation.y);
		console.log(this.cubeMesh.rotation.z);
		this.cubeMesh.rotation.x = this.cubeMesh.rotation.x
		this.cubeMesh.rotation.y = this.cubeMesh.rotation.y
		this.cubeMesh.rotation.z = this.cubeMesh.rotation.z
		cubeBody.position.x = Math.abs(this.cubeMesh.position.x)
		cubeBody.position.y = Math.abs(this.cubeMesh.position.y)
		cubeBody.position.z = Math.abs(this.cubeMesh.position.z)
		// this.cubeMesh.position.set(
		// 	cubeBody.position.x,
		// 	cubeBody.position.y,
		// 	cubeBody.position.z
		// )
		console.log("w",cubeBody.quaternion.w);
		this.cubeMesh.quaternion.set(
			cubeBody.position.x,
			cubeBody.position.y,
			cubeBody.position.z,
			cubeBody.quaternion.w
		)
	}
}
createCubes()
function createCubes() {
	positions.forEach(position => {
		const newCube = new cube(position.x, position.y, position.z)
		cubes.push(newCube)
	})
}

cubes.forEach(cube => {
	cube.draw()
})

// flat
const planeGeometry = new THREE.PlaneGeometry(25, 25)
const planeMesh = new THREE.Mesh(planeGeometry, phongMaterial)
planeMesh.rotateX(-Math.PI / 2)
planeMesh.receiveShadow = true
scene.add(planeMesh)
const planeShape = new CANNON.Plane()
const planeBody = new CANNON.Body({ mass: 0 })
planeBody.addShape(planeShape)
planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
world.addBody(planeBody)

var floorMaterial = new THREE.MeshLambertMaterial({ map: loader.load("https://farm4.static.flickr.com/3085/3211688284_7b78edb539_b.jpg") })
const floor = new THREE.PlaneGeometry(6, 3)
const floorMesh = new THREE.Mesh(floor, floorMaterial)
floorMesh.rotateX(-Math.PI / 2)
floorMesh.position.y = 0.01;
floorMesh.position.z = 1.2;
floorMesh.receiveShadow = true
scene.add(floorMesh)
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body({ mass: 0 })
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
world.addBody(floorBody)


window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
	render()
}

window.addEventListener('keydown', startVibrateCube)
window.addEventListener('keyup', stopVibrateCube)

function startVibrateCube(e) {
	console.log(e);
	if (e.keyCode === 13) {
		cubes.forEach(cube => {
			cube.startVibrate()
		})
	}
}

function stopVibrateCube(e) {
	console.log(e);
	if (e.keyCode === 13) {
		cubes.forEach(cube => {
			cube.stopVibrate()
		})
	}
}

const stats = Stats()
console.log(stats);
document.body.appendChild(stats.dom)

const gui = new GUI()
const physicsFolder = gui.addFolder('Physics')
physicsFolder.add(world.gravity, 'x', -10.0, 10.0, 0.1)
physicsFolder.add(world.gravity, 'y', -10.0, 10.0, 0.1)
physicsFolder.add(world.gravity, 'z', -10.0, 10.0, 0.1)
physicsFolder.open()
const cameraFolder = gui.addFolder('Camera')
cameraFolder.add(camera.position, 'z', 0, 10)
cameraFolder.open()

const clock = new THREE.Clock()
// let delta

function animate() {
	requestAnimationFrame(animate)

	// if(!vibrate) {
		cubes.forEach(cube => {
			cube.update()
		})
	// }
	controls.update()
	// delta = clock.getDelta()
	delta = Math.min(clock.getDelta(), 0.1)
	world.step(delta)

	render()

	stats.update()
}

function render() {
	renderer.render(scene, camera)
}

animate()