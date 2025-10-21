'use client';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Slider } from '../../ui/slider'

// Complexity Evolution Visualization
function ComplexityEvolution({ selectionPressure, mutationRate, environmentalStability, timeDepth }: {
  selectionPressure: number;
  mutationRate: number;
  environmentalStability: number;
  timeDepth: number;
}) {
  const complexityLevels = [
    { name: 'Molecules', threshold: 0.1, color: 'rgba(100, 255, 100, 0.8)' },
    { name: 'Cells', threshold: 0.3, color: 'rgba(100, 200, 255, 0.8)' },
    { name: 'Multicellular', threshold: 0.5, color: 'rgba(255, 200, 100, 0.8)' },
    { name: 'Neural Networks', threshold: 0.7, color: 'rgba(255, 150, 255, 0.8)' },
    { name: 'Intelligence', threshold: 0.85, color: 'rgba(255, 100, 100, 0.8)' },
  ];

  const evolutionSpeed = selectionPressure * mutationRate * environmentalStability * timeDepth;
  const maxComplexity = Math.min(1, evolutionSpeed * 1.2);
  
  const getCurrentLevel = () => {
    for (let i = complexityLevels.length - 1; i >= 0; i--) {
      if (maxComplexity >= complexityLevels[i].threshold) {
        return complexityLevels[i].name;
      }
    }
    return 'Simple Chemistry';
  };

  return (
    <div className="relative w-full h-48 flex items-center justify-center overflow-hidden bg-black/30 rounded-lg">
      <div className="text-center">
        <div className="text-3xl mb-2">🧠</div>
        <div className="text-sm text-gray-300 mb-1">Current Level</div>
        <div className="text-lg font-bold text-white mb-2">
          {getCurrentLevel()}
        </div>
        
        {/* Complexity progress bar */}
        <div className="w-48 h-4 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-400 via-blue-400 via-yellow-400 via-purple-400 to-red-400 transition-all duration-500"
            style={{ width: `${maxComplexity * 100}%` }}
          />
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {(maxComplexity * 100).toFixed(0)}% Complexity
        </div>
      </div>
    </div>
  )
}

export default function ComplexitySection({ 
  educatorMode, 
  cosmicTime = 0
}: { 
  educatorMode: boolean; 
  cosmicTime?: number;
}) {
  const [selectionPressure, setSelectionPressure] = useState(0.5)
  const [mutationRate, setMutationRate] = useState(0.5)
  const [environmentalStability, setEnvironmentalStability] = useState(0.5)
  const [timeDepth, setTimeDepth] = useState(0.5)

  useEffect(() => {
    const handleRandomize = () => {
      setSelectionPressure(Math.random())
      setMutationRate(Math.random())
      setEnvironmentalStability(Math.random())
      setTimeDepth(Math.random())
    }

    window.addEventListener('randomizeUniverse', handleRandomize)
    return () => window.removeEventListener('randomizeUniverse', handleRandomize)
  }, [])

  return (
    <div className="container mx-auto px-4">
      {/* Header Section */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-white">Complexity & Consciousness</h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          The arrow of time drives increasing complexity through evolution, from simple molecules to intelligence and consciousness.
        </p>
      </div>

      {/* Primary Controls - Balanced Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
        {/* Selection Pressure */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Selection Pressure</CardTitle>
            <CardDescription className="text-gray-300">
              Environmental challenges driving adaptation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ComplexityEvolution 
              selectionPressure={selectionPressure}
              mutationRate={mutationRate}
              environmentalStability={environmentalStability}
              timeDepth={timeDepth}
            />
            <div className="relative mt-4">
              <Slider
                value={[selectionPressure]}
                onValueChange={(value) => setSelectionPressure(value[0])}
                max={1}
                min={0}
                step={0.01}
                className="w-full"
              />
              <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                   style={{
                     left: `${((0.3 - 0) / (1 - 0)) * 100}%`,
                     width: `${((0.8 - 0.3) / (1 - 0)) * 100}%`
                   }}></div>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-4">
              <span>Too Weak</span>
              <span className="text-green-400 font-bold">30-80% (optimal)</span>
              <span className="text-white font-medium">{(selectionPressure * 100).toFixed(0)}%</span>
              <span>Too Strong</span>
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> Complexity evolution indicator showing progression from molecules to intelligence based on evolutionary parameters.</p>
                  <p><strong>Selection balance:</strong> Need 30-80% pressure - enough to drive adaptation, not so much that it prevents complex traits from developing.</p>
                  <p><strong>Evolutionary arms race:</strong> Moderate selection pressure creates competition that drives innovation in survival strategies and cognitive abilities.</p>
                  <p><strong>Complexity threshold:</strong> Too little pressure = no evolution, too much = extinction before complexity can emerge.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mutation Rate */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Mutation Rate</CardTitle>
            <CardDescription className="text-gray-300">
              Genetic variation and evolutionary innovation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-black/30 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🧬</div>
                <div className="text-sm text-gray-300">Mutation Rate</div>
                <div className="text-lg font-bold text-white">{(mutationRate * 100).toFixed(1)}%</div>
              </div>
            </div>
            <div className="relative">
              <Slider
                value={[mutationRate]}
                onValueChange={(value) => setMutationRate(value[0])}
                max={1}
                min={0}
                step={0.01}
                className="w-full"
              />
              <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                   style={{
                     left: `${((0.2 - 0) / (1 - 0)) * 100}%`,
                     width: `${((0.7 - 0.2) / (1 - 0)) * 100}%`
                   }}></div>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-4">
              <span>Too Low</span>
              <span className="text-green-400 font-bold">20-70% (innovative)</span>
              <span className="text-white font-medium">{(mutationRate * 100).toFixed(1)}%</span>
              <span>Too High</span>
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> Mutation rate percentage showing the balance between genetic stability and evolutionary innovation.</p>
                  <p><strong>Innovation engine:</strong> Need 20-70% mutation rate for optimal evolution - enough variation to explore new solutions, not so much that beneficial traits are lost.</p>
                  <p><strong>Error threshold:</strong> Too high mutation rate crosses the "error catastrophe" threshold where genetic information cannot be maintained.</p>
                  <p><strong>Evolutionary computation:</strong> Life uses the same principles as genetic algorithms - mutation, selection, and reproduction drive optimization.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Environmental Stability */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Environmental Stability</CardTitle>
            <CardDescription className="text-gray-300">
              Climate consistency enabling complex evolution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-black/30 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🌍</div>
                <div className="text-sm text-gray-300">Stability</div>
                <div className="text-lg font-bold text-white">{(environmentalStability * 100).toFixed(0)}%</div>
              </div>
            </div>
            <div className="relative">
              <Slider
                value={[environmentalStability]}
                onValueChange={(value) => setEnvironmentalStability(value[0])}
                max={1}
                min={0}
                step={0.01}
                className="w-full"
              />
              <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                   style={{
                     left: `${((0.4 - 0) / (1 - 0)) * 100}%`,
                     width: `${((0.9 - 0.4) / (1 - 0)) * 100}%`
                   }}></div>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-4">
              <span>Chaotic</span>
              <span className="text-green-400 font-bold">40-90% (stable)</span>
              <span className="text-white font-medium">{(environmentalStability * 100).toFixed(0)}%</span>
              <span>Static</span>
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> Environmental stability percentage showing how consistent conditions are over evolutionary timescales.</p>
                  <p><strong>Stability paradox:</strong> Need 40-90% stability - enough consistency for complex traits to develop, some change to drive adaptation.</p>
                  <p><strong>Mass extinctions:</strong> Too much instability resets complexity to simple forms, while perfect stability prevents evolutionary innovation.</p>
                  <p><strong>Goldilocks planet:</strong> Earth's stable climate, protected by magnetic field and large moon, enabled 4 billion years of continuous evolution.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time Depth */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Time Depth</CardTitle>
            <CardDescription className="text-gray-300">
              Duration available for evolutionary complexity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-black/30 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-2xl mb-2">⏳</div>
                <div className="text-sm text-gray-300">Time Available</div>
                <div className="text-lg font-bold text-white">
                  {timeDepth < 0.2 ? '100M years' : 
                   timeDepth < 0.4 ? '500M years' : 
                   timeDepth < 0.6 ? '1B years' : 
                   timeDepth < 0.8 ? '3B years' : 
                   '4B+ years'}
                </div>
              </div>
            </div>
            <div className="relative">
              <Slider
                value={[timeDepth]}
                onValueChange={(value) => setTimeDepth(value[0])}
                max={1}
                min={0}
                step={0.01}
                className="w-full"
              />
              <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                   style={{
                     left: `${((0.6 - 0) / (1 - 0)) * 100}%`,
                     width: `${((1.0 - 0.6) / (1 - 0)) * 100}%`
                   }}></div>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-4">
              <span>Too Short</span>
              <span className="text-green-400 font-bold">1B-4B+ years (deep time)</span>
              <span className="text-white font-medium">
                {timeDepth < 0.2 ? '100M' : 
                 timeDepth < 0.4 ? '500M' : 
                 timeDepth < 0.6 ? '1B' : 
                 timeDepth < 0.8 ? '3B' : 
                 '4B+'} years
              </span>
              <span>Ample</span>
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> Deep time duration showing how long evolution has to build complexity from simple beginnings.</p>
                  <p><strong>Deep time requirement:</strong> Need 1B-4B+ years for intelligence to evolve - complexity builds incrementally over geological timescales.</p>
                  <p><strong>Earth's timeline:</strong> Life: 3.8Ga, multicellular: 1Ga, animals: 600Ma, intelligence: 200ka - each step took hundreds of millions of years.</p>
                  <p><strong>Complexity ceiling:</strong> Without sufficient time depth, evolution plateaus at simple multicellular life before intelligence can emerge.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
