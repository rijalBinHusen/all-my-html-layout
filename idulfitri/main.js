import * as THREE from 'three';
import { GLTFLoader } from "loader"

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
// document.body.appendChild( renderer.domElement );
document.getElementById('ketupatContainer').appendChild(renderer.domElement)

// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

camera.position.z = 5;
camera.position.x = 4;
// camera.position.y = -5;


const ambientlight = new THREE.AmbientLight( 0xffffff,  10); // soft white light
scene.add( ambientlight );

const pointLight = new THREE.PointLight( 0xffffff, 1, 100 );
pointLight.position.set( 50, 50, 50 );
scene.add( pointLight );

const loader = new GLTFLoader();
let ketupat;

loader.load( 'ketupat/scene.gltf', function ( gltf ) {
    ketupat = gltf.scene
    ketupat.scale.set(30, 30, 30)
	scene.add( ketupat );
    ketupat.rotation.z = 0.3
}, undefined, function ( error ) {

	console.error( error );

} );

function animate() {
	requestAnimationFrame( animate );
    if(ketupat){
        ketupat.rotation.y  += 0.01;
    }
	renderer.render( scene, camera );
}

animate();