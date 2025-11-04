'use client';

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Info } from 'lucide-react'

interface TimelineProbabilityVisualProps {
  lifetime: number; // Proton lifetime in powers of 10 (30-40)
}

function formatHumanReadable(lifetime: number) {
  // Returns a string like "1e34 years"
  return `~${Number(10 ** (lifetime - Math.floor(lifetime))).toFixed(1)}e${Math.floor(lifetime)} years`
}

export function TimelineProbabilityVisual({ lifetime }: TimelineProbabilityVisualProps) {
  // Remove animationPhase and setInterval, use CSS pulse for indicator

  const stabilityRanges = [
    { value: 20, label: '10²⁰', consequence: 'Immediate collapse', timelineWidth: 1, color: 'from-red-600 to-red-800', category: 'failure' },
    { value: 25, label: '10²⁵', consequence: 'No complex atoms', timelineWidth: 8, color: 'from-red-500 to-red-600', category: 'failure' },
    { value: 30, label: '10³⁰', consequence: 'Stars die early', timelineWidth: 25, color: 'from-orange-500 to-red-500', category: 'failure' },
    { value: 34, label: '10³⁴', consequence: 'Threshold reached', timelineWidth: 100, color: 'from-green-500 to-emerald-600', category: 'threshold' },
    { value: 35, label: '10³⁵', consequence: 'Equally good', timelineWidth: 100, color: 'from-green-400 to-green-500', category: 'sufficient' },
    { value: 40, label: '10⁴⁰', consequence: 'Equally good', timelineWidth: 100, color: 'from-blue-500 to-green-400', category: 'sufficient' }
  ]

  // Bin logic: find the closest range
  const currentRange = stabilityRanges.reduce((prev, curr) => Math.abs(curr.value - lifetime) < Math.abs(prev.value - lifetime) ? curr : prev, stabilityRanges[0]);
  const isLifeViable = lifetime >= 34
  const universeAge = 13.8 // billion years

  // Tooltip for exponent
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-black p-4 rounded-lg flex flex-col justify-center">
      {/* Threshold Visualization */}
      <div className="flex items-end justify-between h-32 bg-black/30 rounded-lg p-2">
        {stabilityRanges.map((range, index) => {
          const isActive = currentRange.value === range.value
          const height = range.category === 'failure' ? 30 : range.category === 'threshold' ? 80 : 100
          return (
            <div key={range.value} className="flex flex-col items-center flex-1">
              {/* Stability Bar */}
              <motion.div
                className={`w-full max-w-10 rounded-t bg-gradient-to-t ${range.color} ${isActive ? 'ring-2 ring-yellow-400/70 shadow-lg shadow-yellow-500/50' : ''}`}
                style={{ height: `${height}%` }}
                animate={{ opacity: isActive ? 1 : 0.5, scale: isActive ? 1.05 : 1 }}
                transition={{ duration: 0.3 }}
              />
              {/* Label */}
              <div className={`text-xs mt-1 ${isActive ? 'text-white font-bold' : 'text-gray-400'}`}>
                {range.label}
              </div>
              {/* Current indicator */}
              {isActive && (
                <div className="text-yellow-400 text-lg mt-0.5">🎯</div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Compact Legend */}
      <div className="flex justify-center gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-red-600 to-red-500"></div>
          <span className="text-red-300">Fail</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-green-500 to-emerald-500"></div>
          <span className="text-green-300">Threshold</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-blue-500 to-green-400"></div>
          <span className="text-blue-300">Sufficient</span>
        </div>
      </div>
    </div>
  )
}

// Mobile-optimized version
export function TimelineProbabilityVisualMobile({ lifetime }: TimelineProbabilityVisualProps) {
  const stabilityRanges = [
    { value: 20, label: '10²⁰', consequence: 'Collapse', color: 'from-red-600 to-red-800', category: 'failure' },
    { value: 25, label: '10²⁵', consequence: 'No atoms', color: 'from-red-500 to-red-600', category: 'failure' },
    { value: 30, label: '10³⁰', consequence: 'Stars die', color: 'from-orange-500 to-red-500', category: 'failure' },
    { value: 34, label: '10³⁴', consequence: 'Threshold', color: 'from-green-500 to-emerald-600', category: 'threshold' },
    { value: 35, label: '10³⁵', consequence: 'Good', color: 'from-green-400 to-green-500', category: 'sufficient' },
    { value: 40, label: '10⁴⁰', consequence: 'Good', color: 'from-blue-500 to-green-400', category: 'sufficient' }
  ]

  const currentRange = stabilityRanges.find(range => Math.abs(range.value - lifetime) < 2.5) || stabilityRanges[3]
  const isLifeViable = lifetime >= 34

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-black p-3 rounded-lg">
      {/* Compact threshold bars */}
      <div className="mb-3">
        <div className="text-xs text-gray-400 mb-2">Stability Threshold (Not Fine-Tuning):</div>
        <div className="grid grid-cols-6 gap-1">
          {stabilityRanges.map((range) => {
            const isActive = Math.abs(range.value - lifetime) < 2.5
            const height = range.category === 'failure' ? 'h-4' : range.category === 'threshold' ? 'h-6' : 'h-8'
            
            return (
              <div key={range.value} className="text-center">
                <motion.div
                  className={`${height} rounded bg-gradient-to-t ${range.color} ${
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
                {range.category === 'threshold' && (
                  <div className="text-green-400 text-xs">Threshold</div>
                )}
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
            {isLifeViable ? '✅ Above Threshold' : '❌ Below Threshold'}
          </div>
          <div className="text-xs text-blue-200 mt-2 italic">
            Threshold parameter - longer is equally good
          </div>
        </div>
      </div>
    </div>
  )
}
