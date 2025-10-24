'use client';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Slider } from '../../ui/slider'

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
      {/* All Controls - Side by Side Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        
        {/* Orbital Distance & Mass (shared visual) */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Orbital Distance & Planet Mass</CardTitle>
            <CardDescription className="text-gray-300">
              Distance from star and planetary mass affect habitability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlanetarySystem 
              orbitalDistance={orbitalDistance}
              planetMass={planetMass}
              atmosphericPressure={atmosphericPressure}
            />
            
            {/* Orbital Distance Slider */}
            <div className="mt-4">
              <div className="text-sm text-gray-300 mb-2">Orbital Distance</div>
              <div className="relative">
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
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>Too Hot</span>
                <span className="text-green-400 font-bold">0.8-1.5 AU</span>
                <span className="text-white font-medium">{orbitalDistance.toFixed(1)} AU</span>
                <span>Too Cold</span>
              </div>
            </div>

            {/* Planet Mass Slider */}
            <div className="mt-4">
              <div className="text-sm text-gray-300 mb-2">Planet Mass</div>
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
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>Too Small</span>
                <span className="text-green-400 font-bold">0.5-2.0 M⊕</span>
                <span className="text-white font-medium">{planetMass.toFixed(1)} M⊕</span>
                <span>Too Large</span>
              </div>
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> Planetary system showing how orbital distance and mass affect habitability.</p>
                  <p><strong>Habitable zone:</strong> The "Goldilocks zone" where liquid water can exist - not too hot, not too cold.</p>
                  <p><strong>Mass matters:</strong> Planets need 0.5-2.0 Earth masses for optimal conditions - enough gravity to hold atmosphere, not too much to crush life.</p>
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
              Atmospheric density and water conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gradient-to-b from-blue-900/20 to-blue-950/40 rounded-lg relative overflow-hidden mb-4">
              {/* Water/Atmosphere Visualization */}
              {atmosphericPressure < 0.3 ? (
                // Low pressure - water vapor escaping
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="text-3xl">💨</div>
                    <div className="text-sm text-blue-300">Water Vapor Escaping</div>
                    <div className="text-xs text-gray-400">Pressure too low for liquid water</div>
                  </div>
                  {/* Vapor particles */}
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-blue-300/60 rounded-full animate-pulse"
                      style={{
                        left: `${20 + i * 12}%`,
                        top: `${30 + (i % 3) * 15}%`,
                        animationDelay: `${i * 0.3}s`
                      }}
                    />
                  ))}
                </div>
              ) : atmosphericPressure > 2.0 ? (
                // High pressure - crushing depth
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-blue-800/30 to-blue-950/60">
                  <div className="text-center space-y-2">
                    <div className="text-3xl">🌊</div>
                    <div className="text-sm text-blue-300">Crushing Pressure</div>
                    <div className="text-xs text-gray-400">
                      Like {Math.round((atmosphericPressure - 1) * 10)}m underwater
                    </div>
                  </div>
                  {/* Pressure lines */}
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-full h-0.5 bg-blue-400/30"
                      style={{ top: `${25 + i * 15}%` }}
                    />
                  ))}
                </div>
              ) : (
                // Optimal pressure - liquid water
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="text-3xl">💧</div>
                    <div className="text-sm text-blue-300">Liquid Water Stable</div>
                    <div className="text-xs text-gray-400">Optimal pressure range</div>
                  </div>
                  {/* Water droplets */}
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-blue-400/80 rounded-full"
                      style={{
                        left: `${30 + i * 20}%`,
                        top: `${60 + i * 5}%`
                      }}
                    />
                  ))}
                </div>
              )}
              
              {/* Pressure reading */}
              <div className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                {atmosphericPressure.toFixed(1)} atm
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
              <span>Vapor</span>
              <span className="text-green-400 font-bold">0.3-2.0 atm</span>
              <span className="text-white font-medium">{atmosphericPressure.toFixed(1)} atm</span>
              <span>Crushing</span>
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> Water state visualization showing how atmospheric pressure affects liquid water stability.</p>
                  <p><strong>Low pressure:</strong> Water vapor escapes - like Mars where low pressure causes water to boil away.</p>
                  <p><strong>High pressure:</strong> Crushing conditions - like being underwater where every 10m depth adds 1 atmosphere of pressure.</p>
                  <p><strong>Optimal range:</strong> 0.3-2.0 atmospheres allows stable liquid water essential for life.</p>
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
              Planetary magnetic shield protecting atmosphere
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gradient-to-b from-purple-900/20 to-black/40 rounded-lg relative overflow-hidden mb-4">
              {/* Magnetic Field Visualization */}
              
              {/* Earth in the center - always present */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-green-400 relative">
                  {/* Earth continents */}
                  <div className="absolute inset-1 rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
                    <div className="absolute top-1 left-1 w-2 h-1 bg-green-500/80 rounded-sm"></div>
                    <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-green-500/80 rounded-sm"></div>
                    <div className="absolute top-2 right-0.5 w-1 h-1 bg-green-500/80 rounded-sm"></div>
                  </div>
                </div>
              </div>

              {magneticField < 0.3 ? (
                // Weak/No magnetic field - solar wind stripping
                <div className="absolute inset-0">
                  {/* Status text */}
                  <div className="absolute top-4 left-4 text-center">
                    <div className="text-sm text-red-300 font-semibold">Atmosphere Stripping</div>
                    <div className="text-xs text-gray-400">No magnetic protection</div>
                  </div>
                  
                  {/* Solar wind particles hitting planet directly */}
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-0.5 h-6 bg-gradient-to-b from-yellow-300 to-orange-400 rounded-full opacity-80"
                      style={{
                        left: `${5 + i * 7}%`,
                        top: `${15 + (i % 3) * 8}%`,
                        transform: `rotate(${10 + i * 3}deg)`,
                        animation: `pulse ${1 + i * 0.1}s infinite`
                      }}
                    />
                  ))}
                  
                  {/* Atmosphere being stripped away */}
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-blue-300/60 rounded-full animate-pulse"
                      style={{
                        left: `${60 + i * 8}%`,
                        top: `${40 + i * 5}%`,
                        animationDelay: `${i * 0.3}s`
                      }}
                    />
                  ))}
                </div>
              ) : magneticField > 1.5 ? (
                // Very strong magnetic field - radiation belt hazard
                <div className="absolute inset-0">
                  {/* Status text */}
                  <div className="absolute top-4 left-4 text-center">
                    <div className="text-sm text-purple-300 font-semibold">Dangerous Radiation Belts</div>
                    <div className="text-xs text-gray-400">Field too strong</div>
                  </div>
                  
                  {/* Intense magnetic field lines */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute border-2 border-purple-400/60 rounded-full"
                      style={{
                        width: `${30 + i * 12}px`,
                        height: `${15 + i * 6}px`,
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        animation: `pulse ${2 + i * 0.2}s infinite`
                      }}
                    />
                  ))}
                  
                  {/* Trapped radiation particles */}
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-0.5 h-0.5 bg-purple-300 rounded-full animate-ping"
                      style={{
                        left: `${30 + (i % 8) * 5}%`,
                        top: `${35 + Math.floor(i / 8) * 15}%`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              ) : (
                // Optimal magnetic field - protective shield
                <div className="absolute inset-0">
                  {/* Status text */}
                  <div className="absolute top-4 left-4 text-center">
                    <div className="text-sm text-blue-300 font-semibold">Protective Magnetosphere</div>
                    <div className="text-xs text-gray-400">Optimal protection</div>
                  </div>
                  
                  {/* Magnetic field lines - dipole pattern */}
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute border border-blue-400/50 rounded-full"
                      style={{
                        width: `${50 + i * 15}px`,
                        height: `${25 + i * 8}px`,
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  ))}
                  
                  {/* Solar wind being deflected */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-0.5 h-4 bg-gradient-to-b from-yellow-300 to-transparent rounded-full"
                      style={{
                        left: `${15 + i * 8}%`,
                        top: `${20 + (i % 2) * 10}%`,
                        transform: `rotate(${25 + i * 5}deg)`
                      }}
                    />
                  ))}
                  
                  {/* Deflected particles curving around */}
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-0.5 h-3 bg-yellow-200/70 rounded-full"
                      style={{
                        left: `${70 + i * 4}%`,
                        top: `${30 + i * 8}%`,
                        transform: `rotate(${60 + i * 10}deg)`
                      }}
                    />
                  ))}
                  
                  {/* Aurora effect at poles */}
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-gradient-to-t from-green-400/60 to-transparent rounded-full blur-sm"></div>
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-gradient-to-b from-green-400/60 to-transparent rounded-full blur-sm"></div>
                </div>
              )}
              
              {/* Field strength reading */}
              <div className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                {magneticField.toFixed(1)}x Earth
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
              <span>No Shield</span>
              <span className="text-green-400 font-bold">0.3-1.5x</span>
              <span className="text-white font-medium">{magneticField.toFixed(1)}x</span>
              <span>Too Strong</span>
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> Magnetic field visualization showing how planetary magnetism protects against solar radiation.</p>
                  <p><strong>Weak field:</strong> Solar wind strips atmosphere away like Mars - no protection from harmful radiation.</p>
                  <p><strong>Strong field:</strong> Creates dangerous radiation belts that would harm surface life.</p>
                  <p><strong>Optimal range:</strong> 0.3-1.5x Earth strength provides protection without creating hazardous radiation zones.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
