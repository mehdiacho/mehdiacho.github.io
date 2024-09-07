import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

const Cell = ({ position, onClick, symbol, isXNext }) => {
  const color = symbol === 'X' ? '#ffd700' : symbol === 'O' ? '#1e90ff' : (isXNext ? '#1e90ff' : '#ffd700');
  
  return (
    <group position={position}>
      <mesh onClick={onClick}>
        <boxGeometry args={[0.9, 0.9, 0.2]} />
        <meshPhysicalMaterial 
          color={color}
          transparent
          roughness={0.1}
          metalness={0.2}
          clearcoat={0.5}
          clearcoatRoughness={0.1}
          transmission={0.5}
          reflectivity={0.7}
          sheen={0.8}
        />
      </mesh>
    </group>
  );
};

const ScatteredPiece = ({ position, rotation, scale, symbol, isPlaced, targetPosition, orbitRadius, orbitY, orbitSpeed, orbitAngle }) => {
  const meshRef = useRef();
  const [currentPosition, setCurrentPosition] = useState(position);
  const [isAnimating, setIsAnimating] = useState(false);
  const [finalRotation, setFinalRotation] = useState(rotation);
  const [currentOrbitAngle, setCurrentOrbitAngle] = useState(orbitAngle);

  useEffect(() => {
    if (isPlaced && !isAnimating) {
      setIsAnimating(true);
      setFinalRotation([Math.PI / 2, 0, 0]);
    }
  }, [isPlaced, isAnimating]);

  useFrame((state, delta) => {
    if (!isPlaced) {
      setCurrentOrbitAngle(prev => prev + orbitSpeed * delta);
      const newX = orbitRadius * Math.cos(currentOrbitAngle);
      const newZ = orbitRadius * Math.sin(currentOrbitAngle);
      setCurrentPosition([newX, orbitY, newZ]);
    } else if (isAnimating) {
      const newPosition = new THREE.Vector3(...currentPosition);
      newPosition.lerp(new THREE.Vector3(...targetPosition), 0.1);
      setCurrentPosition([newPosition.x, newPosition.y, newPosition.z]);

      if (newPosition.distanceTo(new THREE.Vector3(...targetPosition)) < 0.01) {
        setIsAnimating(false);
      }

      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, finalRotation[0], 0.1);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, finalRotation[1], 0.1);
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, finalRotation[2], 0.1);
    }
  });

  const pieceGeometry = useMemo(() => {
    if (symbol === 'X') {
      const shape = new THREE.Shape();
      shape.moveTo(-0.5, -0.5);
      shape.lineTo(-0.3, -0.5);
      shape.lineTo(0, -0.2);
      shape.lineTo(0.3, -0.5);
      shape.lineTo(0.5, -0.5);
      shape.lineTo(0.2, 0);
      shape.lineTo(0.5, 0.5);
      shape.lineTo(0.3, 0.5);
      shape.lineTo(0, 0.2);
      shape.lineTo(-0.3, 0.5);
      shape.lineTo(-0.5, 0.5);
      shape.lineTo(-0.2, 0);
      shape.lineTo(-0.5, -0.5);
      const extrudeSettings = {
        steps: 2,
        depth: 0.2,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelOffset: 0,
        bevelSegments: 5
      };
      return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    } else {
      return new THREE.TorusGeometry(0.4, 0.1, 16, 50);
    }
  }, [symbol]);

  return (
    <group position={currentPosition} scale={isPlaced ? 0.4 : scale}>
      <mesh ref={meshRef} rotation={isAnimating ? meshRef.current.rotation : rotation} geometry={pieceGeometry}>
        {symbol === 'X' ? (
          <meshPhysicalMaterial
            color="#1e90ff"
            emissive="#1e90ff"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        ) : (
          <meshPhysicalMaterial
            color="#ffd700"
            emissive="#ffd700"
            emissiveIntensity={0.5}
            metalness={1}
            roughness={0.3}
          />
        )}
      </mesh>
    </group>
  );
};

const TicTacToe3D = ({isIdle}) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xScore, setXScore] = useState(0);
  const [oScore, setOScore] = useState(0);
  const [isXNext, setIsXNext] = useState(true);
  const [isSpinning, setIsSpinning] = useState(true);
  const [scatteredPieces, setScatteredPieces] = useState([]);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const orbitControlsRef = useRef();
  const { scene, camera } = useThree();
  const boardRef = useRef();
  const boardMaterialRef = useRef();
  const fogRef = useRef(new THREE.Fog('#e6f2ff', 2, 5));
  const targetRotation = useRef(new THREE.Euler(0, 0, 0));

  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const currentTime = Date.now();
      setElapsedTime(Math.floor((currentTime - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    camera.position.set(0, 0, 5);
    scene.background = new THREE.Color('#e6f2ff');
    scene.fog = fogRef.current;

    // Generate scattered pieces
    const pieces = [];
    const totalPieces = 1000;
    for (let i = 0; i < totalPieces; i++) {
      const radius = 5 + Math.random() * 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      pieces.push({
        position: [x, y, z],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ],
        scale: 0.1 + Math.random() * 0.2,
        symbol: i < totalPieces / 2 ? 'X' : 'O',
        isPlaced: false,
        targetPosition: [0, 0, 0],
        orbitRadius: Math.sqrt(x*x + z*z), // Distance from y-axis
        orbitY: y, // Keep y position constant during orbit
        orbitSpeed: 0.1 + Math.random() * 0.2,
        orbitAngle: Math.atan2(z, x), // Initial angle
      });
    }
    setScatteredPieces(pieces);
  }, [camera, scene]);

  useEffect(() => {
    if (isIdle || elapsedTime < 10) {
      setIsSpinning(true);
      setIsOrbiting(false);
      targetRotation.current.set(0, Math.PI / 4, 0);
      
    } else {
      handleBoardClick();
    }
  }, [isIdle]);

  useFrame((state, delta) => {
    if (orbitControlsRef.current) {
      orbitControlsRef.current.update();
    }
    if (boardMaterialRef.current) {
      boardMaterialRef.current.color.lerp(
        new THREE.Color(isXNext ? '#1e90ff' : '#ffd700'),
        0.1
      );
    }
    if (boardRef.current) {
      if (isSpinning) {
        boardRef.current.rotation.y += delta * 0.3;
        boardRef.current.rotation.x += delta * 0.1;
        boardRef.current.rotation.z += delta * 0.2;
      } else {
        boardRef.current.rotation.x = THREE.MathUtils.lerp(boardRef.current.rotation.x, targetRotation.current.x, 0.1);
        boardRef.current.rotation.y = THREE.MathUtils.lerp(boardRef.current.rotation.y, targetRotation.current.y, 0.1);
        boardRef.current.rotation.z = THREE.MathUtils.lerp(boardRef.current.rotation.z, targetRotation.current.z, 0.1);
      }
    }
    // Animate fog
    if (!isSpinning && fogRef.current.near < 5) {
      fogRef.current.near += delta * 2;
      fogRef.current.far += delta * 6;
      fogRef.current.near = Math.min(fogRef.current.near, 5);
      fogRef.current.far = Math.min(fogRef.current.far, 20);
    }
  });

  const handleBoardClick = () => {
    if (isSpinning) {
      setIsSpinning(false);
      setIsOrbiting(true);
      targetRotation.current.set(0, 0, 0);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setScatteredPieces(prevPieces => prevPieces.map(piece => ({ ...piece, isPlaced: false })));
  };
  
  const updateScore = (winner) => {
    if (winner === 'X') {
      setXScore(prev => prev + 1);
    } else if (winner === 'O') {
      setOScore(prev => prev + 1);
    }
  };

  const handleCellClick = (index) => {
    if (isSpinning) return;
    if (board[index] || calculateWinner(board)) return;
  
    const newBoard = [...board];
    const currentSymbol = isXNext ? 'X' : 'O';
    newBoard[index] = currentSymbol;
  
    // Find an available scattered piece and animate it
    const availablePieces = scatteredPieces.filter(piece => !piece.isPlaced && piece.symbol === currentSymbol);
    if (availablePieces.length > 0) {
      const randomIndex = Math.floor(Math.random() * availablePieces.length);
      const selectedPiece = availablePieces[randomIndex];
      const newScatteredPieces = scatteredPieces.map(piece => 
        piece === selectedPiece 
          ? { ...piece, isPlaced: true, targetPosition: [
              (index % 3) - 1,
              -Math.floor(index / 3) + 1,
              0 // Place it in the center of the board
            ]}
          : piece
      );
      setScatteredPieces(newScatteredPieces);
    }
  
    setBoard(newBoard);
    setIsXNext(!isXNext);
  
    const winner = calculateWinner(newBoard);
    if (winner) {
      updateScore(winner);
      setTimeout(resetGame, 2000); // Reset the game after 2 seconds
    }
  };

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} castShadow />
      <OrbitControls ref={orbitControlsRef} enableZoom={true} />
      <group ref={boardRef} position={[0, 0, 0]} onClick={handleBoardClick}>
        <mesh receiveShadow>
          <boxGeometry args={[3, 3, 0.1]} />
          <meshPhysicalMaterial 
            ref={boardMaterialRef}
            transparent
            opacity={0.3}
            roughness={0.1}
            metalness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
            transmission={0.9}
            reflectivity={0.1}
            sheen={0.3}
          />
        </mesh>
        {board.map((symbol, index) => (
          <Cell
            key={index}
            position={[
              (index % 3) - 1,
              -Math.floor(index / 3) + 1,
              0
            ]}
            onClick={() => handleCellClick(index)}
            symbol={symbol}
            isXNext={isXNext}
          />
        ))}
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <shadowMaterial transparent opacity={0.4} />
      </mesh>
      {scatteredPieces.map((piece, index) => (
        <ScatteredPiece 
          key={index} 
          {...piece} 
          orbitRadius={piece.orbitRadius}
          orbitY={piece.orbitY}
          orbitSpeed={piece.orbitSpeed}
          orbitAngle={piece.orbitAngle}
        />
      ))}
      {/*
      <Html position={[-1.5, -2, 0]}>
        <div style={{ background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '5px', color: 'white', backdropFilter: 'blur(5px)' }}>
          <div style={{ display: 'flex', flexDirection: 'row'}}>
            <div>X: </div>
            <div>{score.x}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row'}}>
            <div>O: </div>
            <div>{score.o}</div>
          </div>
        </div>
      </Html>
      <Html position={[1.5, -2, 0]}>
        <button onClick={resetGame} style={{ padding: '5px 10px', background: 'rgba(30,144,255,0.5)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', backdropFilter: 'blur(5px)' }}>
          Reset Game
        </button>
      </Html>
      */}
    </>
  );
};

export default TicTacToe3D;
