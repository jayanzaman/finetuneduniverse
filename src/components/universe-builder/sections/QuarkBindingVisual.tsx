'use client';

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface QuarkBindingVisualProps {
  strongForce: number; // αs value (0.8 to 1.2)
}

export function QuarkBindingVisual({ strongForce }: QuarkBindingVisualProps) {
  const [cosmicScale, setCosmicScale] = useState(1)

  // Calculate regime based on strong force value
  const isOptimal = strongForce >= 0.98 && strongForce <= 1.02
  const isTooWeak = strongForce < 0.98
  const isTooStrong = strongForce > 1.02

  // Dynamic values
  const bindingEnergy = Math.pow(strongForce, 2) * 8.5 // MeV per nucleon
  const protonStability = Math.exp(-Math.abs(strongForce - 1) * 10)
  const fusionRate = Math.pow(strongForce - 0.8, 3) * 100

  // Animation parameters
  const fluxTubeIntensity = Math.min(strongForce * 0.8, 1.2)
  const quarkSeparation = Math.max(20, 60 - (strongForce - 0.8) * 100)
  const vibrationAmplitude = Math.abs(strongForce - 1) * 10

  useEffect(() => {
    // Zoom effect based on regime
    if (isTooWeak) {
      setCosmicScale(0.3) // Zoom out to show empty void
    } else if (isTooStrong) {
      setCosmicScale(2.5) // Zoom in to show violent fusion
    } else {
      setCosmicScale(1) // Balanced view showing stable matter
    }
  }, [strongForce, isTooWeak, isTooStrong])

  const getRegimeCaption = () => {
    if (isTooWeak) return "Too weak → quarks can't bind → no atoms, no stars, no life"
    if (isTooStrong) return "Too strong → runaway fusion → no hydrogen → no shining stars"
    return "Stable binding → hydrogen exists → stars shine"
  }

  const getRegimeColor = () => {
    if (isTooWeak) return 'from-blue-600 to-blue-900'
    if (isTooStrong) return 'from-red-600 to-orange-700'
    return 'from-green-500 to-blue-500'
  }

  return (
    <div className="relative w-full h-80 bg-black rounded-lg overflow-hidden">
      {/* Background cosmic environment */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${getRegimeColor()} opacity-20 transition-all duration-1000`}
        style={{ transform: `scale(${cosmicScale})` }}
      />

      {/* Main particle field */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative"
          animate={{ scale: cosmicScale }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          {/* Proton visualization */}
          <div className="relative w-32 h-32">
            {/* Quarks */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute w-6 h-6 rounded-full"
                style={{
                  backgroundColor: i === 0 ? '#ff4444' : i === 1 ? '#4444ff' : '#44ff44',
                  boxShadow: `0 0 ${fluxTubeIntensity * 10}px currentColor`,
                }}
                animate={{
                  x: Math.cos((i * 2 * Math.PI) / 3) * quarkSeparation + 50,
                  y: Math.sin((i * 2 * Math.PI) / 3) * quarkSeparation + 50,
                  scale: [1, 1 + vibrationAmplitude * 0.1, 1],
                }}
                transition={{
                  scale: { duration: 0.5, repeat: Infinity, ease: "easeInOut" },
                  x: { duration: 0.3 },
                  y: { duration: 0.3 }
                }}
              />
            ))}

            {/* Flux tubes (gluon field) */}
            <svg className="absolute inset-0 w-full h-full" style={{ opacity: fluxTubeIntensity }}>
              {[0, 1, 2].map((i) => {
                const nextI = (i + 1) % 3
                const x1 = Math.cos((i * 2 * Math.PI) / 3) * quarkSeparation + 64
                const y1 = Math.sin((i * 2 * Math.PI) / 3) * quarkSeparation + 64
                const x2 = Math.cos((nextI * 2 * Math.PI) / 3) * quarkSeparation + 64
                const y2 = Math.sin((nextI * 2 * Math.PI) / 3) * quarkSeparation + 64
                
                return (
                  <motion.line
                    key={i}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={isTooWeak ? '#4488ff' : isTooStrong ? '#ff4444' : '#ffff44'}
                    strokeWidth={Math.max(1, fluxTubeIntensity * 3)}
                    animate={{
                      strokeWidth: [
                        Math.max(1, fluxTubeIntensity * 2),
                        Math.max(1, fluxTubeIntensity * 4),
                        Math.max(1, fluxTubeIntensity * 2)
                      ],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                )
              })}
            </svg>
          </div>

          {/* Regime-specific effects */}
          <AnimatePresence>
            {isTooWeak && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Scattered energy particles */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-blue-400 rounded-full"
                    animate={{
                      x: Math.cos((i * Math.PI) / 6) * (100 + i * 10),
                      y: Math.sin((i * Math.PI) / 6) * (100 + i * 10),
                      opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.1
                    }}
                  />
                ))}
              </motion.div>
            )}

            {isTooStrong && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Fusion explosion effects */}
                <motion.div
                  className="w-40 h-40 rounded-full bg-gradient-to-r from-yellow-400 to-red-600"
                  animate={{
                    scale: [1, 1.5, 0.8, 1.2, 0.9],
                    opacity: [0.8, 1, 0.6, 0.9, 0.7],
                  }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Shock waves */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute border-2 border-orange-400 rounded-full"
                    animate={{
                      width: [0, 200, 300],
                      height: [0, 200, 300],
                      opacity: [1, 0.5, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeOut",
                      delay: i * 0.3
                    }}
                  />
                ))}
              </motion.div>
            )}

            {isOptimal && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Stable atoms and cosmic structures */}
                <motion.div
                  className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 360],
                  }}
                  transition={{
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 10, repeat: Infinity, ease: "linear" }
                  }}
                />
                {/* Orbiting electrons */}
                {[0, 1].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    animate={{
                      x: Math.cos((Date.now() / 1000 + i * Math.PI) * 2) * 40,
                      y: Math.sin((Date.now() / 1000 + i * Math.PI) * 2) * 40,
                    }}
                    transition={{ duration: 0.1, repeat: Infinity }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>



      {/* Dynamic caption */}
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <motion.div
          key={getRegimeCaption()}
          className="bg-black/80 text-white px-4 py-2 rounded text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {getRegimeCaption()}
        </motion.div>
      </div>

    </div>
  )
}
