'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

// Hyperbolic Saddle Surface Component
function SaddleSurface({ curvature }: { curvature: number }) {
  const geometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(4, 4, 32, 32)
    const positions = geometry.attributes.position.array as Float32Array
    
    // Apply hyperbolic paraboloid equation: z = k * x * y
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const y = positions[i + 1]
      positions[i + 2] = curvature * x * y * 0.5 // z = k * x * y (saddle equation)
    }
    
    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
    return geometry
  }, [curvature])

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 6, 0, 0]}>
      <meshStandardMaterial 
        color="#ff6b9d" 
        wireframe={true} 
        transparent={true} 
        opacity={0.8}
      />
    </mesh>
  )
}

// Spherical Surface Component - Gradually curves from flat to dome
function SphericalSurface({ curvature }: { curvature: number }) {
  const geometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(4, 4, 32, 32)
    const positions = geometry.attributes.position.array as Float32Array
    
    // Apply spherical curvature: z = -k * sqrt(R^2 - x^2 - y^2) + R
    // This creates a dome that gradually increases in curvature
    const radius = 4 // Base radius for sphere calculation
    
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const y = positions[i + 1]
      const distanceSquared = x * x + y * y
      
      // Only apply curvature within the radius
      if (distanceSquared < radius * radius) {
        // Calculate height on sphere surface: z = sqrt(R^2 - x^2 - y^2)
        const sphereHeight = Math.sqrt(radius * radius - distanceSquared)
        // Apply curvature strength - multiply by curvature factor
        positions[i + 2] = curvature * (sphereHeight - radius) * 0.5
      }
    }
    
    geometry.attributes.position.needsUpdate = true
    geometry.computeVertexNormals()
    return geometry
  }, [curvature])

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 6, 0, 0]}>
      <meshStandardMaterial 
        color="#ff9f43" 
        wireframe={true} 
        transparent={true} 
        opacity={0.8}
      />
    </mesh>
  )
}

// Flat Surface Component
function FlatSurface() {
  return (
    <mesh rotation={[-Math.PI / 6, 0, 0]}>
      <planeGeometry args={[4, 4, 16, 16]} />
      <meshStandardMaterial 
        color="#74b9ff" 
        wireframe={true} 
        transparent={true} 
        opacity={0.8}
      />
    </mesh>
  )
}

// Main 3D Universe Geometry Component
export function UniverseGeometry3D({ density }: { density: number }) {
  // Determine geometry type and curvature strength with smaller flat threshold
  const geometryType = Math.abs(density - 1) < 0.005 ? 'flat' : density > 1 ? 'closed' : 'open'
  
  // Calculate curvature strength with higher sensitivity
  // For closed: smooth transition from 0 to 1 as density goes from 1.0 to 1.5
  // For open: smooth transition from 0 to 1 as density goes from 1.0 to 0.5
  const curvatureStrength = geometryType === 'closed' 
    ? Math.min((density - 1) * 3, 1.5) // Increased multiplier for more visible curvature
    : Math.min((1 - density) * 3, 1.5)

  const getLabel = () => {
    if (geometryType === 'flat') return { label: 'FLAT', desc: 'Ω = 1.000', color: '#74b9ff' }
    if (geometryType === 'closed') return { label: 'CLOSED', desc: `Ω = ${density.toFixed(3)}`, color: '#ff9f43' }
    return { label: 'OPEN', desc: `Ω = ${density.toFixed(3)}`, color: '#ff6b9d' }
  }

  const { label, desc, color } = getLabel()

  return (
    <div className="relative w-full h-full bg-black/30 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [5, 3, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        {/* Render appropriate surface */}
        {geometryType === 'flat' && <FlatSurface />}
        {geometryType === 'closed' && <SphericalSurface curvature={curvatureStrength} />}
        {geometryType === 'open' && <SaddleSurface curvature={curvatureStrength} />}

        {/* Camera controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          maxPolarAngle={Math.PI / 2}
          minDistance={3}
          maxDistance={15}
        />
      </Canvas>

      {/* Label overlay */}
      <div className="absolute top-4 left-4 bg-black/70 rounded px-3 py-2">
        <div className="text-sm font-bold" style={{ color }}>
          {label}
        </div>
        <div className="text-xs text-white/80">
          {desc}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 text-xs text-white/60">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  )
}
