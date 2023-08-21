import * as THREE from 'three'
import { render } from 'react-dom'
import React, { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import './styles.css'
import { OrbitControls } from '@react-three/drei'

extend({ EffectComposer, RenderPass, UnrealBloomPass })

function Sphere({ geometry, x, y, z, s }) {
  const ref = useRef()
  useFrame((state) => {
    ref.current.position.x = x + Math.sin((state.clock.getElapsedTime() * s) / 2)
    ref.current.position.y = y + Math.sin((state.clock.getElapsedTime() * s) / 2)
    ref.current.position.z = z + Math.sin((state.clock.getElapsedTime() * s) / 2)
  })
  return (
    <mesh ref={ref} position={[x, y, z]} scale={[s, s, s]} geometry={geometry}>
      <meshStandardMaterial color="hotpink" roughness={1} />
    </mesh>
  )
}

function RandomSpheres() {
  const [geometry] = useState(() => new THREE.SphereGeometry(1, 32, 32), [])

  const databis = useMemo(() => {
    const size = 4
    const data = []
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        data.push({
          x: x * 20, // Multiplier par 10 pour avoir un espacement de 10 unités entre chaque sphère
          y: y * 20,
          z: 0, // z est fixe car c'est une grille 2D
          s: 10,
        })
      }
    }
    return data
  }, [])

  const data = useMemo(() => {
    return new Array(15).fill().map((_, i) => ({
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      z: Math.random() * 100 - 50,
      s: Math.random() + 10,
    }))
  }, [])

  return databis.map((props, i) => <Sphere key={i} {...props} geometry={geometry} />)
}

function Bloom({ children }) {
  const { gl, camera, size } = useThree()
  const [scene, setScene] = useState()
  const composer = useRef()
  useEffect(() => void scene && composer.current.setSize(size.width, size.height), [size])
  useFrame(() => scene && composer.current.render(), 1)
  return (
    <>
      <scene ref={setScene}>{children}</scene>
      <effectComposer ref={composer} args={[gl]}>
        <renderPass attachArray="passes" scene={scene} camera={camera} />
        <unrealBloomPass attachArray="passes" args={[undefined, 1.5, 1, 0]} />
      </effectComposer>
    </>
  )
}

function Main({ children }) {
  const scene = useRef()
  const { gl, camera } = useThree()
  useFrame(() => {
    gl.autoClear = false
    gl.clearDepth()
    gl.render(scene.current, camera)
  }, 2)
  return <scene ref={scene}>{children}</scene>
}

render(
  <Canvas linear camera={{ position: [0, 0, 120] }}>
    <OrbitControls />
    <Main>
      <pointLight />
      <ambientLight />
      <RandomSpheres />
    </Main>
    <Bloom>
      <ambientLight />
      <RandomSpheres />
    </Bloom>
  </Canvas>,
  document.querySelector('#root'),
)
