import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)

/*
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight, 0.1, 1000);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const geometry2 = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({color: 0x3ab2f0, lightMapIntensity: Math.PI/2});
const material2 = new THREE.MeshBasicMaterial({color: 0x00ff00, lightMapIntensity: Math.PI/2});
const cube = new THREE.Mesh(geometry, material);
const cube2 = new THREE.Mesh(geometry2, material2);
scene.add (cube);
scene.add (cube2);

camera.position.z = 5;
cube2.position.x = 2
cube2.position.y = 2
cube2.position.z = -1
cube2.rotateOnWorldAxis(cube2.position, 45)

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function animate() {
    cube.rotation.x += 0.0;
    cube2.rotation.x -= 0.00;
    cube.rotation.z += 0.0;
    cube2.rotation.z += 0.03;
    cube.rotation.y += 0.00;
    cube2.rotation.y += 0.00;
    renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );*/
