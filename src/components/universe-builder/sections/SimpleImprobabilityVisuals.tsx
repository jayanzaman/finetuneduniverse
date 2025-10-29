'use client';

import { useEffect, useRef, useCallback } from 'react'

// Simple Penrose Entropy Visualization
export function SimplePenroseVisual({ entropy }: { entropy: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Make canvas responsive to container size
    const container = canvas.parentElement
    if (container) {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    } else {
      canvas.width = 280
      canvas.height = 180
    }
    
    // Clear canvas
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw phase space
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const maxRadius = 80
    
    // Calculate entropy regions
    const lowEntropyRadius = Math.max(3, maxRadius * (1 - entropy / 10))
    const highEntropyRadius = maxRadius
    
    // Draw high entropy region (vast)
    ctx.fillStyle = 'rgba(255, 100, 100, 0.4)'
    ctx.beginPath()
    ctx.arc(centerX, centerY, highEntropyRadius, 0, 2 * Math.PI)
    ctx.fill()
    
    // Draw low entropy region (tiny)
    ctx.fillStyle = 'rgba(100, 255, 100, 0.9)'
    ctx.beginPath()
    ctx.arc(centerX, centerY, lowEntropyRadius, 0, 2 * Math.PI)
    ctx.fill()
    
    // Add simple labels
    ctx.fillStyle = '#fff'
    ctx.font = '10px sans-serif'
    ctx.fillText('Chaos', centerX + 40, centerY - 30)
    ctx.fillText('Order', centerX - 30, centerY + 40)
    
  }, [entropy])
  
  return <canvas ref={canvasRef} className="w-full h-full border border-white/10 rounded" />
}

// Simple Dark Energy Visualization
export function SimpleDarkEnergyVisual({ lambda }: { lambda: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Make canvas responsive to container size
    const container = canvas.parentElement
    if (container) {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    } else {
      canvas.width = 280
      canvas.height = 180
    }
    
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    const centerY = canvas.height / 2
    const timeScale = canvas.width / 50
    
    // Draw universe evolution
    for (let t = 0; t < 50; t++) {
      const x = t * timeScale
      let scale
      
      if (lambda > 1.2) {
        // Too large - runaway expansion
        scale = Math.exp(lambda * t / 15)
      } else if (lambda < 0.8) {
        // Too small - collapse
        scale = Math.max(0.1, 1 - (1 - lambda) * t / 30)
      } else {
        // Just right - steady expansion
        scale = 1 + lambda * t / 60
      }
      
      const y = centerY - (scale - 1) * 30
      const color = lambda > 1.2 ? 'rgba(255, 100, 100, 0.8)' : 
                   lambda < 0.8 ? 'rgba(255, 150, 0, 0.8)' : 
                   'rgba(100, 255, 100, 0.8)'
      
      ctx.fillStyle = color
      ctx.fillRect(x, Math.max(0, y), 3, Math.min(canvas.height, centerY - y + 30))
    }
    
    // Simple labels
    ctx.fillStyle = '#fff'
    ctx.font = '10px sans-serif'
    ctx.fillText('Universe Size', 10, 15)
    ctx.fillText('Time →', canvas.width - 40, canvas.height - 5)
    
  }, [lambda])
  
  return <canvas ref={canvasRef} className="w-full h-full border border-white/10 rounded" />
}

// Advanced 3D-like Flatness Visualization showing curved spacetime geometries
export function SimpleFlatnessVisual({ density }: { density: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Make canvas responsive to container size
    const container = canvas.parentElement
    if (container) {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    } else {
      canvas.width = 280
      canvas.height = 180
    }
    
    // Clear canvas with dark background
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const gridSize = 16
    const gridSpacing = Math.min(canvas.width, canvas.height) / (gridSize * 0.8)
    
    // Determine geometry type and curvature strength
    let geometryType = 'flat'
    let curvatureStrength = 0
    
    if (Math.abs(density - 1) < 0.02) {
      geometryType = 'flat'
      curvatureStrength = 0
    } else if (density > 1) {
      geometryType = 'closed'
      curvatureStrength = Math.min((density - 1) * 3, 1) // Max curvature at density = 1.33
    } else {
      geometryType = 'open'
      curvatureStrength = Math.min((1 - density) * 3, 1) // Max curvature at density = 0.67
    }
    
    // Draw 3D-like curved grid
    ctx.lineWidth = 1.5
    ctx.globalAlpha = 0.7
    
    // Horizontal grid lines with curvature
    for (let i = -gridSize/2; i <= gridSize/2; i++) {
      const y = centerY + i * gridSpacing * 0.8
      
      ctx.beginPath()
      ctx.strokeStyle = i === 0 ? 'rgba(100, 200, 255, 0.9)' : 'rgba(100, 150, 200, 0.6)'
      ctx.lineWidth = i === 0 ? 2 : 1
      
      if (geometryType === 'flat') {
        // Straight lines for flat geometry
        ctx.moveTo(centerX - gridSize * gridSpacing * 0.6, y)
        ctx.lineTo(centerX + gridSize * gridSpacing * 0.6, y)
      } else if (geometryType === 'closed') {
        // Upward curved lines for closed/spherical geometry
        const curve = curvatureStrength * 40 * (1 - Math.abs(i) / (gridSize/2))
        ctx.moveTo(centerX - gridSize * gridSpacing * 0.6, y + curve)
        ctx.quadraticCurveTo(centerX, y - curve * 0.5, centerX + gridSize * gridSpacing * 0.6, y + curve)
      } else {
        // Downward curved lines for open/hyperbolic geometry  
        const curve = curvatureStrength * 35 * (1 - Math.abs(i) / (gridSize/2))
        ctx.moveTo(centerX - gridSize * gridSpacing * 0.6, y - curve)
        ctx.quadraticCurveTo(centerX, y + curve * 0.8, centerX + gridSize * gridSpacing * 0.6, y - curve)
      }
      ctx.stroke()
    }
    
    // Vertical grid lines with perspective and curvature
    for (let i = -gridSize/2; i <= gridSize/2; i++) {
      const baseX = centerX + i * gridSpacing * 1.0
      
      ctx.beginPath()
      ctx.strokeStyle = i === 0 ? 'rgba(100, 200, 255, 0.9)' : 'rgba(100, 150, 200, 0.4)'
      ctx.lineWidth = i === 0 ? 2 : 1
      
      // Add perspective effect - lines converge toward horizon
      const perspectiveFactor = 1 - Math.abs(i) / (gridSize/2) * 0.2
      const topY = centerY - gridSize * gridSpacing * 0.45 * perspectiveFactor
      const bottomY = centerY + gridSize * gridSpacing * 0.45 * perspectiveFactor
      
      if (geometryType === 'flat') {
        // Straight vertical lines
        ctx.moveTo(baseX, topY)
        ctx.lineTo(baseX, bottomY)
      } else if (geometryType === 'closed') {
        // Slightly curved inward for closed geometry
        const curve = curvatureStrength * 12 * perspectiveFactor
        ctx.moveTo(baseX + curve, topY)
        ctx.quadraticCurveTo(baseX - curve * 0.5, centerY, baseX + curve, bottomY)
      } else {
        // Curved outward for open geometry
        const curve = curvatureStrength * 15 * perspectiveFactor
        ctx.moveTo(baseX - curve, topY)
        ctx.quadraticCurveTo(baseX + curve * 0.7, centerY, baseX - curve, bottomY)
      }
      ctx.stroke()
    }
    
    // Add geometry label and description
    ctx.globalAlpha = 1
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    
    let label = ''
    let description = ''
    let color = ''
    
    if (geometryType === 'flat') {
      label = 'FLAT'
      description = 'Ω = 1.000'
      color = 'rgba(100, 255, 100, 0.9)'
    } else if (geometryType === 'closed') {
      label = 'CLOSED'
      description = `Ω = ${density.toFixed(3)}`
      color = 'rgba(255, 150, 100, 0.9)'
    } else {
      label = 'OPEN'
      description = `Ω = ${density.toFixed(3)}`
      color = 'rgba(255, 100, 150, 0.9)'
    }
    
    // Draw label background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(centerX - 40, 15, 80, 35)
    
    // Draw label text
    ctx.fillStyle = color
    ctx.fillText(label, centerX, 30)
    ctx.font = '10px sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.fillText(description, centerX, 45)
    
    // Add subtle animation effect
    const time = Date.now() * 0.001
    const shimmer = Math.sin(time) * 0.1 + 0.9
    ctx.globalAlpha = shimmer
    
    // Draw center reference point
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2)
    ctx.fill()
    
  }, [density])
  
  return (
    <canvas 
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: 'auto' }}
    />
  )
}

// Simple Horizon Visualization
export function SimpleHorizonVisual({ uniformity }: { uniformity: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Make canvas responsive to container size
    const container = canvas.parentElement
    if (container) {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    } else {
      canvas.width = 280
      canvas.height = 180
    }
    
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw CMB temperature map
    const gridSize = Math.max(8, Math.min(20, canvas.width / 20))
    for (let x = 0; x < canvas.width; x += gridSize) {
      for (let y = 0; y < canvas.height; y += gridSize) {
        const baseTemp = 2.725
        const variation = (Math.random() - 0.5) * (1 - uniformity) * 0.0002
        const temp = baseTemp + variation
        
        const intensity = Math.floor(255 * (temp - 2.7248) / 0.0004 + 128)
        const clampedIntensity = Math.max(0, Math.min(255, intensity))
        
        ctx.fillStyle = `rgb(${clampedIntensity}, ${clampedIntensity/2}, ${255 - clampedIntensity})`
        ctx.fillRect(x, y, gridSize, gridSize)
      }
    }
    
    // Simple label
    ctx.fillStyle = '#fff'
    ctx.font = '10px sans-serif'
    ctx.fillText('Temperature Map', 10, 15)
    
  }, [uniformity])
  
  return <canvas ref={canvasRef} className="w-full h-full border border-white/10 rounded" />
}
