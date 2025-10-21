'use client';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Slider } from '../../ui/slider'

// Enhanced Star Visualization Component with Death/Explosion States
function StarField({ stellarMass, metallicity, starFormationRate }: {
  stellarMass: number;
  metallicity: number;
  starFormationRate: number;
}) {
  // Optimal range: 0.8 - 1.4 solar masses
  const isTooDim = stellarMass < 0.8;
  const isTooMassive = stellarMass > 1.4;
  const isOptimal = stellarMass >= 0.8 && stellarMass <= 1.4;
  
  // Calculate star properties based on mass
  const baseSize = 50;
  let starSize, starColor, starOpacity, glowIntensity, animationType;
  
  if (isTooDim) {
    // Dying star - shrinking and dimming
    const dimFactor = stellarMass / 0.8; // 0 to 1
    starSize = baseSize * (0.3 + dimFactor * 0.7); // 30% to 100% size
    starOpacity = 0.2 + dimFactor * 0.6; // Very dim to somewhat bright
    starColor = `rgba(255, ${Math.floor(100 + dimFactor * 100)}, ${Math.floor(50 + dimFactor * 50)}, ${starOpacity})`;
    glowIntensity = dimFactor * 20; // Minimal glow
    animationType = 'dying-flicker';
  } else if (isTooMassive) {
    // Massive star - growing and changing color toward explosion
    const massFactor = Math.min((stellarMass - 1.4) / 0.6, 1); // 0 to 1 (caps at 2.0 mass)
    starSize = baseSize * (1 + massFactor * 1.5); // 100% to 250% size
    starOpacity = 0.9 + massFactor * 0.1;
    // Color shifts from yellow to blue-white to red (pre-supernova)
    if (massFactor < 0.5) {
      starColor = `rgba(${Math.floor(255 - massFactor * 100)}, ${Math.floor(255 - massFactor * 50)}, ${Math.floor(200 + massFactor * 55)}, ${starOpacity})`;
    } else {
      starColor = `rgba(255, ${Math.floor(150 - (massFactor - 0.5) * 100)}, ${Math.floor(100 - (massFactor - 0.5) * 100)}, ${starOpacity})`;
    }
    glowIntensity = 40 + massFactor * 60; // Intense glow
    animationType = massFactor > 0.7 ? 'pre-explosion' : 'massive-pulse';
  } else {
    // Optimal star - stable and bright
    starSize = baseSize + (stellarMass - 0.8) * 20;
    starOpacity = 0.9;
    starColor = `rgba(255, ${Math.floor(220 + metallicity * 35)}, ${Math.floor(150 + metallicity * 100)}, ${starOpacity})`;
    glowIntensity = 30 + metallicity * 20;
    animationType = 'stable-pulse';
  }

  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden bg-black/30 rounded-lg">
      <div className="star-system">
        {/* Main Star */}
        <div 
          className={`main-star ${animationType}`}
          style={{
            width: `${starSize}px`,
            height: `${starSize}px`,
            backgroundColor: starColor,
            boxShadow: `0 0 ${glowIntensity}px ${starColor}, 0 0 ${glowIntensity * 2}px ${starColor}`,
            opacity: starOpacity,
          }}
        />
        
        {/* Explosion Effect for Massive Stars */}
        {isTooMassive && stellarMass > 1.7 && (
          <div className="explosion-ring">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i}
                className="explosion-particle"
                style={{
                  transform: `rotate(${i * 45}deg) translateX(${60 + (stellarMass - 1.7) * 40}px)`,
                  backgroundColor: `rgba(255, ${Math.floor(100 + Math.random() * 155)}, 0, 0.8)`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
        
        {/* Dying Embers for Dim Stars */}
        {isTooDim && stellarMass < 0.5 && (
          <div className="dying-embers">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i}
                className="ember"
                style={{
                  left: `${45 + Math.random() * 10}%`,
                  top: `${45 + Math.random() * 10}%`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}
        
        {/* Planetary Building Blocks Visualization */}
        {isOptimal && (
          <div className="planetary-system">
            {/* Protoplanetary Disk */}
            <div 
              className="dust-disk"
              style={{
                opacity: Math.min(metallicity * 25, 0.8),
                transform: `scale(${0.8 + metallicity * 4})`,
              }}
            />
            
            {/* Planetesimals forming in disk */}
            {metallicity > 0.005 && (
              <div className="planetesimals">
                {[...Array(Math.floor(metallicity * 200))].map((_, i) => (
                  <div 
                    key={i}
                    className="planetesimal"
                    style={{
                      left: `${30 + Math.random() * 40}%`,
                      top: `${30 + Math.random() * 40}%`,
                      backgroundColor: `rgba(${150 + Math.random() * 105}, ${100 + Math.random() * 100}, ${80 + Math.random() * 80}, 0.7)`,
                      animationDelay: `${Math.random() * 3}s`,
                      transform: `scale(${0.5 + Math.random() * 0.5})`,
                    }}
                  />
                ))}
              </div>
            )}
            
            {/* Habitable Zone Ring */}
            {metallicity > 0.01 && metallicity < 0.05 && (
              <div className="habitable-zone">
                <div className="hz-ring" />
                <div className="hz-label">Habitable Zone</div>
              </div>
            )}
            
            {/* Forming Rocky Planets */}
            {metallicity > 0.015 && metallicity < 0.04 && (
              <div className="forming-planets">
                {[...Array(Math.min(Math.floor(metallicity * 100), 3))].map((_, i) => (
                  <div 
                    key={i}
                    className="proto-planet"
                    style={{
                      left: `${40 + i * 15}%`,
                      top: `${45 + Math.sin(i) * 10}%`,
                      backgroundColor: `rgba(${120 + i * 30}, ${80 + i * 20}, ${60 + i * 15}, 0.8)`,
                      animationDelay: `${i * 0.8}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Heavy Elements Orbiting (simplified) */}
        {isOptimal && metallicity > 0.015 && (
          <div className="heavy-elements">
            {['C', 'O', 'Si', 'Fe'].slice(0, Math.floor(metallicity * 200)).map((element, i) => (
              <div 
                key={`${element}-${i}`}
                className="element-particle"
                style={{
                  backgroundColor: `rgba(${100 + i * 40}, ${150 + i * 20}, 255, ${Math.min(metallicity * 30, 0.6)})`,
                  animation: `element-orbit-${i % 4} ${3 + (i % 4) * 0.5}s linear infinite`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>
        )}
        
        {/* Status Text */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-center">
          {isTooDim && (
            <span className="text-red-400">
              {stellarMass < 0.3 ? "💀 Brown Dwarf - No Fusion" : 
               stellarMass < 0.5 ? "🔥 Dying Red Dwarf" : 
               "⚠️ Insufficient Mass"}
            </span>
          )}
          {isOptimal && (
            <span className="text-green-400">✨ Stable Main Sequence</span>
          )}
          {isTooMassive && (
            <span className="text-orange-400">
              {stellarMass > 1.8 ? "💥 Supernova Imminent!" : 
               stellarMass > 1.6 ? "🔥 Blue Supergiant" : 
               "⚠️ Massive & Unstable"}
            </span>
          )}
        </div>
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
          transition: all 0.5s ease;
        }
        .stable-pulse {
          animation: stable-pulse 3s ease-in-out infinite;
        }
        .dying-flicker {
          animation: dying-flicker 1.5s ease-in-out infinite;
        }
        .massive-pulse {
          animation: massive-pulse 1s ease-in-out infinite;
        }
        .pre-explosion {
          animation: pre-explosion 0.5s ease-in-out infinite;
        }
        .explosion-particle {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: explosion-expand 2s ease-out infinite;
        }
        .ember {
          position: absolute;
          width: 3px;
          height: 3px;
          background: rgba(255, 100, 0, 0.6);
          border-radius: 50%;
          animation: ember-fade 2s ease-in-out infinite;
        }
        .planetary-system {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 180px;
          height: 180px;
          transform: translate(-50%, -50%);
        }
        .dust-disk {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 160px;
          height: 160px;
          border: 2px solid rgba(139, 69, 19, 0.6);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, transparent 30%, rgba(139, 69, 19, 0.2) 50%, transparent 70%);
          animation: disk-rotation 20s linear infinite;
        }
        .planetesimal {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          animation: planetesimal-drift 4s ease-in-out infinite;
        }
        .habitable-zone {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
        .hz-ring {
          width: 120px;
          height: 120px;
          border: 2px dashed rgba(0, 255, 0, 0.6);
          border-radius: 50%;
          animation: hz-pulse 3s ease-in-out infinite;
        }
        .hz-label {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 8px;
          color: rgba(0, 255, 0, 0.8);
          white-space: nowrap;
        }
        .proto-planet {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: planet-formation 2s ease-in-out infinite;
        }
        .element-particle {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          transform-origin: 0 0;
        }
        @keyframes stable-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.05); }
        }
        @keyframes dying-flicker {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          25% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.1; }
          50% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.4; }
          75% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.2; }
        }
        @keyframes massive-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes pre-explosion {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          25% { transform: translate(-50%, -50%) scale(1.2); }
          50% { transform: translate(-50%, -50%) scale(0.9); }
          75% { transform: translate(-50%, -50%) scale(1.3); }
        }
        @keyframes explosion-expand {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(3); opacity: 0; }
        }
        @keyframes ember-fade {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.8; transform: scale(1); }
        }
        @keyframes element-orbit-0 {
          from { transform: translate(-50%, -50%) rotate(0deg) translateX(50px) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg) translateX(50px) rotate(-360deg); }
        }
        @keyframes element-orbit-1 {
          from { transform: translate(-50%, -50%) rotate(0deg) translateX(65px) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg) translateX(65px) rotate(-360deg); }
        }
        @keyframes element-orbit-2 {
          from { transform: translate(-50%, -50%) rotate(0deg) translateX(80px) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg) translateX(80px) rotate(-360deg); }
        }
        @keyframes element-orbit-3 {
          from { transform: translate(-50%, -50%) rotate(0deg) translateX(95px) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg) translateX(95px) rotate(-360deg); }
        }
        @keyframes disk-rotation {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes planetesimal-drift {
          0%, 100% { transform: translateY(0px); opacity: 0.7; }
          50% { transform: translateY(-3px); opacity: 1; }
        }
        @keyframes hz-pulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
        }
        @keyframes planet-formation {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
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
