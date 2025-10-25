'use client';

import { useState, useEffect } from 'react'
import { Slider } from '../../ui/slider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Info } from 'lucide-react'
import { SimplePenroseVisual, SimpleDarkEnergyVisual, SimpleFlatnessVisual, SimpleHorizonVisual } from './SimpleImprobabilityVisuals'

// Entropy Visualization - Shows order vs chaos with organized vs scattered particles
function EntropyVisual({ entropy }: { entropy: number }) {
  const [particles, setParticles] = useState<Array<{x: number, y: number, duration: number}>>([]);
  const particleCount = 20;
  const orderLevel = Math.max(0, 2 - entropy); // Higher entropy = less order
  
  useEffect(() => {
    // Generate particles only on client side to avoid hydration mismatch
    const newParticles = Array.from({ length: particleCount }).map((_, i) => {
      const angle = (i / particleCount) * 2 * Math.PI;
      const radius = orderLevel > 0.5 ? 60 + (Math.random() - 0.5) * 20 * (2 - orderLevel) : Math.random() * 80;
      const x = orderLevel > 0.5 ? Math.cos(angle) * radius : (Math.random() - 0.5) * 160;
      const y = orderLevel > 0.5 ? Math.sin(angle) * radius : (Math.random() - 0.5) * 160;
      
      return {
        x,
        y,
        duration: 2 + Math.random()
      };
    });
    setParticles(newParticles);
  }, [entropy, orderLevel]);
  
  return (
    <div className="relative w-full h-full bg-black/30 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-48 h-48">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full"
              style={{
                left: `calc(50% + ${particle.x}px)`,
                top: `calc(50% + ${particle.y}px)`,
                opacity: 0.8,
                animationName: 'float',
                animationDuration: `${particle.duration}s`,
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      </div>
      <div className="absolute bottom-2 left-2 text-xs text-white/70">
        {entropy < 1 ? 'Highly Ordered' : entropy < 3 ? 'Moderate Order' : 'High Entropy (Chaos)'}
      </div>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

// Expansion Visualization - Shows universe expanding with galaxies moving apart
function ExpansionVisual({ expansionRate }: { expansionRate: number }) {
  const galaxyCount = 8;
  const expansionSpeed = expansionRate * 0.5;
  
  return (
    <div className="relative w-full h-full bg-black/30 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-48 h-48">
          {Array.from({ length: galaxyCount }).map((_, i) => {
            const angle = (i / galaxyCount) * 2 * Math.PI;
            const baseRadius = 40;
            const expandedRadius = baseRadius + (expansionSpeed * 30);
            const x = Math.cos(angle) * expandedRadius;
            const y = Math.sin(angle) * expandedRadius;
            
            return (
              <div
                key={i}
                className="absolute w-3 h-3 bg-yellow-400 rounded-full"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  animation: `expand ${3 / (expansionRate + 0.1)}s ease-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                  boxShadow: '0 0 8px rgba(255, 255, 0, 0.5)'
                }}
              />
            );
          })}
          {/* Central reference point */}
          <div className="absolute w-2 h-2 bg-red-500 rounded-full" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
        </div>
      </div>
      <div className="absolute bottom-2 left-2 text-xs text-white/70">
        {expansionRate < 0.3 ? 'Slow Expansion' : expansionRate < 1 ? 'Moderate Expansion' : 'Rapid Expansion'}
      </div>
      <style jsx>{`
        @keyframes expand {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.2); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

// Density Fluctuations Visualization - Shows quantum ripples in space
function DensityFluctuationsVisual({ densityFluctuations }: { densityFluctuations: number }) {
  const [tiles, setTiles] = useState<Array<{brightness: number, animationSpeed: number, delay: number}>>([]);
  const rippleIntensity = densityFluctuations * 100;
  // Animation speed decreases with more fluctuations - more chaotic = faster ripples
  const baseAnimationSpeed = Math.max(0.5, 2 - (densityFluctuations * 1.5));
  
  useEffect(() => {
    // Generate tile properties only on client side to avoid hydration mismatch
    const newTiles = Array.from({ length: 48 }).map((_, i) => {
      // Add deterministic randomness based on index to make each tile unique
      const randomOffset = (i * 1.7 + Math.sin(i * 2.3) * 3);
      const spatialPhase = randomOffset;
      const fluctuation = (Math.sin(spatialPhase) * densityFluctuations * 0.5) + 0.5;
      const brightness = Math.max(0.1, Math.min(1, fluctuation));
      
      // Add variation to animation speed for each tile
      const tileAnimationSpeed = baseAnimationSpeed + (Math.sin(i * 1.5) * 0.3);
      const randomDelay = (i * 0.03 + Math.sin(i * 0.7) * 0.2) % 2;
      
      return {
        brightness,
        animationSpeed: tileAnimationSpeed,
        delay: randomDelay
      };
    });
    setTiles(newTiles);
  }, [densityFluctuations, baseAnimationSpeed]);
  
  return (
    <div className="relative w-full h-full bg-black/30 rounded-lg overflow-hidden">
      <div className="absolute inset-0">
        {/* Background grid representing space */}
        <div className="grid grid-cols-8 grid-rows-6 h-full w-full gap-1 p-2">
          {tiles.map((tile, i) => (
            <div
              key={i}
              className="bg-purple-400 rounded-sm"
              style={{
                opacity: tile.brightness,
                animation: `ripple ${tile.animationSpeed}s ease-in-out infinite`,
                animationDelay: `${tile.delay}s`
              }}
            />
          ))}
        </div>
      </div>
      <div className="absolute bottom-2 left-2 text-xs text-white/70">
        {densityFluctuations < 0.1 ? 'Smooth Space' : densityFluctuations < 0.5 ? 'Quantum Ripples' : 'Strong Fluctuations'}
      </div>
      <style jsx>{`
        @keyframes ripple {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}

// Temperature Uniformity Visualization - Shows CMB temperature map
function TemperatureUniformityVisual({ uniformity }: { uniformity: number }) {
  const [temperatureMap, setTemperatureMap] = useState<Array<{hue: number, saturation: number, lightness: number, duration: number}>>([]);
  // Calculate temperature variation - lower uniformity = more variation
  const temperatureVariation = (1 - uniformity) * 0.001; // Scale to realistic CMB variations
  const baseTemp = 2.725; // CMB temperature in Kelvin
  
  useEffect(() => {
    // Generate temperature map only on client side to avoid hydration mismatch
    const newTemperatureMap = Array.from({ length: 96 }).map((_, i) => {
      // Create temperature variations across the "sky"
      const x = i % 12;
      const y = Math.floor(i / 12);
      
      // Generate realistic CMB-like temperature pattern
      const spatialVariation = Math.sin(x * 0.8) * Math.cos(y * 0.6) * temperatureVariation;
      const randomVariation = (Math.sin(i * 2.1) * Math.cos(i * 1.7)) * temperatureVariation * 0.5;
      const totalVariation = spatialVariation + randomVariation;
      
      const temperature = baseTemp + totalVariation;
      const normalizedTemp = (temperature - (baseTemp - temperatureVariation)) / (2 * temperatureVariation);
      
      // Color mapping: cold (blue) to hot (red) with very subtle variations
      const hue = uniformity > 0.99999 ? 220 : 240 - (normalizedTemp * 60); // Blue to red spectrum
      const saturation = uniformity > 0.99999 ? 20 : Math.min(80, (1 - uniformity) * 8000);
      const lightness = 40 + (normalizedTemp * 20);
      
      // Use deterministic "random" duration based on index
      const duration = 3 + (Math.sin(i * 1.3) + 1) * 1; // 3-5 seconds
      
      return {
        hue,
        saturation,
        lightness,
        duration
      };
    });
    setTemperatureMap(newTemperatureMap);
  }, [uniformity, temperatureVariation]);
  
  return (
    <div className="relative w-full h-full bg-black/30 rounded-lg overflow-hidden">
      <div className="absolute inset-0 p-2">
        {/* CMB Temperature Map - representing the sky */}
        <div className="grid grid-cols-12 grid-rows-8 h-full w-full gap-0.5">
          {temperatureMap.map((temp, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                backgroundColor: `hsl(${temp.hue}, ${temp.saturation}%, ${temp.lightness}%)`,
                opacity: 0.8,
                animation: `tempFlicker ${temp.duration}s ease-in-out infinite`,
                animationDelay: `${i * 0.01}s`
              }}
            />
          ))}
        </div>
        
        {/* Temperature scale indicator */}
        <div className="absolute top-2 right-2 text-xs text-white/80 bg-black/50 p-2 rounded">
          <div className="text-center mb-1">CMB Temp</div>
          <div className="text-center font-mono">
            {uniformity > 0.99999 
              ? '2.725000 K' 
              : `${(baseTemp + (temperatureVariation * 0.5)).toFixed(6)} K`
            }
          </div>
          <div className="text-center text-xs mt-1">
            Δ{uniformity > 0.99999 ? '0' : (temperatureVariation * 1000).toFixed(2)}mK
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-2 left-2 text-xs text-white/70">
        {uniformity > 0.99999 ? 'Perfect Uniformity' : uniformity > 0.9999 ? 'Slight Variations' : 'Large Temperature Differences'}
      </div>
      
      <style jsx>{`
        @keyframes tempFlicker {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}

export default function BeginningSection({ 
  educatorMode, 
  cosmicTime = 0
}: { 
  educatorMode: boolean; 
  cosmicTime?: number;
}) {
  const [entropy, setEntropy] = useState(1)
  const [expansionRate, setExpansionRate] = useState(0.5)
  const [densityFluctuations, setDensityFluctuations] = useState(0.1)
  const [showPenroseInfo, setShowPenroseInfo] = useState(false)
  const [universeOutcome, setUniverseOutcome] = useState('')
  
  // Additional fine-tuning parameters
  const [darkEnergyStrength, setDarkEnergyStrength] = useState(1)
  const [universeDensity, setUniverseDensity] = useState(1)
  const [temperatureUniformity, setTemperatureUniformity] = useState(0.99999)

  useEffect(() => {
    const handleRandomize = () => {
      setEntropy(Math.random() * 10)
      setExpansionRate(Math.random() * 2)
      setDensityFluctuations(Math.random() * 1)
      setDarkEnergyStrength(Math.random() * 2)
      setUniverseDensity(0.5 + Math.random() * 1)
      setTemperatureUniformity(0.9 + Math.random() * 0.1)
    }

    window.addEventListener('randomizeUniverse', handleRandomize)
    return () => window.removeEventListener('randomizeUniverse', handleRandomize)
  }, [])

  useEffect(() => {
    // Enhanced Goldilocks Zone Logic with weighted scoring
    const entropyScore = Math.max(0, 1 - Math.abs(entropy - 1) / 2);
    const expansionScore = Math.max(0, 1 - Math.abs(expansionRate - 0.7) / 0.5);
    const fluctuationScore = Math.max(0, 1 - Math.abs(densityFluctuations - 0.2) / 0.3);
    
    // Cross-parameter interactions
    const effectiveExpansionRate = expansionRate * (1 + (entropy - 1) * 0.1);
    const effectiveDensityFluctuations = densityFluctuations * Math.sqrt(entropy);
    const temperatureEffect = Math.exp(-effectiveExpansionRate) * (2 - entropy);
    
    // Compound scoring with realistic parameter coupling
    const totalScore = (entropyScore * 0.4) + (expansionScore * 0.35) + (fluctuationScore * 0.25);
    const cosmicComplexity = entropyScore * expansionScore * fluctuationScore;
    const structureFormationProbability = Math.pow(cosmicComplexity, 0.7);
    
    let outcome = '';
    
    // Graduated outcomes based on total score
    if (totalScore > 0.85) {
      outcome = '✨ Perfect conditions - complex structures flourish!'
    } else if (totalScore > 0.65) {
      outcome = '🌟 Excellent - life and galaxies likely to emerge'
    } else if (totalScore > 0.45) {
      outcome = '⚠️ Marginal - simple structures possible, life uncertain'
    } else if (totalScore > 0.25) {
      outcome = '❌ Poor conditions - mostly sterile universe'
    } else if (entropy > 7) {
      outcome = '🌀 Maximum entropy - complete thermal death'
    } else if (effectiveExpansionRate > 2) {
      outcome = '💨 Runaway expansion - matter tears apart instantly'
    } else if (effectiveExpansionRate < 0.1) {
      outcome = '💥 Big Crunch - universe collapses in seconds'
    } else if (effectiveDensityFluctuations > 1.5) {
      outcome = '🕳️ Quantum chaos - black holes dominate everything'
    } else {
      outcome = '💀 Catastrophic failure - universe cannot form atoms'
    }
    
    setUniverseOutcome(outcome)
  }, [entropy, expansionRate, densityFluctuations])

  return (
    <div className="container mx-auto px-4">
      {/* Main Visualization - Full Width */}
      <div className="mb-12">
        {/* Visualization */}
        <div className="relative">
          <Card className="bg-black/20 border-white/10 text-white">
            <CardHeader>
              <CardTitle className="text-white">The Primordial Universe</CardTitle>
              <CardDescription className="text-gray-300">
                Three fundamental aspects that determined the fate of our universe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-semibold text-white text-center">Initial Entropy</h4>
                  <div className="h-64 sm:h-48 md:h-64">
                    <EntropyVisual entropy={entropy} />
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-semibold text-white text-center">Expansion Rate</h4>
                  <div className="h-64 sm:h-48 md:h-64">
                    <ExpansionVisual expansionRate={expansionRate} />
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm sm:text-base font-semibold text-white text-center">Density Fluctuations</h4>
                  <div className="h-64 sm:h-48 md:h-64">
                    <DensityFluctuationsVisual densityFluctuations={densityFluctuations} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Primary Controls - Balanced Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">

          {/* Initial Entropy Control */}
          <Card className="bg-black/20 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Initial Entropy (Order vs Chaos)</CardTitle>
                <button
                  onClick={() => setShowPenroseInfo(!showPenroseInfo)}
                  className="text-orange-400 hover:text-orange-300"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
              <CardDescription className="text-gray-300">
                How organized was the universe at the beginning? The fundamental measure of cosmic order vs chaos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Slider
                    value={[entropy]}
                    onValueChange={(value) => setEntropy(value[0])}
                    max={10}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                  {/* Optimal range indicator */}
                  <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                       style={{
                         left: `${((0.5 - 0.1) / (10 - 0.1)) * 100}%`,
                         width: `${((1.5 - 0.5) / (10 - 0.1)) * 100}%`
                       }}></div>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Perfect Order</span>
                  <span className="text-green-400 font-bold">0.5-1.5 S/k (optimal)</span>
                  <span className="text-white font-medium">{entropy.toFixed(1)} S/k</span>
                  <span>Maximum Chaos</span>
                </div>
              </div>
              
              {showPenroseInfo && (
                <div className="mt-4 p-3 bg-orange-900/30 border border-orange-500/30 rounded-lg">
                  <p className="text-xs text-orange-200">
                    <strong>Penrose's Calculation:</strong> The odds of our universe's low-entropy state 
                    were 1 in 10^(10^123) - a number so small it defies comprehension. This extraordinary 
                    fine-tuning is what allows structure to emerge from chaos.
                  </p>
                </div>
              )}
              
              {educatorMode && (
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="text-xs text-blue-200 space-y-2">
                    <p><strong>What you're seeing:</strong> Blue particles show order (organized circle) vs chaos (scattered randomly). This visualizes how entropy affects cosmic structure.</p>
                    <p><strong>The fundamental problem:</strong> The universe began in an impossibly low-entropy state - the odds were 1 in 10^(10^123). Imagine throwing a deck of cards and having them land in perfect order every time.</p>
                    <p><strong>Why this matters for life:</strong> This initial order allowed gravity to clump matter into stars, galaxies, and eventually us. Without this precise initial state, the universe would be a uniform, lifeless soup of particles.</p>
                    <p><strong>The fine-tuning challenge:</strong> Each parameter requires extraordinary precision for a life-permitting universe. The interactive slider demonstrates how narrow the "Goldilocks zone" really is.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expansion Rate Control */}
          <Card className="bg-black/20 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Expansion Rate (Hubble Constant)</CardTitle>
              <CardDescription className="text-gray-300">
                How fast the universe expands after the Big Bang
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Slider
                    value={[expansionRate]}
                    onValueChange={(value) => setExpansionRate(value[0])}
                    max={2}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                  {/* Optimal range indicator */}
                  <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                       style={{
                         left: `${((0.5 - 0.1) / (2 - 0.1)) * 100}%`,
                         width: `${((0.9 - 0.5) / (2 - 0.1)) * 100}%`
                       }}></div>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Too Slow</span>
                  <span className="text-green-400 font-bold">50-90 km/s/Mpc (optimal)</span>
                  <span className="text-white font-medium">{(expansionRate * 100).toFixed(0)} km/s/Mpc</span>
                  <span>Too Fast</span>
                </div>
              </div>
              
              {educatorMode && (
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="text-xs text-blue-200 space-y-2">
                    <p><strong>What you're seeing:</strong> Yellow galaxies move away from the red center point at different speeds, visualizing cosmic expansion at various rates.</p>
                    <p><strong>The Hubble constant:</strong> Measures how fast space itself expands (~70 km/s/Mpc). Think of a balloon inflating - every point moves away from every other point.</p>
                    <p><strong>Fine-tuning precision:</strong> The expansion rate is fine-tuned to 1 part in 10^55 for structure formation. Too slow = Big Crunch before stars form. Too fast = matter torn apart before gravity can work.</p>
                    <p><strong>Cosmological mystery:</strong> We can measure this precisely, but don't understand why it has exactly the value needed for complexity to emerge. This remains one of the deepest mysteries in cosmology.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Density Fluctuations Control */}
          <Card className="bg-black/20 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Density Fluctuations</CardTitle>
              <CardDescription className="text-gray-300">
                Quantum ripples that seed all future structures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Slider
                    value={[densityFluctuations]}
                    onValueChange={(value) => setDensityFluctuations(value[0])}
                    max={1}
                    min={0}
                    step={0.01}
                    className="w-full"
                  />
                  {/* Optimal range indicator */}
                  <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                       style={{
                         left: `${((0.1 - 0) / (1 - 0)) * 100}%`,
                         width: `${((0.3 - 0.1) / (1 - 0)) * 100}%`
                       }}></div>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Perfectly Smooth</span>
                  <span className="text-green-400 font-bold">10⁻⁵-10⁻⁴ δρ/ρ (optimal)</span>
                  <span className="text-white font-medium">{(densityFluctuations * 0.0001).toExponential(1)} δρ/ρ</span>
                  <span>Highly Chaotic</span>
                </div>
              </div>
              
              {educatorMode && (
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="text-xs text-blue-200 space-y-2">
                    <p><strong>What you're seeing:</strong> Purple grid cells pulse to show quantum ripples in spacetime - the tiny density variations that seeded all cosmic structures.</p>
                    <p><strong>Quantum seeds of structure:</strong> These ripples at the 10⁻⁵ scale (δρ/ρ) were microscopic variations in the early universe - like 1mm bumps across a football stadium.</p>
                    <p><strong>Critical for everything:</strong> Without these quantum fluctuations, the universe would remain perfectly uniform forever - no stars, galaxies, planets, or life. Gravity needs something to grab onto.</p>
                    <p><strong>Goldilocks precision:</strong> Too small = gravity never overcomes expansion. Too large = universe collapses into black holes before stars form. The working range is extraordinarily narrow.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

      </div>

      {/* Fine-Tuning Parameters Section */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-3 text-white">Cosmic Fine-Tuning Parameters</h3>
          <p className="text-gray-300 max-w-2xl mx-auto">
            These fundamental constants must be precisely calibrated for a universe capable of complexity and life.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            

            {/* Dark Energy Strength */}
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Dark Energy Strength</CardTitle>
                <CardDescription className="text-gray-300">
                  How strong is the force pushing the universe apart?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-48 bg-black/30 rounded-lg overflow-hidden">
                    <SimpleDarkEnergyVisual lambda={darkEnergyStrength} />
                  </div>
                  <div className="relative">
                    <Slider
                      value={[darkEnergyStrength]}
                      onValueChange={(value) => setDarkEnergyStrength(value[0])}
                      max={2}
                      min={0}
                      step={0.01}
                      className="w-full"
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                         style={{
                           left: `${((0.8 - 0) / (2 - 0)) * 100}%`,
                           width: `${((1.2 - 0.8) / (2 - 0)) * 100}%`
                         }}></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Too Weak</span>
                    <span className="text-green-400 font-bold">0.8-1.2 Λ (optimal)</span>
                    <span className="text-white font-medium">{darkEnergyStrength.toFixed(2)} Λ</span>
                    <span>Too Strong</span>
                  </div>
                </div>
                
                {educatorMode && (
                  <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <div className="text-xs text-blue-200 space-y-2">
                      <p><strong>The cosmological constant problem:</strong> Dark energy (Λ) is off by 120 orders of magnitude from quantum theory predictions - the worst prediction in physics history.</p>
                      <p><strong>What's dark energy?</strong> An invisible force pushing everything apart, like tiny springs between all matter. It makes up ~68% of the universe but we don't understand it.</p>
                      <p><strong>Fine-tuning mystery:</strong> If dark energy were slightly stronger, the universe would expand too fast for galaxies to form. Slightly weaker, and it would collapse before stars could shine.</p>
                      <p><strong>Theoretical crisis:</strong> Our best theories predict dark energy should be 10^120 times stronger than observed. This remains one of physics' greatest unsolved problems.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Universe Shape */}
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Universe Shape</CardTitle>
                <CardDescription className="text-gray-300">
                  How much matter determines the geometry of space
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-48 bg-black/30 rounded-lg overflow-hidden">
                    <SimpleFlatnessVisual density={universeDensity} />
                  </div>
                  <div className="relative">
                    <Slider
                      value={[universeDensity]}
                      onValueChange={(value) => setUniverseDensity(value[0])}
                      max={1.5}
                      min={0.5}
                      step={0.001}
                      className="w-full"
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                         style={{
                           left: `${((0.99 - 0.5) / (1.5 - 0.5)) * 100}%`,
                           width: `${((1.01 - 0.99) / (1.5 - 0.5)) * 100}%`
                         }}></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Too Little</span>
                    <span className="text-green-400 font-bold">0.99-1.01 Ω (optimal)</span>
                    <span className="text-white font-medium">{universeDensity.toFixed(3)} Ω</span>
                    <span>Too Much</span>
                  </div>
                </div>
                
                {educatorMode && (
                  <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <div className="text-xs text-blue-200 space-y-2">
                      <p><strong>The flatness problem:</strong> Universe density (Ω) must equal the critical value to 1 part in 10^60 for a flat, life-permitting cosmos.</p>
                      <p><strong>Cosmic geometry:</strong> Like a rubber sheet - too much matter curves it inward (Big Crunch), too little curves it outward (runaway expansion), just right keeps it flat.</p>
                      <p><strong>Precision required:</strong> At the beginning of time, density had to be exactly right to 1 part in 10^60. Like hitting an atom-sized target on a North America-sized dartboard.</p>
                      <p><strong>Why it matters:</strong> Only a flat universe expands at the perfect speed for structure formation. This fine-tuning problem remains a central mystery in cosmology.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Temperature Uniformity */}
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Temperature Uniformity</CardTitle>
                <CardDescription className="text-gray-300">
                  How uniform is the cosmic background temperature?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-48 bg-black/30 rounded-lg overflow-hidden">
                    <TemperatureUniformityVisual uniformity={temperatureUniformity} />
                  </div>
                  <div className="relative">
                    <Slider
                      value={[temperatureUniformity]}
                      onValueChange={(value) => setTemperatureUniformity(value[0])}
                      max={1}
                      min={0.9}
                      step={0.00001}
                      className="w-full"
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                         style={{
                           left: `${((0.99998 - 0.9) / (1 - 0.9)) * 100}%`,
                           width: `${((1 - 0.99998) / (1 - 0.9)) * 100}%`
                         }}></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Very Uneven</span>
                    <span className="text-green-400 font-bold">2.725±0.00005 K (optimal)</span>
                    <span className="text-white font-medium">{(2.725 + (1-temperatureUniformity) * 0.0001).toFixed(6)} K</span>
                    <span>Perfect</span>
                  </div>
                </div>
                
                {educatorMode && (
                  <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <div className="text-xs text-blue-200 space-y-2">
                      <p><strong>CMB temperature map:</strong> Shows variations from the perfect 2.725K uniformity - tiny fluctuations that reveal the universe's quantum origins.</p>
                      <p><strong>The horizon problem:</strong> Regions of space now on opposite sides of the sky were never close enough to "communicate" and agree on the same temperature, yet they match perfectly.</p>
                      <p><strong>Incredible precision:</strong> The cosmic microwave background varies by only 1 part in 100,000 across the entire observable universe - impossibly uniform without inflation.</p>
                      <p><strong>Fine-tuning insight:</strong> This uniformity, combined with the tiny variations that seeded structure, represents another extraordinary cosmic coincidence that enabled complexity to emerge.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

        </div>
      </div>

      </div>
    </div>
  )
}
