'use client';

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface MetallicitySpectrumVisualProps {
  metallicity: number;
  starName: string;
  starType: string;
}

export function MetallicitySpectrumVisual({ metallicity, starName, starType }: MetallicitySpectrumVisualProps) {
  const [animationPhase, setAnimationPhase] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 100)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // Calculate spectrum properties based on metallicity
  const getSpectrumColor = () => {
    if (metallicity < 0.001) return 'from-blue-400 to-white' // Population III - very hot, blue-white
    if (metallicity < 0.005) return 'from-blue-300 to-yellow-200' // Population II - blue-white to yellow
    if (metallicity < 0.015) return 'from-yellow-300 to-orange-200' // Metal-poor - yellow
    if (metallicity < 0.03) return 'from-yellow-200 to-orange-300' // Solar-like - yellow-orange
    return 'from-orange-300 to-red-400' // Metal-rich - orange-red
  }

  const getStarTemperature = () => {
    if (metallicity < 0.001) return '50,000K+'
    if (metallicity < 0.005) return '15,000K'
    if (metallicity < 0.015) return '7,000K'
    if (metallicity < 0.03) return '5,800K'
    return '4,500K'
  }

  const getAbsorptionLines = () => {
    const lines = []
    
    // Hydrogen lines (always present)
    lines.push({ element: 'H', position: 15, strength: 0.8, color: 'red' })
    lines.push({ element: 'H', position: 25, strength: 0.6, color: 'red' })
    lines.push({ element: 'H', position: 35, strength: 0.4, color: 'red' })
    
    // Metal lines appear with higher metallicity
    if (metallicity > 0.0003) {
      lines.push({ element: 'Fe', position: 45, strength: Math.min(metallicity * 40, 0.9), color: 'orange' })
      lines.push({ element: 'Fe', position: 55, strength: Math.min(metallicity * 35, 0.8), color: 'orange' })
    }
    
    if (metallicity > 0.0005) {
      lines.push({ element: 'Ca', position: 65, strength: Math.min(metallicity * 30, 0.7), color: 'purple' })
      lines.push({ element: 'Ca', position: 75, strength: Math.min(metallicity * 25, 0.6), color: 'purple' })
    }
    
    if (metallicity > 0.001) {
      lines.push({ element: 'Mg', position: 85, strength: Math.min(metallicity * 20, 0.5), color: 'green' })
    }
    
    if (metallicity > 0.005) {
      lines.push({ element: 'Si', position: 20, strength: Math.min(metallicity * 15, 0.4), color: 'blue' })
      lines.push({ element: 'C', position: 40, strength: Math.min(metallicity * 18, 0.5), color: 'cyan' })
    }
    
    return lines
  }

  const absorptionLines = getAbsorptionLines()

  return (
    <div className="relative w-full h-80 bg-black rounded-lg overflow-hidden">
      {/* Background starfield */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Central star */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <motion.div
          className={`w-16 h-16 rounded-full bg-gradient-to-br ${getSpectrumColor()}`}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            boxShadow: `0 0 30px rgba(255, 255, 255, ${0.3 + metallicity * 5})`
          }}
        />
        
        {/* Star info */}
        <div className="text-center mt-2">
          <div className="text-white text-sm font-semibold">{starName}</div>
          <div className="text-gray-300 text-xs">{starType}</div>
          <div className="text-blue-300 text-xs">{getStarTemperature()}</div>
        </div>
      </div>

      {/* Spectrum analysis section */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-black/80 rounded-lg p-3 border border-white/20">
          <div className="text-white text-sm font-semibold mb-2 text-center">
            Stellar Spectrum Analysis
          </div>
          
          {/* Spectrum bar */}
          <div className="relative h-12 mb-3">
            {/* Continuous spectrum background */}
            <div 
              className={`absolute inset-0 bg-gradient-to-r ${getSpectrumColor()} rounded opacity-80`}
            />
            
            {/* Wavelength labels */}
            <div className="absolute -top-4 left-0 text-xs text-gray-400">400nm</div>
            <div className="absolute -top-4 left-1/4 text-xs text-gray-400">500nm</div>
            <div className="absolute -top-4 left-1/2 text-xs text-gray-400">600nm</div>
            <div className="absolute -top-4 right-1/4 text-xs text-gray-400">700nm</div>
            <div className="absolute -top-4 right-0 text-xs text-gray-400">800nm</div>
            
            {/* Absorption lines */}
            {absorptionLines.map((line, index) => (
              <motion.div
                key={index}
                className="absolute top-0 bottom-0 bg-black"
                style={{
                  left: `${line.position}%`,
                  width: '2px',
                  opacity: line.strength
                }}
                animate={{
                  opacity: [line.strength * 0.7, line.strength, line.strength * 0.7]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.1
                }}
              />
            ))}
          </div>
          
          {/* Element indicators */}
          <div className="flex flex-wrap gap-2 justify-center">
            {absorptionLines.map((line, index) => (
              <motion.div
                key={index}
                className="px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: `${line.color}40`,
                  color: line.color,
                  border: `1px solid ${line.color}60`
                }}
                animate={{
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.2
                }}
              >
                {line.element}
              </motion.div>
            ))}
          </div>
          
          {/* Metallicity indicator */}
          <div className="mt-3 text-center">
            <div className="text-xs text-gray-300">
              Metallicity [Fe/H]: <span className="text-yellow-300 font-mono">{metallicity.toFixed(4)}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {metallicity < 0.001 ? 'Primordial gas clouds only' :
               metallicity < 0.005 ? 'Ancient, metal-poor' :
               metallicity < 0.015 ? 'Moderate heavy elements' :
               metallicity < 0.03 ? 'Solar-like composition' :
               'Super metal-rich'}
            </div>
          </div>
        </div>
      </div>

      {/* Planet formation indicator */}
      {metallicity > 0.01 && (
        <motion.div
          className="absolute top-1/2 right-8 transform -translate-y-1/2"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <motion.div
              className="w-8 h-8 rounded-full bg-gradient-to-br from-brown-600 to-orange-700 mx-auto mb-1"
              animate={{
                rotate: [0, 360]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <div className="text-xs text-green-400 font-semibold">Rocky Planets</div>
            <div className="text-xs text-green-300">Possible</div>
          </div>
        </motion.div>
      )}

      {/* No planets indicator */}
      {metallicity <= 0.01 && (
        <div className="absolute top-1/2 right-8 transform -translate-y-1/2 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-red-500 border-dashed mx-auto mb-1 flex items-center justify-center">
            <span className="text-red-500 text-lg">×</span>
          </div>
          <div className="text-xs text-red-400 font-semibold">No Rocky</div>
          <div className="text-xs text-red-300">Planets</div>
        </div>
      )}
    </div>
  )
}
