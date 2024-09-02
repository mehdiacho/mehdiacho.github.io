import { createRoot } from 'react-dom/client'
import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three';

function Box(props) {
    // This reference will give us direct access to the mesh
    const meshRef = useRef()
    // Set up state for the hovered and active state
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)
    // Subscribe this component to the render-loop, rotate the mesh every frame
    useFrame((state, delta) => (meshRef.current.rotation.z += delta))
    // Return view, these are regular three.js elements expressed in JSX
    return (
        <mesh
            {...props}
            ref={meshRef}
            scale={active ? 1.5 : 1}
            onClick={() => setActive(!active)}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}>
            {/* eslint-disable-next-line react/no-unknown-property */}
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
        </mesh>
    )
}

const View = () => {
    return (
        createRoot(document.getElementById('root')).render(
            <Canvas>
                <ambientLight intensity={Math.PI/2} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
                <pointLight position={[-20, -10, -10]} decay={0} intensity={Math.PI} />
                <Box position={[-1.2, 1, 2]} />
                <Box position={[1.2, -1, -2]} />
                <Box position={[3.2, 1, 2]} />
                <Box position={[5.6, -1, -2]} />
            </Canvas>,
        )
    );
};

/*const View = () => {
    return (
        <div>
            <h1>Hello Again Again World! </h1>
        </div>
    );
};*/

const Movie = () => {
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
    renderer.setAnimationLoop( animate );
    return (
        renderer
    );
};

export {View, Movie};


