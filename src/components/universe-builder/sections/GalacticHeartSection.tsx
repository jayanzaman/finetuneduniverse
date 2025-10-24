'use client';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Slider } from '../../ui/slider'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Galaxy Evolution Data
const galaxyPhases = [
  {
    id: 0,
    name: "Pre-Galactic Era",
    age: "13.8-13.6 billion years ago",
    image: null, // No image - empty space
    description: "The universe before galaxies existed",
    details: "In the earliest epochs after the Big Bang, the universe was a nearly uniform sea of hydrogen and helium gas. No stars, no galaxies, no structure - just the cosmic microwave background and tiny density fluctuations that would eventually seed galaxy formation.",
    fineTuning: "The universe needed to cool to exactly the right temperature and achieve the perfect balance of matter density. Too hot and gas couldn't clump; too cold and nuclear processes couldn't begin when stars finally formed."
  },
  {
    id: 1,
    name: "Proto-Galaxy Formation",
    age: "13.6 billion years ago",
    image: "/1. Proto-Galaxy Formation.png",
    description: "Dark matter halo collapse and first gas accretion",
    details: "The Milky Way begins as a chaotic cloud of dark matter and gas. Gravity pulls material together, but there's no organized structure yet. This phase was crucial for gathering the raw materials needed to build our galaxy.",
    fineTuning: "If dark matter hadn't clumped at exactly the right rate, galaxies would never have formed. Too fast and everything would collapse into black holes; too slow and matter would remain forever dispersed."
  },
  {
    id: 2,
    name: "Starburst Phase", 
    age: "12-10 billion years ago",
    image: "/2. Starburst Phase.png",
    description: "Intense star formation and heavy element creation",
    details: "Massive bursts of star formation create the first heavy elements through nuclear fusion. These early stars live fast and die young, enriching the galaxy with carbon, oxygen, and iron - elements essential for planets and life.",
    fineTuning: "The star formation rate had to be perfectly balanced. Too intense and it would consume all gas too quickly; too weak and insufficient heavy elements would form for rocky planets."
  },
  {
    id: 3,
    name: "Quasar Phase",
    age: "10-8 billion years ago", 
    image: "/3. Quasar Phase.png",
    description: "Active galactic nucleus with powerful jets",
    details: "The central supermassive black hole becomes extremely active, shooting powerful jets of energy across the galaxy. This phase regulates star formation and prevents the galaxy from growing too large.",
    fineTuning: "The quasar phase had to end at precisely the right time. Too long and it would sterilize the entire galaxy; too short and the galaxy would become overcrowded with stars, disrupting planetary orbits."
  },
  {
    id: 4,
    name: "Early Spiral Formation",
    age: "8-4 billion years ago",
    image: "/4. Early Spiral Formation.png", 
    description: "Spiral arms begin to form and stabilize",
    details: "The galaxy settles into a rotating disk with emerging spiral arms. Star formation becomes more organized, creating the beautiful spiral pattern we see today. The galactic ecosystem begins to stabilize.",
    fineTuning: "Spiral arm formation required precise rotational dynamics. Without the right balance of gravity and rotation, we'd have either a chaotic irregular galaxy or a featureless elliptical - neither ideal for life."
  },
  {
    id: 5,
    name: "Modern Milky Way",
    age: "Present day",
    image: "/Milkyway Galaxy Formation - Nature.jpg",
    description: "Mature spiral galaxy with stable star formation",
    details: "Today's Milky Way represents the perfect balance - a stable spiral galaxy with the right metallicity gradients, gas reservoirs, and stellar populations to support billions of planetary systems like ours.",
    fineTuning: "Our current galaxy provides the ideal environment for life: stable orbits, appropriate heavy element abundance, regulated star formation, and protection from cosmic hazards through our location in the galactic suburbs."
  }
];

// Milky Way Evolution Carousel Component
function MilkyWayEvolution({ 
  currentAge,
  educatorMode,
  onAgeChange
}: {
  currentAge: number;
  educatorMode: boolean;
  onAgeChange: (age: number) => void;
}) {
  // Determine galaxy phase based on age
  const getPhaseIndex = (age: number) => {
    if (age > 13.6) return 0;      // Pre-Galactic Era
    if (age > 12.0) return 1;      // Proto-Galaxy Formation
    if (age > 10.0) return 2;      // Starburst Phase  
    if (age > 8.0) return 3;       // Quasar Phase
    if (age > 4.0) return 4;       // Early Spiral Formation
    return 5;                      // Modern Milky Way
  };

  // Get representative age for each phase (middle of the phase range)
  const getPhaseAge = (phaseIndex: number) => {
    switch (phaseIndex) {
      case 0: return 13.7;  // Pre-Galactic Era (13.8-13.6 Gya) -> 13.7
      case 1: return 13.0;  // Proto-Galaxy Formation (13.6-12 Gya) -> 13.0
      case 2: return 11.0;  // Starburst Phase (12-10 Gya) -> 11.0
      case 3: return 9.0;   // Quasar Phase (10-8 Gya) -> 9.0
      case 4: return 6.0;   // Early Spiral Formation (8-4 Gya) -> 6.0
      case 5: return 1.0;   // Modern Milky Way (4-0 Gya) -> 1.0
      default: return 1.0;
    }
  };

  const currentPhase = getPhaseIndex(currentAge);

  const nextPhase = () => {
    const nextPhaseIndex = (currentPhase + 1) % galaxyPhases.length;
    onAgeChange(getPhaseAge(nextPhaseIndex));
  };

  const prevPhase = () => {
    const prevPhaseIndex = (currentPhase - 1 + galaxyPhases.length) % galaxyPhases.length;
    onAgeChange(getPhaseAge(prevPhaseIndex));
  };

  const goToPhase = (phaseIndex: number) => {
    onAgeChange(getPhaseAge(phaseIndex));
  };

  const currentPhaseData = galaxyPhases[currentPhase];

  return (
    <div className="relative w-full bg-black/20 border border-white/10 rounded-lg overflow-hidden">
      {/* Image Carousel */}
      <div className="relative aspect-video bg-black/40">
        {/* Image Container with proper aspect ratio */}
        <div className="absolute inset-0 flex items-center justify-center">
          {currentPhaseData.image ? (
            <img 
              src={currentPhaseData.image}
              alt={currentPhaseData.name}
              className="max-w-full max-h-full object-contain transition-all duration-700 ease-out transform hover:scale-105"
              style={{ filter: 'brightness(1.1) contrast(1.1)' }}
            />
          ) : (
            /* Empty space visualization for Pre-Galactic Era */
            <div className="w-full h-full flex items-center justify-center bg-black/60">
              <div className="text-center space-y-4">
                <div className="w-32 h-32 mx-auto rounded-full bg-black/40 flex items-center justify-center border border-white/20">
                  <div className="text-4xl text-gray-400">∅</div>
                </div>
                <div className="text-gray-300 text-sm font-medium">No Galaxy Structure</div>
                <div className="text-gray-400 text-xs">Primordial gas clouds only</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation Arrows */}
        <button
          onClick={prevPhase}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 border border-white/20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={nextPhase}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 border border-white/20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Phase Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {galaxyPhases.map((_, index) => (
            <button
              key={index}
              onClick={() => goToPhase(index)}
              className={`relative transition-all duration-300 ${
                index === currentPhase 
                  ? 'w-8 h-2 bg-white rounded-full' 
                  : 'w-2 h-2 bg-white/40 hover:bg-white/60 rounded-full'
              }`}
            />
          ))}
        </div>

        {/* Phase Info Card */}
        <div className="absolute top-4 left-4 bg-black/70 rounded-lg p-3 border border-white/20 max-w-xs">
          <h3 className="text-lg font-semibold text-white mb-1">{currentPhaseData.name}</h3>
          <p className="text-sm text-gray-300 mb-1 font-medium">{currentPhaseData.age}</p>
          <p className="text-sm text-gray-300 leading-relaxed">{currentPhaseData.description}</p>
        </div>

        {/* Progress Bar with Timeline Legends */}
        <div className="absolute bottom-0 left-0 right-0">
          {/* Progress Bar */}
          <div className="h-1 bg-white/10">
            <div 
              className="h-full bg-white/60 transition-all duration-700"
              style={{ width: `${((currentPhase + 1) / galaxyPhases.length) * 100}%` }}
            />
          </div>
          
          {/* Timeline Legends */}
          <div className="flex justify-between items-center px-4 py-2 bg-black/40 text-xs">
            <div className="flex flex-col items-start">
              <span className="text-white font-medium">13.8 Gya</span>
              <span className="text-gray-400">Big Bang</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-white font-medium">10 Gya</span>
              <span className="text-gray-400">Active Phase</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-white font-medium">5 Gya</span>
              <span className="text-gray-400">Stabilization</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-white font-medium">Today</span>
              <span className="text-gray-400">Modern Era</span>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Content (Educator Mode) */}
      {educatorMode && (
        <div className="p-4 bg-black/20 border-t border-white/10">
          <div className="space-y-3">
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">What's Happening</h4>
              <p className="text-gray-300 leading-relaxed mb-3">{currentPhaseData.details}</p>
            </div>
            
            <div className="bg-yellow-900/20 border border-yellow-500/30 p-3 rounded-lg">
              <p className="text-yellow-200 font-semibold mb-1">🎯 Fine-Tuning Insight:</p>
              <p className="text-yellow-100 leading-relaxed text-sm">{currentPhaseData.fineTuning}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function GalacticHeartSection({ 
  educatorMode, 
  cosmicTime = 0
}: { 
  educatorMode: boolean; 
  cosmicTime?: number;
}) {
  const [currentGalacticAge, setCurrentGalacticAge] = useState(13.8) // Start at Big Bang

  useEffect(() => {
    const handleRandomize = () => {
      // Reset to random point in galactic history
      setCurrentGalacticAge(Math.random() * 13.8)
    }

    window.addEventListener('randomizeUniverse', handleRandomize)
    return () => window.removeEventListener('randomizeUniverse', handleRandomize)
  }, [])

  return (
    <div className="container mx-auto px-4">
      {/* Single Milky Way Evolution Visualization */}
      <Card className="bg-black/20 border-white/10 mb-8 sm:mb-12">
        <CardHeader>
          <CardTitle className="text-white">Milky Way Evolution</CardTitle>
          <CardDescription className="text-gray-300">
            Explore 13.8 billion years of galactic evolution driven by our central black hole
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MilkyWayEvolution 
            currentAge={currentGalacticAge}
            educatorMode={educatorMode}
            onAgeChange={setCurrentGalacticAge}
          />
        </CardContent>
      </Card>

    </div>
  )
}
