'use client';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Slider } from '../../ui/slider'

// Star Visualization Component
function StarField({ stellarMass, metallicity, starFormationRate }: {
  stellarMass: number;
  metallicity: number;
  starFormationRate: number;
}) {
  const starSize = 50 + (stellarMass * 30);
  const starBrightness = 80 + (stellarMass * 40);
  const metalGlow = metallicity * 100;
  const formationSpeed = starFormationRate * 2;

  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden bg-black/30 rounded-lg">
      <div className="star-system">
        {/* Main Star */}
        <div 
          className="main-star"
          style={{
            width: `${starSize}px`,
            height: `${starSize}px`,
            backgroundColor: `rgba(255, ${Math.floor(200 + metallicity * 55)}, ${Math.floor(100 + metallicity * 100)}, 0.9)`,
            boxShadow: `0 0 ${starSize}px rgba(255, ${Math.floor(180 + metallicity * 75)}, ${Math.floor(80 + metallicity * 120)}, ${0.6 + metallicity * 0.4})`,
            animation: `stellar-pulse ${3 / formationSpeed}s ease-in-out infinite`,
            filter: `brightness(${starBrightness}%) contrast(${100 + metalGlow}%)`,
          }}
        />
        
        {/* Heavy Elements (if metallicity > 0.3) */}
        {metallicity > 0.3 && (
          <div className="heavy-elements">
            {['Carbon', 'Oxygen', 'Silicon', 'Iron'].map((element, i) => (
              <div 
                key={element}
                className="element-particle"
                style={{
                  left: `${50 + Math.cos(i * 1.5) * 80}%`,
                  top: `${50 + Math.sin(i * 1.5) * 80}%`,
                  backgroundColor: `rgba(${100 + i * 40}, ${150 + i * 20}, 255, ${metallicity})`,
                  animation: `element-orbit ${5 / (stellarMass + 0.1)}s linear infinite`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      <style jsx>{`
        .star-system {
          position: relative;
          width: 200px;
          height: 200px;
        }
        .main-star {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
        }
        .element-particle {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }
        @keyframes stellar-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes element-orbit {
          from { transform: translate(-50%, -50%) rotate(0deg) translateX(60px) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg) translateX(60px) rotate(-360deg); }
        }
      `}</style>
    </div>
  )
}

export default function StarlightSection({ 
  educatorMode, 
  cosmicTime = 0
}: { 
  educatorMode: boolean; 
  cosmicTime?: number;
}) {
  const [stellarMass, setStellarMass] = useState(1)
  const [metallicity, setMetallicity] = useState(0.02)
  const [starFormationRate, setStarFormationRate] = useState(1)

  useEffect(() => {
    const handleRandomize = () => {
      setStellarMass(0.1 + Math.random() * 1.9)
      setMetallicity(Math.random() * 0.1)
      setStarFormationRate(0.1 + Math.random() * 1.9)
    }

    window.addEventListener('randomizeUniverse', handleRandomize)
    return () => window.removeEventListener('randomizeUniverse', handleRandomize)
  }, [])

  return (
    <div className="container mx-auto px-4">
      {/* Header Section */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-white">Starlight & Heavy Elements</h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          The first stars ignite, forging heavy elements through nuclear fusion and seeding the cosmos with the building blocks of complexity.
        </p>
      </div>

      {/* Primary Controls - Balanced Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
        {/* Stellar Mass */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Stellar Mass</CardTitle>
            <CardDescription className="text-gray-300">
              Mass of first-generation stars (in solar masses)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StarField 
              stellarMass={stellarMass}
              metallicity={metallicity}
              starFormationRate={starFormationRate}
            />
            <div className="relative mt-4">
              <Slider
                value={[stellarMass]}
                onValueChange={(value) => setStellarMass(value[0])}
                max={2}
                min={0.1}
                step={0.1}
                className="w-full"
              />
              <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                   style={{
                     left: `${((0.8 - 0.1) / (2 - 0.1)) * 100}%`,
                     width: `${((1.4 - 0.8) / (2 - 0.1)) * 100}%`
                   }}></div>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-4">
              <span>Red Dwarf</span>
              <span className="text-green-400 font-bold">0.8-1.4 M☉ (optimal)</span>
              <span className="text-white font-medium">{stellarMass.toFixed(1)} M☉</span>
              <span>Supergiant</span>
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> StarField visualization shows stellar nucleosynthesis - how stars forge heavy elements through nuclear fusion.</p>
                  <p><strong>Mass matters:</strong> Stars need 0.8-1.4 solar masses for optimal heavy element production. Too small = insufficient fusion, too large = short-lived supergiants.</p>
                  <p><strong>The triple-alpha process:</strong> Carbon formation requires three helium nuclei to collide simultaneously - astronomically unlikely without precise energy resonance.</p>
                  <p><strong>Cosmic seeding:</strong> These first stars created and dispersed carbon, oxygen, silicon, and iron - the building blocks for planets and life.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metallicity */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Metallicity</CardTitle>
            <CardDescription className="text-gray-300">
              Fraction of heavy elements in stellar composition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-black/30 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-2xl mb-2">⚛️</div>
                <div className="text-sm text-gray-300">Heavy Elements</div>
                <div className="text-lg font-bold text-white">{(metallicity * 100).toFixed(2)}%</div>
              </div>
            </div>
            <div className="relative">
              <Slider
                value={[metallicity]}
                onValueChange={(value) => setMetallicity(value[0])}
                max={0.1}
                min={0}
                step={0.001}
                className="w-full"
              />
              <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                   style={{
                     left: `${((0.01 - 0) / (0.1 - 0)) * 100}%`,
                     width: `${((0.03 - 0.01) / (0.1 - 0)) * 100}%`
                   }}></div>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-4">
              <span>Population III</span>
              <span className="text-green-400 font-bold">1-3% (optimal)</span>
              <span className="text-white font-medium">{(metallicity * 100).toFixed(2)}%</span>
              <span>Metal-Rich</span>
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> Heavy element percentage display - the fraction of elements heavier than hydrogen and helium in stellar composition.</p>
                  <p><strong>Solar metallicity:</strong> Our Sun has ~2% heavy elements, which is optimal for planet formation and complex chemistry.</p>
                  <p><strong>Population III mystery:</strong> The first stars had zero metallicity but somehow produced the heavy elements needed for later generations.</p>
                  <p><strong>Goldilocks zone:</strong> Too little metallicity = no planets, too much = runaway stellar formation disrupts galactic structure.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Star Formation Rate */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Star Formation Rate</CardTitle>
            <CardDescription className="text-gray-300">
              Rate of stellar birth in early galaxies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-black/30 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-2xl mb-2">⭐</div>
                <div className="text-sm text-gray-300">Formation Rate</div>
                <div className="text-lg font-bold text-white">{starFormationRate.toFixed(1)}x</div>
              </div>
            </div>
            <div className="relative">
              <Slider
                value={[starFormationRate]}
                onValueChange={(value) => setStarFormationRate(value[0])}
                max={2}
                min={0.1}
                step={0.1}
                className="w-full"
              />
              <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                   style={{
                     left: `${((0.8 - 0.1) / (2 - 0.1)) * 100}%`,
                     width: `${((1.5 - 0.8) / (2 - 0.1)) * 100}%`
                   }}></div>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-4">
              <span>Slow</span>
              <span className="text-green-400 font-bold">0.8-1.5 (optimal)</span>
              <span className="text-white font-medium">{starFormationRate.toFixed(1)}</span>
              <span>Rapid</span>
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> Star formation rate multiplier - how quickly early galaxies converted gas into stars compared to today's rate.</p>
                  <p><strong>Timing is critical:</strong> Moderate formation rates (0.8-1.5x) allow proper heavy element enrichment between stellar generations.</p>
                  <p><strong>Too fast:</strong> Rapid star formation depletes gas reservoirs before sufficient heavy elements accumulate for planet formation.</p>
                  <p><strong>Too slow:</strong> Insufficient stellar nucleosynthesis means the universe remains dominated by hydrogen and helium forever.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
