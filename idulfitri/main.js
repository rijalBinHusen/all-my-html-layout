import * as THREE from 'three';
import { OrbitControls } from "controls";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;
// camera.position.x = 4;
// camera.position.y = -5;

const ambientlight = new THREE.AmbientLight( 0xffffff,  0.5); // soft white light
scene.add( ambientlight );

const pointLight = new THREE.PointLight( 0xffffff, 1, 100 );
pointLight.position.set( 50, 50, 50 );
scene.add( pointLight );

function animate() {
	requestAnimationFrame( animate );
    cube.rotation.z  += 0.01;
	renderer.render( scene, camera );
    controls.update()
}

animate();