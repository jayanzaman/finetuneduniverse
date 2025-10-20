'use client';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

// Planetary System Visualization
function PlanetarySystem({ orbitalDistance, planetMass, atmosphericPressure }: {
  orbitalDistance: number;
  planetMass: number;
  atmosphericPressure: number;
}) {
  const starSize = 30;
  const planetSize = 6 + (planetMass * 8);
  const orbitRadius = 40 + (orbitalDistance * 60);
  const temperature = 400 / (orbitalDistance * orbitalDistance); // Simplified inverse square law
  const habitableZoneInner = 60;
  const habitableZoneOuter = 100;
  
  // Planet color based on temperature and atmosphere
  const getPlanetColor = () => {
    if (temperature > 100) return 'rgba(255, 100, 50, 0.9)'; // Too hot - red
    if (temperature < 0) return 'rgba(150, 200, 255, 0.9)'; // Too cold - blue
    if (atmosphericPressure > 0.5 && temperature > 0 && temperature < 100) {
      return 'rgba(100, 150, 255, 0.9)'; // Potentially habitable - blue-green
    }
    return 'rgba(180, 120, 80, 0.9)'; // Rocky - brown
  };

  return (
    <div className="relative w-full h-48 flex items-center justify-center overflow-hidden bg-black/30 rounded-lg">
      <div className="solar-system relative w-48 h-48">
        {/* Habitable Zone */}
        <div 
          className="absolute border-2 border-green-500/30 rounded-full"
          style={{
            width: `${habitableZoneOuter * 2}px`,
            height: `${habitableZoneOuter * 2}px`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div 
          className="absolute border-2 border-green-500/30 rounded-full"
          style={{
            width: `${habitableZoneInner * 2}px`,
            height: `${habitableZoneInner * 2}px`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        
        {/* Star */}
        <div 
          className="absolute rounded-full bg-yellow-400"
          style={{
            width: `${starSize}px`,
            height: `${starSize}px`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 ${starSize}px rgba(255, 255, 0, 0.5)`,
          }}
        />
        
        {/* Planet Orbit */}
        <div 
          className="absolute border border-white/20 rounded-full"
          style={{
            width: `${orbitRadius * 2}px`,
            height: `${orbitRadius * 2}px`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        
        {/* Planet */}
        <div 
          className="absolute rounded-full"
          style={{
            width: `${planetSize}px`,
            height: `${planetSize}px`,
            backgroundColor: getPlanetColor(),
            left: `${50 + (orbitRadius / 96) * 50}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: atmosphericPressure > 0.3 ? `0 0 ${planetSize * 2}px rgba(100, 150, 255, 0.3)` : 'none',
          }}
        />
        
        {/* Temperature indicator */}
        <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
          {temperature.toFixed(0)}°C
        </div>
      </div>
    </div>
  )
}

export default function PlanetsSection({ 
  educatorMode, 
  cosmicTime = 0
}: { 
  educatorMode: boolean; 
  cosmicTime?: number;
}) {
  const [orbitalDistance, setOrbitalDistance] = useState(1) // AU
  const [planetMass, setPlanetMass] = useState(1) // Earth masses
  const [atmosphericPressure, setAtmosphericPressure] = useState(1) // Earth atmospheres
  const [magneticField, setMagneticField] = useState(1) // Earth strength

  useEffect(() => {
    const handleRandomize = () => {
      setOrbitalDistance(0.3 + Math.random() * 2.7) // 0.3 to 3 AU
      setPlanetMass(0.1 + Math.random() * 4.9) // 0.1 to 5 Earth masses
      setAtmosphericPressure(Math.random() * 3) // 0 to 3 atmospheres
      setMagneticField(Math.random() * 2) // 0 to 2x Earth strength
    }

    window.addEventListener('randomizeUniverse', handleRandomize)
    return () => window.removeEventListener('randomizeUniverse', handleRandomize)
  }, [])

  return (
    <div className="container mx-auto px-4">
      {/* Header Section */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-white">Planets & Habitability</h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Rocky planets form around stars, but only those in the habitable zone with the right conditions can support liquid water and life.
        </p>
      </div>

      {/* Primary Controls - Balanced Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
        {/* Orbital Distance */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Orbital Distance</CardTitle>
            <CardDescription className="text-gray-300">
              Distance from the host star (AU)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlanetarySystem 
              orbitalDistance={orbitalDistance}
              planetMass={planetMass}
              atmosphericPressure={atmosphericPressure}
            />
            <div className="relative mt-4">
              <Slider
                value={[orbitalDistance]}
                onValueChange={(value) => setOrbitalDistance(value[0])}
                max={3}
                min={0.3}
                step={0.1}
                className="w-full"
              />
              <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                   style={{
                     left: `${((0.8 - 0.3) / (3 - 0.3)) * 100}%`,
                     width: `${((1.5 - 0.8) / (3 - 0.3)) * 100}%`
                   }}></div>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-4">
              <span>Too Hot</span>
              <span className="text-green-400 font-bold">0.8-1.5 AU (habitable)</span>
              <span className="text-white font-medium">{orbitalDistance.toFixed(1)} AU</span>
              <span>Too Cold</span>
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> Planetary system visualization showing orbital distance, habitable zone (green rings), and resulting surface temperature.</p>
                  <p><strong>Habitable zone:</strong> The "Goldilocks zone" where liquid water can exist - not too hot, not too cold, but just right for life.</p>
                  <p><strong>Inverse square law:</strong> Planet temperature drops with distance squared - small orbital changes have dramatic climate effects.</p>
                  <p><strong>Solar system comparison:</strong> Earth at 1 AU, Venus at 0.7 AU (too hot), Mars at 1.5 AU (too cold but borderline habitable).</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Planet Mass */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Planet Mass</CardTitle>
            <CardDescription className="text-gray-300">
              Mass relative to Earth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-black/30 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🪐</div>
                <div className="text-sm text-gray-300">Mass</div>
                <div className="text-lg font-bold text-white">{planetMass.toFixed(1)} M⊕</div>
              </div>
            </div>
            <div className="relative">
              <Slider
                value={[planetMass]}
                onValueChange={(value) => setPlanetMass(value[0])}
                max={5}
                min={0.1}
                step={0.1}
                className="w-full"
              />
              <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                   style={{
                     left: `${((0.5 - 0.1) / (5 - 0.1)) * 100}%`,
                     width: `${((2.0 - 0.5) / (5 - 0.1)) * 100}%`
                   }}></div>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-4">
              <span>Too Small</span>
              <span className="text-green-400 font-bold">0.5-2.0 M⊕ (optimal)</span>
              <span className="text-white font-medium">{planetMass.toFixed(1)} M⊕</span>
              <span>Too Large</span>
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> Planet mass indicator showing how planetary size affects gravity, atmosphere retention, and geological activity.</p>
                  <p><strong>Mass matters:</strong> Planets need 0.5-2.0 Earth masses for optimal conditions - enough gravity to hold atmosphere, not too much to crush life.</p>
                  <p><strong>Too small:</strong> Low gravity can't retain atmosphere (like Mars) - water boils away into space, no protection from radiation.</p>
                  <p><strong>Too large:</strong> High gravity creates thick atmospheres (like Venus) - runaway greenhouse effect, crushing surface pressure.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Atmospheric Pressure */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Atmospheric Pressure</CardTitle>
            <CardDescription className="text-gray-300">
              Atmospheric density relative to Earth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-black/30 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🌬️</div>
                <div className="text-sm text-gray-300">Pressure</div>
                <div className="text-lg font-bold text-white">{atmosphericPressure.toFixed(1)} atm</div>
              </div>
            </div>
            <div className="relative">
              <Slider
                value={[atmosphericPressure]}
                onValueChange={(value) => setAtmosphericPressure(value[0])}
                max={3}
                min={0}
                step={0.1}
                className="w-full"
              />
              <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                   style={{
                     left: `${((0.3 - 0) / (3 - 0)) * 100}%`,
                     width: `${((2.0 - 0.3) / (3 - 0)) * 100}%`
                   }}></div>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-4">
              <span>No Atmosphere</span>
              <span className="text-green-400 font-bold">0.3-2.0 atm (habitable)</span>
              <span className="text-white font-medium">{atmosphericPressure.toFixed(1)} atm</span>
              <span>Too Dense</span>
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> Atmospheric pressure gauge showing the density of gases surrounding the planet.</p>
                  <p><strong>Pressure balance:</strong> Need 0.3-2.0 atmospheres for liquid water - too little and water boils, too much creates crushing conditions.</p>
                  <p><strong>Greenhouse effect:</strong> Moderate atmosphere provides temperature regulation through greenhouse warming and heat distribution.</p>
                  <p><strong>Atmospheric loss:</strong> Planets lose atmosphere through solar wind stripping, impact erosion, and thermal escape - mass and magnetic fields help retention.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Magnetic Field */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Magnetic Field</CardTitle>
            <CardDescription className="text-gray-300">
              Magnetic field strength relative to Earth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-black/30 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🧲</div>
                <div className="text-sm text-gray-300">Field Strength</div>
                <div className="text-lg font-bold text-white">{magneticField.toFixed(1)}x Earth</div>
              </div>
            </div>
            <div className="relative">
              <Slider
                value={[magneticField]}
                onValueChange={(value) => setMagneticField(value[0])}
                max={2}
                min={0}
                step={0.1}
                className="w-full"
              />
              <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                   style={{
                     left: `${((0.3 - 0) / (2 - 0)) * 100}%`,
                     width: `${((1.5 - 0.3) / (2 - 0)) * 100}%`
                   }}></div>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-4">
              <span>No Field</span>
              <span className="text-green-400 font-bold">0.3-1.5x (protective)</span>
              <span className="text-white font-medium">{magneticField.toFixed(1)}x</span>
              <span>Very Strong</span>
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> Magnetic field strength indicator showing the planet's ability to deflect harmful solar radiation.</p>
                  <p><strong>Radiation shield:</strong> Magnetic fields (0.3-1.5x Earth) deflect solar wind and cosmic rays, protecting atmosphere and surface life.</p>
                  <p><strong>Mars comparison:</strong> Mars lost its magnetic field ~4 billion years ago, allowing solar wind to strip away its atmosphere over time.</p>
                  <p><strong>Dynamo effect:</strong> Generated by molten iron core convection - requires sufficient planetary mass and internal heat for long-term stability.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
