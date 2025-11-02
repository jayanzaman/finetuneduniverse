'use client';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Slider } from '../../ui/slider'

// Water State Visualization Component
function WaterStateVisual({ orbitalDistance, planetMass, atmosphericPressure, basePressure, magneticField }: {
  orbitalDistance: number;
  planetMass: number;
  atmosphericPressure: number;
  basePressure: number;
  magneticField: number;
}) {
  // More realistic temperature calculation (Earth = ~15°C at 1 AU)
  const baseTemp = 278 / Math.sqrt(orbitalDistance);
  const temperature = baseTemp - 273;
  
  // Use the already calculated effective atmospheric pressure
  const effectivePressure = atmosphericPressure;
  
  return (
    <div className="h-full bg-gradient-to-b from-blue-900/20 to-blue-950/40 rounded-lg relative overflow-hidden flex items-center justify-center">
      {/* Water/Atmosphere Visualization - affected by orbital distance, mass, and pressure */}
      {(() => {
        // Determine water state based on conditions
        if (temperature > 100) {
          // Too hot - water boils
          return (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-3xl">💨</div>
                <div className="text-sm text-red-300">Water Vapor Escaping</div>
                <div className="text-xs text-gray-400">Too hot ({temperature.toFixed(0)}°C)</div>
              </div>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-red-300/60 rounded-full animate-pulse"
                  style={{
                    left: `${15 + i * 10}%`,
                    top: `${25 + (i % 4) * 12}%`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          );
        } else if (planetMass < 0.3) {
          // Mass too low - can't retain atmosphere
          return (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-3xl">💨</div>
                <div className="text-sm text-red-300">Atmosphere Lost</div>
                <div className="text-xs text-gray-400">Mass too low ({planetMass.toFixed(1)} M⊕)</div>
              </div>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-red-300/60 rounded-full animate-pulse"
                  style={{
                    left: `${15 + i * 10}%`,
                    top: `${25 + (i % 4) * 12}%`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          );
        } else if (effectivePressure < 0.8) {
          // Pressure too low - water boils
          return (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-3xl">💨</div>
                <div className="text-sm text-red-300">Water Boiling Away</div>
                <div className="text-xs text-gray-400">Pressure too low ({effectivePressure.toFixed(2)} atm)</div>
              </div>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-red-300/60 rounded-full animate-pulse"
                  style={{
                    left: `${15 + i * 10}%`,
                    top: `${25 + (i % 4) * 12}%`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          );
        } else if (temperature < -10) {
          // Too cold - water freezes
          return (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-3xl">🧊</div>
                <div className="text-sm text-cyan-300">Water Frozen</div>
                <div className="text-xs text-gray-400">Too cold ({temperature.toFixed(0)}°C)</div>
              </div>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-cyan-300/60 rounded-sm rotate-45"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${40 + (i % 2) * 20}%`,
                  }}
                />
              ))}
            </div>
          );
        } else if (effectivePressure > 1.2) {
          // Pressure too high - crushing
          return (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-blue-800/30 to-blue-950/60">
              <div className="text-center space-y-2">
                <div className="text-3xl">🌊</div>
                <div className="text-sm text-blue-300">Crushing Pressure</div>
                <div className="text-xs text-gray-400">Too dense ({effectivePressure.toFixed(2)} atm)</div>
              </div>
            </div>
          );
        } else {
          // Liquid water - habitable!
          return (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-3xl">💧</div>
                <div className="text-sm text-blue-300">Liquid Water</div>
                <div className="text-xs text-gray-400">{temperature.toFixed(0)}°C, {effectivePressure.toFixed(2)} atm</div>
              </div>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-blue-400/60 rounded-full animate-bounce"
                  style={{
                    left: `${20 + i * 12}%`,
                    top: `${50 + Math.sin(i) * 15}%`,
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: '2s'
                  }}
                />
              ))}
            </div>
          );
        }
      })()}
    </div>
  );
}

// Magnetic Field Visualization Component
function MagneticFieldVisual({ magneticField }: { magneticField: number }) {
  // Calculate dynamic properties based on magnetic field strength
  const fieldStrength = magneticField * 50; // Convert to μT
  const fieldLines = Math.max(3, Math.min(10, Math.floor(magneticField * 4))); // 3-10 field lines
  const fieldOpacity = Math.max(0.2, Math.min(1, magneticField / 2)); // Dynamic opacity
  const fieldColor = magneticField < 0.5 ? 'red' : magneticField > 2 ? 'purple' : 'green';
  
  // Determine status and color based on more granular thresholds
  const getStatus = () => {
    if (magneticField < 0.2) return { text: 'No Protection', subtext: 'Atmosphere lost', color: 'text-red-400' };
    if (magneticField < 0.5) return { text: 'Weak Field', subtext: 'Partial stripping', color: 'text-orange-400' };
    if (magneticField < 0.8) return { text: 'Developing', subtext: 'Building protection', color: 'text-yellow-400' };
    if (magneticField <= 1.2) return { text: 'Protected', subtext: 'Optimal shield', color: 'text-green-400' };
    if (magneticField <= 2.0) return { text: 'Strong Field', subtext: 'Good protection', color: 'text-blue-400' };
    return { text: 'Radiation Hazard', subtext: 'Field too intense', color: 'text-purple-400' };
  };

  const status = getStatus();

  return (
    <div className="h-full bg-gradient-to-b from-purple-900/20 to-black/40 rounded-lg relative overflow-hidden">
      {/* Planet in center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-green-400 relative">
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
            <div className="absolute top-1 left-1 w-2 h-1 bg-green-500/80 rounded-sm"></div>
            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-green-500/80 rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Dynamic magnetic field visualization */}
      <div className="absolute inset-0">
        {/* Status text */}
        <div className="absolute top-4 left-4 right-4 text-center">
          <div className={`text-sm font-semibold ${status.color}`}>{status.text}</div>
          <div className="text-xs text-gray-400">{status.subtext}</div>
        </div>
        
        {magneticField < 0.2 ? (
          // No magnetic field - direct solar wind impact
          <>
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-red-400/80 rounded-full animate-pulse"
                style={{
                  left: `${5 + i * 6}%`,
                  top: `${25 + (i % 4) * 12}%`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </>
        ) : magneticField > 2.5 ? (
          // Extremely strong field - radiation hazard
          <>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-px h-16 bg-gradient-to-b from-purple-400 to-transparent animate-pulse"
                style={{
                  left: `${15 + i * 6}%`,
                  top: `${15 + (i % 3) * 8}%`,
                  transform: `rotate(${i * 12}deg)`,
                  animationDelay: `${i * 0.15}s`
                }}
              />
            ))}
          </>
        ) : (
          // Dynamic magnetic field lines based on strength
          <>
            {[...Array(fieldLines)].map((_, i) => (
              <div
                key={i}
                className={`absolute border rounded-full ${
                  fieldColor === 'red' ? 'border-red-400/60' :
                  fieldColor === 'purple' ? 'border-purple-400/60' :
                  'border-green-400/60'
                }`}
                style={{
                  width: `${50 + i * (10 + magneticField * 5)}px`,
                  height: `${35 + i * (7 + magneticField * 3)}px`,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: fieldOpacity - (i * 0.1),
                  borderWidth: `${Math.max(1, magneticField)}px`
                }}
              />
            ))}
            
            {/* Solar wind deflection particles */}
            {magneticField > 0.5 && [...Array(8)].map((_, i) => (
              <div
                key={`deflect-${i}`}
                className="absolute w-0.5 h-0.5 bg-yellow-300/60 rounded-full animate-pulse"
                style={{
                  left: `${20 + i * 8}%`,
                  top: `${20 + (i % 2) * 40}%`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </>
        )}
      </div>
      
      {/* Field strength reading with dynamic color */}
      <div className={`absolute bottom-2 right-2 text-xs bg-black/50 px-2 py-1 rounded ${status.color}`}>
        {fieldStrength.toFixed(0)} μT
      </div>
    </div>
  );
}

// Planetary System Visualization
function PlanetarySystem({ orbitalDistance, planetMass, atmosphericPressure, basePressure, magneticField }: {
  orbitalDistance: number;
  planetMass: number;
  atmosphericPressure: number;
  basePressure: number;
  magneticField: number;
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
      <div className="solar-system relative w-full h-full max-w-48 max-h-48">
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
          className="absolute"
          style={{
            width: `${planetSize}px`,
            height: `${planetSize}px`,
            left: `${50 + (orbitRadius / 96) * 50}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: atmosphericPressure > 0.3 ? `0 0 ${planetSize * 2}px rgba(100, 150, 255, 0.3)` : 'none',
          }}
        >
          {/* Earth-like representation when ALL conditions are optimal */}
          {orbitalDistance >= 0.9 && orbitalDistance <= 1.1 && 
           planetMass >= 0.8 && planetMass <= 1.3 && 
           basePressure >= 0.8 && basePressure <= 1.2 &&
           magneticField >= 0.8 && magneticField <= 1.2 ? (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-green-400 relative">
              {/* Earth continents - exact match to magnetic field Earth */}
              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
                <div className="absolute top-1 left-1 w-2 h-1 bg-green-500/80 rounded-sm"></div>
                <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-green-500/80 rounded-sm"></div>
                <div className="absolute top-2 right-0.5 w-1 h-1 bg-green-500/80 rounded-sm"></div>
              </div>
            </div>
          ) : (
            /* Regular planet for non-Earth-like conditions */
            <div 
              className="w-full h-full rounded-full"
              style={{
                backgroundColor: getPlanetColor(),
              }}
            />
          )}
        </div>
        
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
  const [basePressure, setBasePressure] = useState(1) // Base atmospheric pressure (what user sets)
  const [atmosphericPressure, setAtmosphericPressure] = useState(1) // Effective atmospheric pressure
  const [magneticField, setMagneticField] = useState(1) // Earth strength (50 μT)

  // Calculate effective atmospheric pressure based on planet mass
  useEffect(() => {
    const canRetainAtmosphere = planetMass >= 0.3;
    const effectivePressure = canRetainAtmosphere ? basePressure : basePressure * 0.2;
    setAtmosphericPressure(effectivePressure);
  }, [planetMass, basePressure]);

  useEffect(() => {
    const handleRandomize = () => {
      setOrbitalDistance(0.1 + Math.random() * 4.9) // 0.1 to 5 AU
      setPlanetMass(0.01 + Math.random() * 9.99) // 0.01 to 10 Earth masses
      setBasePressure(Math.random() * 10) // 0 to 10 atmospheres
      setMagneticField(Math.random() * 5) // 0 to 5x Earth strength
    }

    window.addEventListener('randomizeUniverse', handleRandomize)
    return () => window.removeEventListener('randomizeUniverse', handleRandomize)
  }, [])


  // Mobile carousel state
  const [currentStep, setCurrentStep] = useState(0)
  
  // Define the steps for mobile carousel
  const steps = [
    {
      id: 'orbital-distance',
      title: 'Orbital Distance',
      subtitle: 'Goldilocks Zone',
      description: 'Distance from star affects temperature',
      visual: <PlanetarySystem 
        orbitalDistance={orbitalDistance}
        planetMass={planetMass}
        atmosphericPressure={atmosphericPressure}
        basePressure={basePressure}
        magneticField={magneticField}
      />,
      educatorContent: (
        <div className="space-y-2">
          <p><strong>What you're seeing:</strong> Planetary system showing orbital distance, habitable zone (green rings), and resulting surface temperature.</p>
          <p><strong>Goldilocks zone:</strong> The region around a star where liquid water can exist - not too hot, not too cold, but just right!</p>
          <p><strong>Temperature calculation:</strong> Uses inverse square law - planets closer to star receive more energy and get hotter. Earth at 1 AU = ~15°C average.</p>
          <p><strong>Interactive learning:</strong> Move the orbital distance slider to see how planet temperature changes. Watch the planet move in and out of the habitable zone!</p>
        </div>
      )
    },
    {
      id: 'water-state',
      title: 'Water State',
      subtitle: 'Liquid Water Zone',
      description: 'Temperature and pressure determine water phase',
      visual: <WaterStateVisual 
        orbitalDistance={orbitalDistance}
        planetMass={planetMass}
        atmosphericPressure={atmosphericPressure}
        basePressure={basePressure}
        magneticField={magneticField}
      />,
      educatorContent: (
        <div className="space-y-2">
          <p><strong>What you're seeing:</strong> Water state affected by orbital distance (temperature), planet mass (atmosphere retention), and atmospheric pressure.</p>
          <p><strong>Mass-atmosphere correlation:</strong> Watch how changing planet mass automatically affects atmospheric pressure - low mass planets can't retain thick atmospheres!</p>
          <p><strong>Water phase diagram:</strong> Liquid water requires specific temperature and pressure conditions. Too hot = steam, too cold = ice, too low pressure = boiling.</p>
          <p><strong>Habitability factors:</strong> Life as we know it requires liquid water, so this visualization shows the complex interplay of factors needed for habitability.</p>
        </div>
      )
    },
    {
      id: 'magnetic-field',
      title: 'Magnetic Field',
      subtitle: 'Atmospheric Protection',
      description: 'Magnetic shield protects atmosphere from solar wind',
      visual: <MagneticFieldVisual magneticField={magneticField} />,
      educatorContent: (
        <div className="space-y-2">
          <p><strong>What you're seeing:</strong> Magnetic field visualization showing how planetary magnetism protects against solar radiation.</p>
          <p><strong>Solar wind protection:</strong> Charged particles from the sun can strip away planetary atmospheres. A magnetic field deflects these particles around the planet.</p>
          <p><strong>Field strength matters:</strong> Too weak = atmosphere loss (Mars), too strong = radiation hazard (Jupiter). Earth's ~50 μT field is just right!</p>
          <p><strong>Dynamic visualization:</strong> Watch field lines change color and intensity as you adjust magnetic strength. See solar wind particles being deflected or hitting the planet directly.</p>
        </div>
      )
    }
  ]

  return (
    <div className="container mx-auto px-4">
      {/* Mobile: Carousel Layout */}
      <div className="md:hidden mb-6">
        <Card className="bg-black/20 border-white/10 text-white">
          <CardContent>
            <div className="space-y-4">
              {/* Header with progress */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-white">{steps[currentStep].title}</h4>
                  <p className="text-xs text-gray-300">{steps[currentStep].subtitle}</p>
                </div>
                <div className="flex items-center space-x-1">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentStep 
                          ? 'bg-blue-400 scale-125' 
                          : 'bg-gray-500/60'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mb-3">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-gray-600 active:scale-95 text-sm"
                >
                  Previous
                </button>
                
                <div className="text-center px-4">
                  <span className="text-sm font-medium text-blue-400">
                    {currentStep + 1} / {steps.length}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{steps[currentStep].description}</p>
                </div>
                
                <button
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  disabled={currentStep === steps.length - 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-blue-500 active:scale-95 text-sm"
                >
                  Next
                </button>
              </div>
              
              {/* Visualization */}
              <div className="bg-black/30 rounded-lg p-3">
                <div className="h-64">
                  {steps[currentStep].visual}
                </div>
              </div>

              {/* Compact sliders - all visible without scrolling */}
              <div className="space-y-2 mt-3">
                {/* Orbital Distance Slider */}
                <div>
                  <div className="text-xs text-gray-300 mb-1">Orbital Distance</div>
                  <div className="relative">
                    <Slider
                      value={[orbitalDistance]}
                      onValueChange={(value) => setOrbitalDistance(value[0])}
                      max={5}
                      min={0.1}
                      step={0.05}
                      className="w-full [&>span[role=slider]]:h-3 [&>span[role=slider]]:w-3"
                    />
                    <div className="absolute top-2 h-1.5 bg-green-500/30 rounded pointer-events-none" 
                         style={{
                           left: `${((0.9 - 0.1) / (5 - 0.1)) * 100}%`,
                           width: `${((1.1 - 0.9) / (5 - 0.1)) * 100}%`
                         }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Hot</span>
                    <span className="text-white font-medium">{orbitalDistance.toFixed(1)} AU</span>
                    <span>Cold</span>
                  </div>
                </div>

                {/* Planet Mass Slider */}
                <div>
                  <div className="text-xs text-gray-300 mb-1">Planet Mass</div>
                  <div className="relative">
                    <Slider
                      value={[planetMass]}
                      onValueChange={(value) => setPlanetMass(value[0])}
                      max={10}
                      min={0.01}
                      step={0.05}
                      className="w-full [&>span[role=slider]]:h-3 [&>span[role=slider]]:w-3"
                    />
                    <div className="absolute top-2 h-1.5 bg-green-500/30 rounded pointer-events-none" 
                         style={{
                           left: `${((0.8 - 0.01) / (10 - 0.01)) * 100}%`,
                           width: `${((1.3 - 0.8) / (10 - 0.01)) * 100}%`
                         }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Small</span>
                    <span className="text-white font-medium">{planetMass.toFixed(1)} M⊕</span>
                    <span>Large</span>
                  </div>
                </div>

                {/* Atmospheric Pressure Slider */}
                <div>
                  <div className="text-xs text-gray-300 mb-1">Atmospheric Pressure</div>
                  <div className="relative">
                    <Slider
                      value={[basePressure]}
                      onValueChange={(value) => setBasePressure(value[0])}
                      max={10}
                      min={0}
                      step={0.02}
                      className="w-full [&>span[role=slider]]:h-3 [&>span[role=slider]]:w-3"
                    />
                    <div className="absolute top-2 h-1.5 bg-green-500/30 rounded pointer-events-none" 
                         style={{
                           left: `${((0.8 - 0) / (10 - 0)) * 100}%`,
                           width: `${((1.2 - 0.8) / (10 - 0)) * 100}%`
                         }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Vapor</span>
                    <span className="text-white font-medium">{basePressure.toFixed(2)} atm</span>
                    <span>Crush</span>
                  </div>
                </div>

                {/* Magnetic Field Slider */}
                <div>
                  <div className="text-xs text-gray-300 mb-1">Magnetic Field</div>
                  <div className="relative">
                    <Slider
                      value={[magneticField]}
                      onValueChange={(value) => setMagneticField(value[0])}
                      max={5}
                      min={0}
                      step={0.05}
                      className="w-full [&>span[role=slider]]:h-3 [&>span[role=slider]]:w-3"
                    />
                    <div className="absolute top-2 h-1.5 bg-green-500/30 rounded pointer-events-none" 
                         style={{
                           left: `${((0.8 - 0) / (5 - 0)) * 100}%`,
                           width: `${((1.2 - 0.8) / (5 - 0)) * 100}%`
                         }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>None</span>
                    <span className="text-white font-medium">{(magneticField * 50).toFixed(0)} μT</span>
                    <span>Strong</span>
                  </div>
                </div>
              </div>

              {/* Educator Mode Content */}
              {educatorMode && (
                <div className="mt-6 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="text-xs text-blue-200 leading-relaxed">
                    {steps[currentStep].educatorContent}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop: Four Sections Layout */}
      <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        
        {/* Control Panel: All Parameter Sliders */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Habitability Controls</CardTitle>
            <CardDescription className="text-gray-300">
              Adjust orbital distance, mass, atmosphere, and magnetic field
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Orbital Distance Slider */}
            <div className="mb-6">
              <div className="text-sm text-gray-300 mb-2">Orbital Distance</div>
              <div className="relative">
                <Slider
                  value={[orbitalDistance]}
                  onValueChange={(value) => setOrbitalDistance(value[0])}
                  max={5}
                  min={0.1}
                  step={0.05}
                  className="w-full"
                />
                <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                     style={{
                       left: `${((0.9 - 0.1) / (5 - 0.1)) * 100}%`,
                       width: `${((1.1 - 0.9) / (5 - 0.1)) * 100}%`
                     }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Hot</span>
                <span className="text-white font-medium">{orbitalDistance.toFixed(1)} AU</span>
                <span>Cold</span>
              </div>
            </div>

            {/* Planet Mass Slider */}
            <div className="mb-6">
              <div className="text-sm text-gray-300 mb-2">Planet Mass</div>
              <div className="relative">
                <Slider
                  value={[planetMass]}
                  onValueChange={(value) => setPlanetMass(value[0])}
                  max={10}
                  min={0.01}
                  step={0.05}
                  className="w-full"
                />
                <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                     style={{
                       left: `${((0.8 - 0.01) / (10 - 0.01)) * 100}%`,
                       width: `${((1.3 - 0.8) / (10 - 0.01)) * 100}%`
                     }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Small</span>
                <span className="text-white font-medium">{planetMass.toFixed(1)} M⊕</span>
                <span>Large</span>
              </div>
            </div>

            {/* Atmospheric Pressure Slider */}
            <div className="mb-6">
              <div className="text-sm text-gray-300 mb-2">
                Atmospheric Pressure
                {planetMass < 0.3 && (
                  <span className="text-red-300 text-xs ml-2 animate-pulse">(Mass too low - atmosphere escaping!)</span>
                )}
                {planetMass >= 0.3 && basePressure !== atmosphericPressure && (
                  <span className="text-yellow-300 text-xs ml-2">(Affected by mass)</span>
                )}
              </div>
              <div className="relative">
                <Slider
                  value={[atmosphericPressure]}
                  onValueChange={(value) => {
                    // When user moves slider, update base pressure to achieve desired effective pressure
                    const canRetainAtmosphere = planetMass >= 0.3;
                    const newBasePressure = canRetainAtmosphere ? value[0] : value[0] / 0.2;
                    setBasePressure(Math.min(10, newBasePressure)); // Cap at slider max
                  }}
                  max={10}
                  min={0}
                  step={0.02}
                  className="w-full transition-all duration-300 ease-in-out"
                />
                <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                     style={{
                       left: `${((0.8 - 0) / (10 - 0)) * 100}%`,
                       width: `${((1.2 - 0.8) / (10 - 0)) * 100}%`
                     }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Vapor</span>
                <div className="text-center">
                  <div className="text-white font-medium">{atmosphericPressure.toFixed(2)} atm</div>
                  {basePressure !== atmosphericPressure && (
                    <div className="text-gray-400 text-xs">
                      {planetMass < 0.3 ? 
                        `Lost: ${(basePressure - atmosphericPressure).toFixed(2)} atm` :
                        `Base: ${basePressure.toFixed(2)} atm`
                      }
                    </div>
                  )}
                </div>
                <span>Crush</span>
              </div>
            </div>

            {/* Magnetic Field Slider */}
            <div className="mb-4">
              <div className="text-sm text-gray-300 mb-2">Magnetic Field</div>
              <div className="relative">
                <Slider
                  value={[magneticField]}
                  onValueChange={(value) => setMagneticField(value[0])}
                  max={5}
                  min={0}
                  step={0.05}
                  className="w-full"
                />
                <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                     style={{
                       left: `${((0.8 - 0) / (5 - 0)) * 100}%`,
                       width: `${((1.2 - 0.8) / (5 - 0)) * 100}%`
                     }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>None</span>
                <span className="text-white font-medium">{(magneticField * 50).toFixed(0)} μT</span>
                <span>Strong</span>
              </div>
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>Interactive Controls:</strong> Watch how changing planet mass automatically affects atmospheric pressure - low mass planets can't retain thick atmospheres!</p>
                  <p><strong>Narrow optimal zones:</strong> Distance (0.9-1.1 AU), Mass (0.8-1.3 M⊕), Pressure (0.8-1.2 atm), Magnetic Field (40-60 μT). Habitability requires precise conditions!</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orbital Distance Visual */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Orbital Distance</CardTitle>
            <CardDescription className="text-gray-300">
              Distance from host star affects temperature
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PlanetarySystem 
              orbitalDistance={orbitalDistance}
              planetMass={planetMass}
              atmosphericPressure={atmosphericPressure}
              basePressure={basePressure}
              magneticField={magneticField}
            />
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> Planetary system showing orbital distance, habitable zone (green rings), and resulting surface temperature.</p>
                  <p><strong>Habitable zone:</strong> The "Goldilocks zone" where liquid water can exist - not too hot, not too cold.</p>
                  <p><strong>Inverse square law:</strong> Temperature drops with distance squared - small orbital changes have dramatic climate effects.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Water State Visual */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Water State</CardTitle>
            <CardDescription className="text-gray-300">
              Liquid water stability affected by multiple factors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gradient-to-b from-blue-900/20 to-blue-950/40 rounded-lg relative overflow-hidden flex items-center justify-center" key={`${orbitalDistance}-${planetMass}-${basePressure}`}>
              {/* Water/Atmosphere Visualization - affected by orbital distance, mass, and pressure */}
              {(() => {
                // More realistic temperature calculation (Earth = ~15°C at 1 AU)
                const baseTemp = 278 / Math.sqrt(orbitalDistance);
                const temperature = baseTemp - 273;
                
                // Use the already calculated effective atmospheric pressure
                const effectivePressure = atmosphericPressure;
                
                // Determine water state based on conditions
                if (temperature > 100) {
                  // Too hot - water boils
                  return (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-center space-y-2">
                        <div className="text-3xl">💨</div>
                        <div className="text-sm text-red-300">Water Vapor Escaping</div>
                        <div className="text-xs text-gray-400">Too hot ({temperature.toFixed(0)}°C)</div>
                      </div>
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-red-300/60 rounded-full animate-pulse"
                          style={{
                            left: `${15 + i * 10}%`,
                            top: `${25 + (i % 4) * 12}%`,
                            animationDelay: `${i * 0.2}s`
                          }}
                        />
                      ))}
                    </div>
                  );
                } else if (planetMass < 0.3) {
                  // Mass too low - can't retain atmosphere
                  return (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-center space-y-2">
                        <div className="text-3xl">💨</div>
                        <div className="text-sm text-red-300">Atmosphere Lost</div>
                        <div className="text-xs text-gray-400">Mass too low ({planetMass.toFixed(1)} M⊕)</div>
                      </div>
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-red-300/60 rounded-full animate-pulse"
                          style={{
                            left: `${15 + i * 10}%`,
                            top: `${25 + (i % 4) * 12}%`,
                            animationDelay: `${i * 0.2}s`
                          }}
                        />
                      ))}
                    </div>
                  );
                } else if (effectivePressure < 0.8) {
                  // Pressure too low - water boils
                  return (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-center space-y-2">
                        <div className="text-3xl">💨</div>
                        <div className="text-sm text-red-300">Water Boiling Away</div>
                        <div className="text-xs text-gray-400">Pressure too low ({effectivePressure.toFixed(2)} atm)</div>
                      </div>
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-red-300/60 rounded-full animate-pulse"
                          style={{
                            left: `${15 + i * 10}%`,
                            top: `${25 + (i % 4) * 12}%`,
                            animationDelay: `${i * 0.2}s`
                          }}
                        />
                      ))}
                    </div>
                  );
                } else if (temperature < -10) {
                  // Too cold - water freezes
                  return (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-center space-y-2">
                        <div className="text-3xl">🧊</div>
                        <div className="text-sm text-cyan-300">Water Frozen</div>
                        <div className="text-xs text-gray-400">Too cold ({temperature.toFixed(0)}°C)</div>
                      </div>
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 bg-cyan-300/60 rounded-sm rotate-45"
                          style={{
                            left: `${20 + i * 15}%`,
                            top: `${40 + (i % 2) * 20}%`,
                          }}
                        />
                      ))}
                    </div>
                  );
                } else if (effectivePressure > 1.2) {
                  // Pressure too high - crushing
                  return (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-blue-800/30 to-blue-950/60">
                      <div className="text-center space-y-2">
                        <div className="text-3xl">🌊</div>
                        <div className="text-sm text-blue-300">Crushing Pressure</div>
                        <div className="text-xs text-gray-400">
                          Like {Math.round((atmosphericPressure - 1) * 10)}m underwater
                        </div>
                      </div>
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-full h-0.5 bg-blue-400/30"
                          style={{ top: `${25 + i * 15}%` }}
                        />
                      ))}
                    </div>
                  );
                } else {
                  // Optimal conditions - stable liquid water
                  return (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-center space-y-2">
                        <div className="text-3xl">💧</div>
                        <div className="text-sm text-blue-300">Liquid Water Stable</div>
                        <div className="text-xs text-gray-400">Optimal conditions ({temperature.toFixed(0)}°C)</div>
                      </div>
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
                  );
                }
              })()}
              
              {/* Environmental readings */}
              <div className="absolute bottom-2 right-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                <div>{atmosphericPressure.toFixed(1)} atm</div>
                <div>{((278 / Math.sqrt(orbitalDistance)) - 273).toFixed(0)}°C</div>
                <div>Mass: {planetMass.toFixed(1)} M⊕</div>
              </div>
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> Water state affected by orbital distance (temperature), planet mass (atmosphere retention), and atmospheric pressure.</p>
                  <p><strong>Try different pressures:</strong> Low (&lt;0.2 atm) → water boils, High (&gt;2.5 atm) → crushing pressure, Optimal (0.2-2.5 atm) → stable water.</p>
                  <p><strong>Multiple factors:</strong> Hot planets (&gt;100°C), low mass (&lt;0.3 M⊕), or extreme pressure all prevent liquid water.</p>
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
            <div className="h-48 bg-gradient-to-b from-purple-900/20 to-black/40 rounded-lg relative overflow-hidden flex items-center justify-center">
              {/* Magnetic Field Visualization */}
              
              {/* Earth in the center - always present */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-400 relative">
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
                  <div className="absolute top-4 left-4 right-4 text-center">
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
                  <div className="absolute top-4 left-4 right-4 text-center">
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
                  <div className="absolute top-4 left-4 right-4 text-center">
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
                {(magneticField * 50).toFixed(0)} μT
              </div>
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> Magnetic field visualization showing how planetary magnetism protects against solar radiation.</p>
                  <p><strong>Weak field (&lt;15 μT):</strong> Solar wind strips atmosphere away like Mars - no protection from harmful radiation.</p>
                  <p><strong>Strong field (&gt;75 μT):</strong> Creates dangerous radiation belts that would harm surface life.</p>
                  <p><strong>Optimal range (15-75 μT):</strong> Earth's ~50 μT field provides protection without creating hazardous radiation zones.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
