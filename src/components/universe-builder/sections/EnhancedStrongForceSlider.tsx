'use client';

import { useState, useRef, useEffect } from 'react'

interface EnhancedStrongForceSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function EnhancedStrongForceSlider({ 
  value, 
  onChange, 
  min = 0.8, 
  max = 1.2, 
  step = 0.001 
}: EnhancedStrongForceSliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Calculate position percentage
  const percentage = ((value - min) / (max - min)) * 100
  const ourUniversePercentage = ((1.0 - min) / (max - min)) * 100

  // Get color based on value
  const getSliderColor = () => {
    if (value < 0.98) return '#4A90E2' // Blue for weak
    if (value > 1.02) return '#E94B3C' // Red for strong
    return '#FFFFFF' // White for balanced
  }

  // Handle mouse/touch events
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    updateValue(e)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      updateValue(e)
    }
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  const updateValue = (e: React.PointerEvent) => {
    if (!sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    const newValue = min + (percentage / 100) * (max - min)
    
    // Round to step
    const steppedValue = Math.round(newValue / step) * step
    const clampedValue = Math.max(min, Math.min(max, steppedValue))
    
    onChange(clampedValue)
  }

  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const rect = sliderRef.current?.getBoundingClientRect()
        if (rect) {
          const x = e.clientX - rect.left
          const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
          const newValue = min + (percentage / 100) * (max - min)
          const steppedValue = Math.round(newValue / step) * step
          const clampedValue = Math.max(min, Math.min(max, steppedValue))
          onChange(clampedValue)
        }
      }
    }

    const handleGlobalPointerUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('pointermove', handleGlobalPointerMove)
      document.addEventListener('pointerup', handleGlobalPointerUp)
    }

    return () => {
      document.removeEventListener('pointermove', handleGlobalPointerMove)
      document.removeEventListener('pointerup', handleGlobalPointerUp)
    }
  }, [isDragging, min, max, step, onChange])

  return (
    <div className="w-full space-y-4">
      {/* Slider Label */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-1">Strong Force Strength (αs)</h3>
        <div className="text-sm text-gray-300">
          Current value: <span className="font-mono text-yellow-300">{value.toFixed(3)}</span>
        </div>
      </div>

      {/* Slider Track */}
      <div className="relative px-4">
        <div
          ref={sliderRef}
          className="relative h-8 rounded-full cursor-pointer select-none"
          style={{
            background: `linear-gradient(to right, 
              #4A90E2 0%, 
              #4A90E2 20%, 
              #FFFFFF 45%, 
              #FFFFFF 55%, 
              #E94B3C 80%, 
              #E94B3C 100%)`
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Track overlay for visual depth */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-black/20" />

          {/* "Our Universe" marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 shadow-lg"
            style={{ left: `${ourUniversePercentage}%` }}
          >
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-yellow-300 font-semibold whitespace-nowrap">
              Our Universe
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-yellow-300 font-mono">
              1.000
            </div>
          </div>

          {/* Slider thumb */}
          <div
            className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-white shadow-lg transition-all duration-150"
            style={{
              left: `${percentage}%`,
              backgroundColor: getSliderColor(),
              boxShadow: `0 0 ${isDragging ? '12px' : '8px'} ${getSliderColor()}40`,
              transform: `translate(-50%, -50%) scale(${isDragging ? 1.2 : 1})`
            }}
          >
            {/* Inner glow */}
            <div 
              className="absolute inset-1 rounded-full"
              style={{
                backgroundColor: getSliderColor(),
                opacity: 0.6
              }}
            />
          </div>

          {/* Critical zone indicators */}
          <div
            className="absolute top-0 bottom-0 bg-green-400/30 rounded-full"
            style={{
              left: `${((0.98 - min) / (max - min)) * 100}%`,
              width: `${((1.02 - 0.98) / (max - min)) * 100}%`
            }}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-green-300 font-semibold">
              Life Zone
            </div>
          </div>
        </div>

        {/* Scale markers */}
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>0.8</span>
          <span className="text-blue-400">Weak</span>
          <span className="text-white">Balanced</span>
          <span className="text-red-400">Strong</span>
          <span>1.2</span>
        </div>
      </div>

      {/* Regime indicator */}
      <div className="text-center">
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
          value < 0.98 
            ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
            : value > 1.02 
            ? 'bg-red-600/20 text-red-300 border border-red-500/30'
            : 'bg-green-600/20 text-green-300 border border-green-500/30'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            value < 0.98 ? 'bg-blue-400' : value > 1.02 ? 'bg-red-400' : 'bg-green-400'
          }`} />
          {value < 0.98 ? 'Too Weak - No Binding' : value > 1.02 ? 'Too Strong - Runaway Fusion' : 'Optimal - Stable Matter'}
        </div>
      </div>

      {/* Precision indicator */}
      <div className="text-center text-xs text-gray-400">
        <div>Deviation from optimal: <span className="text-yellow-300">{Math.abs(value - 1.0).toFixed(3)}</span></div>
        <div>Tolerance: ±0.02 ({((Math.abs(value - 1.0) / 0.02) * 100).toFixed(0)}% of maximum allowed)</div>
      </div>
    </div>
  )
}
