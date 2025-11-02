'use client';

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface TimelineProbabilityVisualProps {
  lifetime: number; // Proton lifetime in powers of 10 (30-40)
}

export function TimelineProbabilityVisual({ lifetime }: TimelineProbabilityVisualProps) {
  const [animationPhase, setAnimationPhase] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 100)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // Define probability ranges and their cosmic consequences
  const probabilityRanges = [
    { value: 20, label: '10²⁰', probability: 0.1, consequence: 'Immediate collapse', timelineWidth: 1, color: 'from-red-600 to-red-800' },
    { value: 25, label: '10²⁵', probability: 0.2, consequence: 'No complex atoms', timelineWidth: 8, color: 'from-red-500 to-red-600' },
    { value: 30, label: '10³⁰', probability: 0.4, consequence: 'Stars die early', timelineWidth: 25, color: 'from-orange-500 to-red-500' },
    { value: 34, label: '10³⁴', probability: 0.8, consequence: 'Universe viable for life', timelineWidth: 60, color: 'from-green-500 to-emerald-600' },
    { value: 35, label: '10³⁵', probability: 0.9, consequence: 'Optimal stability', timelineWidth: 80, color: 'from-green-400 to-green-500' },
    { value: 40, label: '10⁴⁰', probability: 0.95, consequence: 'Universe lasts forever', timelineWidth: 100, color: 'from-blue-500 to-green-400' }
  ]

  // Find current range
  const currentRange = probabilityRanges.find(range => Math.abs(range.value - lifetime) < 2.5) || probabilityRanges[3]
  const isLifeViable = lifetime >= 34
  const universeAge = 13.8 // billion years

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-black p-4 rounded-lg overflow-hidden">
      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="text-white font-semibold text-sm mb-1">Proton Lifetime vs Universe Viability</h3>
        <div className="text-gray-400 text-xs">Fine-tuning the foundation of matter</div>
      </div>

      {/* Probability Landscape */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">Probability Landscape:</div>
        <div className="flex items-end justify-between h-16 bg-black/30 rounded p-2">
          {probabilityRanges.map((range, index) => {
            const isActive = Math.abs(range.value - lifetime) < 2.5
            const height = range.probability * 100

            return (
              <div key={range.value} className="flex flex-col items-center flex-1">
                {/* Probability Bar */}
                <motion.div
                  className={`w-full max-w-8 rounded-t bg-gradient-to-t ${range.color} ${
                    isActive ? 'ring-2 ring-white/50' : ''
                  }`}
                  style={{ height: `${height}%` }}
                  animate={{ 
                    opacity: isActive ? 1 : 0.6,
                    scale: isActive ? 1.1 : 1
                  }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Label */}
                <div className={`text-xs mt-1 ${isActive ? 'text-white font-semibold' : 'text-gray-500'}`}>
                  {range.label}
                </div>
                
                {/* Current indicator */}
                {isActive && (
                  <motion.div
                    className="text-yellow-400 text-lg mt-1"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    🎯
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Timeline Impact */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">Timeline Impact:</div>
        <div className="space-y-2">
          {probabilityRanges.map((range, index) => {
            const isActive = Math.abs(range.value - lifetime) < 2.5
            
            return (
              <div key={range.value} className="flex items-center gap-2">
                {/* Timeline bar */}
                <div className="flex-1 h-3 bg-black/40 rounded overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${range.color} ${
                      isActive ? 'ring-1 ring-white/30' : ''
                    }`}
                    style={{ width: `${range.timelineWidth}%` }}
                    animate={{ 
                      opacity: isActive ? 1 : 0.4,
                      boxShadow: isActive ? '0 0 10px rgba(255,255,255,0.3)' : 'none'
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                
                {/* Consequence label */}
                <div className={`text-xs w-32 ${
                  isActive ? 'text-white font-semibold' : 'text-gray-500'
                }`}>
                  {range.label}: {range.consequence}
                </div>
                
                {/* Sweet spot indicator */}
                {range.value === 34 && (
                  <div className="text-green-400 text-xs font-semibold">← Sweet Spot</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-black/40 rounded-lg p-3 border border-white/10">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-semibold text-white">Current Setting:</div>
          <div className="text-lg font-mono text-yellow-400">10^{lifetime.toFixed(0)} years</div>
        </div>
        
        <div className={`text-xs ${isLifeViable ? 'text-green-300' : 'text-red-300'}`}>
          <strong>Status:</strong> {currentRange.consequence}
        </div>
        
        <div className="text-xs text-gray-400 mt-1">
          <strong>Universe Age:</strong> {universeAge} billion years
        </div>
        
        {/* Viability indicator */}
        <div className="mt-2 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isLifeViable ? 'bg-green-400 animate-pulse' : 'bg-red-400'
          }`} />
          <div className={`text-xs font-semibold ${
            isLifeViable ? 'text-green-300' : 'text-red-300'
          }`}>
            {isLifeViable ? '✅ Life Possible' : '❌ Life Impossible'}
          </div>
        </div>
      </div>

      {/* Time scale reference */}
      <div className="mt-3 text-center">
        <div className="text-xs text-gray-500">
          Timeline: 0 → 5B → 10B → <span className="text-yellow-400 font-semibold">13.8B</span> → 20B → 30B → ∞ years
        </div>
      </div>
    </div>
  )
}

// Mobile-optimized version
export function TimelineProbabilityVisualMobile({ lifetime }: TimelineProbabilityVisualProps) {
  const probabilityRanges = [
    { value: 20, label: '10²⁰', consequence: 'Immediate collapse', color: 'from-red-600 to-red-800' },
    { value: 25, label: '10²⁵', consequence: 'No atoms', color: 'from-red-500 to-red-600' },
    { value: 30, label: '10³⁰', consequence: 'Stars die early', color: 'from-orange-500 to-red-500' },
    { value: 34, label: '10³⁴', consequence: 'Life viable', color: 'from-green-500 to-emerald-600' },
    { value: 35, label: '10³⁵', consequence: 'Optimal', color: 'from-green-400 to-green-500' },
    { value: 40, label: '10⁴⁰', consequence: 'Forever', color: 'from-blue-500 to-green-400' }
  ]

  const currentRange = probabilityRanges.find(range => Math.abs(range.value - lifetime) < 2.5) || probabilityRanges[3]
  const isLifeViable = lifetime >= 34

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-black p-3 rounded-lg">
      {/* Compact probability bars */}
      <div className="mb-3">
        <div className="text-xs text-gray-400 mb-2">Proton Lifetime Fine-Tuning:</div>
        <div className="grid grid-cols-6 gap-1">
          {probabilityRanges.map((range) => {
            const isActive = Math.abs(range.value - lifetime) < 2.5
            
            return (
              <div key={range.value} className="text-center">
                <motion.div
                  className={`h-8 rounded bg-gradient-to-t ${range.color} ${
                    isActive ? 'ring-2 ring-white/50' : ''
                  }`}
                  animate={{ 
                    opacity: isActive ? 1 : 0.5,
                    scale: isActive ? 1.1 : 1
                  }}
                />
                <div className={`text-xs mt-1 ${isActive ? 'text-white font-semibold' : 'text-gray-500'}`}>
                  {range.label}
                </div>
                <div className="text-xs text-gray-400">
                  {range.consequence}
                </div>
                {isActive && (
                  <div className="text-yellow-400 text-sm">🎯</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Current status */}
      <div className="bg-black/40 rounded p-2 border border-white/10">
        <div className="text-center">
          <div className="text-lg font-mono text-yellow-400 mb-1">10^{lifetime.toFixed(0)} years</div>
          <div className={`text-sm font-semibold ${isLifeViable ? 'text-green-300' : 'text-red-300'}`}>
            {currentRange.consequence}
          </div>
          <div className={`text-xs mt-1 ${isLifeViable ? 'text-green-400' : 'text-red-400'}`}>
            {isLifeViable ? '✅ Life Possible' : '❌ Life Impossible'}
          </div>
        </div>
      </div>
    </div>
  )
}
