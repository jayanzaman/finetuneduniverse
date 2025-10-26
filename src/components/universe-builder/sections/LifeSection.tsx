'use client';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Slider } from '../../ui/slider'
import { Badge } from '../../ui/badge'

// Geological Timeline Data Structure
const GEOLOGICAL_ERAS = [
  {
    id: 0,
    name: "Hadean Earth",
    timeRange: "4.6–4.0 Ga",
    icon: "🌋",
    description: "Chaos and Chemistry",
    gradient: "from-red-600 to-orange-500",
    context: "Hostile but energetic. The perfect cauldron for prebiotic chemistry.",
    details: "Earth had just formed from a molten mess of colliding planetesimals. The surface was volcanic, the air was thick with CO₂, methane, and ammonia, and asteroids bombarded it constantly. No oxygen yet—just violent chemistry. Oceans condensed as the planet cooled, creating vast 'chemical laboratories.' Lightning, UV radiation, and volcanic gases fueled the reactions that produced amino acids and other organic molecules.",
    keyFeatures: ["Molten surface", "Asteroid bombardment", "No oxygen", "Chemical laboratories", "Volcanic outgassing"],
    lifeforms: ["None - prebiotic chemistry only"],
    atmosphere: { co2: 95, oxygen: 0, methane: 3, nitrogen: 2 },
    temperature: 85, // °C above current
    active: true
  },
  {
    id: 1,
    name: "Archean Earth",
    timeRange: "4.0–2.5 Ga",
    icon: "🦠",
    description: "Microbial World",
    gradient: "from-green-600 to-teal-500",
    context: "Stable oceans, active volcanoes, shallow seas—bacteria's paradise.",
    details: "Oceans dominated the surface; continents were small and scattered. Atmosphere: mostly CO₂, methane, and nitrogen—still oxygen-poor. Hydrothermal vents at mid-ocean ridges spewed mineral-rich fluids, creating ideal conditions for early microbes that fed on chemical energy (chemosynthesis). Around 3.5 billion years ago, photosynthetic cyanobacteria appeared. They began releasing oxygen into the oceans—a quiet revolution.",
    keyFeatures: ["Ocean-dominated world", "Hydrothermal vents", "First life forms", "Cyanobacteria evolution", "Oxygen production begins"],
    lifeforms: ["Prokaryotes", "Cyanobacteria", "Chemosynthetic bacteria"],
    atmosphere: { co2: 80, oxygen: 1, methane: 15, nitrogen: 4 },
    temperature: 15, // °C above current
    active: false
  },
  {
    id: 2,
    name: "Great Oxygenation",
    timeRange: "2.4–2.0 Ga",
    icon: "❄️",
    description: "Snowball Earth",
    gradient: "from-blue-600 to-cyan-500",
    context: "Catastrophe for anaerobes, opportunity for innovation. Cells adapted to oxygen and began evolving more efficient metabolisms.",
    details: "As cyanobacteria filled the seas with oxygen, iron in the oceans rusted—literally—creating banded iron formations still visible today. Eventually, oxygen began accumulating in the atmosphere. Methane, a greenhouse gas, was oxidized, reducing atmospheric warmth and triggering a global freeze: Snowball Earth.",
    keyFeatures: ["Oxygen accumulation", "Banded iron formations", "Global glaciation", "Methane oxidation", "Mass extinction of anaerobes"],
    lifeforms: ["Oxygen-tolerant bacteria", "Early eukaryotes"],
    atmosphere: { co2: 60, oxygen: 15, methane: 5, nitrogen: 20 },
    temperature: -10, // °C below current
    active: false
  },
  {
    id: 3,
    name: "Proterozoic Earth",
    timeRange: "2.0–0.6 Ga",
    icon: "🔬",
    description: "Eukaryotes and Cooperation",
    gradient: "from-purple-600 to-pink-500",
    context: "Alternating feast and famine of oxygen, driving cellular complexity and the rise of multicellularity.",
    details: "Oxygen levels fluctuated but slowly rose. Continental drift formed supercontinents like Rodinia. Eukaryotic cells emerged—symbiotic partnerships that required oxygen. Oceans became more stratified: deep anoxic layers, surface oxygenated ones. Glaciations periodically blanketed the planet again, testing life's resilience.",
    keyFeatures: ["Eukaryotic cells", "Endosymbiosis", "Supercontinent Rodinia", "Ocean stratification", "Periodic glaciations"],
    lifeforms: ["Eukaryotes", "Early multicellular organisms", "Algae"],
    atmosphere: { co2: 40, oxygen: 35, methane: 2, nitrogen: 23 },
    temperature: -5, // °C below current
    active: false
  },
  {
    id: 4,
    name: "Ediacaran-Cambrian",
    timeRange: "600–500 Ma",
    icon: "🐚",
    description: "Oxygen and Explosion",
    gradient: "from-emerald-600 to-green-500",
    context: "Nutrient boom, oxygen surge, evolutionary arms race.",
    details: "The atmosphere stabilized near modern oxygen levels. Ice melted, nutrient-rich runoff fertilized the oceans, and the first multicellular organisms appeared. During the Cambrian Explosion, rising oxygen and tectonic shifts created diverse marine habitats. Animal life experimented wildly with body plans, shells, and eyes.",
    keyFeatures: ["Modern oxygen levels", "Cambrian explosion", "Complex body plans", "First shells and eyes", "Marine diversity boom"],
    lifeforms: ["Ediacaran biota", "Trilobites", "Early arthropods", "First vertebrates"],
    atmosphere: { co2: 25, oxygen: 50, methane: 1, nitrogen: 24 },
    temperature: 5, // °C above current
    active: false
  },
  {
    id: 5,
    name: "Paleozoic Earth",
    timeRange: "500–250 Ma",
    icon: "🌿",
    description: "Life Takes Land",
    gradient: "from-lime-600 to-green-600",
    context: "Greener land, unstable climate, rapid evolution under stress.",
    details: "Plants colonized land first, enriching it with oxygen and stabilizing soils. Insects followed, then amphibians crawled from water. Carbon dioxide dropped, triggering another ice age. Pangea assembled, and deserts spread. Mass extinctions periodically wiped the slate clean.",
    keyFeatures: ["Land colonization", "First forests", "Amphibian evolution", "Pangea formation", "Mass extinctions"],
    lifeforms: ["Land plants", "Insects", "Amphibians", "Early reptiles", "Fish diversity"],
    atmosphere: { co2: 20, oxygen: 55, methane: 1, nitrogen: 24 },
    temperature: -2, // °C below current
    active: false
  },
  {
    id: 6,
    name: "Mesozoic Earth",
    timeRange: "250–66 Ma",
    icon: "🦕",
    description: "Age of Dinosaurs",
    gradient: "from-yellow-600 to-orange-600",
    context: "Greenhouse warmth, continental drift, and sudden catastrophe.",
    details: "After the worst mass extinction, CO₂ rose again. Warm, humid conditions nurtured giant reptiles and lush forests. Continents drifted apart; flowering plants evolved, reshaping ecosystems. Then an asteroid hit—ending the dinosaur age and reshuffling life's hierarchy.",
    keyFeatures: ["Dinosaur dominance", "Flowering plants", "Continental breakup", "Warm climate", "K-Pg extinction"],
    lifeforms: ["Dinosaurs", "Early mammals", "Flowering plants", "Marine reptiles", "Birds"],
    atmosphere: { co2: 30, oxygen: 45, methane: 1, nitrogen: 24 },
    temperature: 8, // °C above current
    active: false
  },
  {
    id: 7,
    name: "Cenozoic Earth",
    timeRange: "66 Ma–present",
    icon: "🐘",
    description: "Age of Mammals",
    gradient: "from-amber-600 to-yellow-500",
    context: "Volatile but moderate. Climate oscillations sculpted intelligence, cooperation, and tool use.",
    details: "After the impact, the planet cooled. Mammals diversified into the niches dinosaurs left empty. Grasslands spread; ice ages came and went. Sea levels fluctuated as glaciers advanced and retreated. By around 3 million years ago, the genus Homo emerged in a shifting climate where adaptability became everything.",
    keyFeatures: ["Mammal radiation", "Grassland expansion", "Ice ages", "Human evolution", "Climate oscillations"],
    lifeforms: ["Mammals", "Birds", "Grasses", "Early humans", "Modern ecosystems"],
    atmosphere: { co2: 15, oxygen: 60, methane: 1, nitrogen: 24 },
    temperature: 0, // Current baseline
    active: false
  },
  {
    id: 8,
    name: "Anthropocene",
    timeRange: "Present",
    icon: "🏭",
    description: "Humans Rework the Planet",
    gradient: "from-gray-600 to-slate-500",
    context: "One species reshaping the evolutionary environment itself.",
    details: "Humans altered the balance faster than any species before: agriculture, industry, urbanization, and now climate change. CO₂ levels are the highest in 3 million years; mass extinctions are accelerating; yet technology allows global awareness and potential stewardship.",
    keyFeatures: ["Human dominance", "Industrial revolution", "Climate change", "Mass extinction", "Global awareness"],
    lifeforms: ["Humans", "Domesticated species", "Urban ecosystems", "Engineered organisms"],
    atmosphere: { co2: 18, oxygen: 57, methane: 1, nitrogen: 24 },
    temperature: 1, // °C above pre-industrial
    active: false
  }
];

// Calculate era durations in millions of years for proportional timeline
const getEraDuration = (era: typeof GEOLOGICAL_ERAS[0]) => {
  const timeRange = era.timeRange;
  
  // Parse time ranges to get durations in millions of years
  if (timeRange === "Present") return 0.01; // Anthropocene is very recent
  if (timeRange === "66 Ma–present") return 66;
  if (timeRange === "250–66 Ma") return 184;
  if (timeRange === "500–250 Ma") return 250;
  if (timeRange === "600–500 Ma") return 100;
  if (timeRange === "2.0–0.6 Ga") return 1400; // 2000-600 = 1400 Ma
  if (timeRange === "2.4–2.0 Ga") return 400;  // 2400-2000 = 400 Ma
  if (timeRange === "4.0–2.5 Ga") return 1500; // 4000-2500 = 1500 Ma
  if (timeRange === "4.6–4.0 Ga") return 600;  // 4600-4000 = 600 Ma
  
  return 100; // fallback
};

// Calculate proportional widths for timeline
const calculateProportionalWidths = () => {
  const durations = GEOLOGICAL_ERAS.map(getEraDuration);
  const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);
  
  return durations.map(duration => ({
    duration,
    percentage: (duration / totalDuration) * 100
  }));
};

// Map era names to image filenames (URL encoded for spaces)
const getEraImagePath = (eraName: string) => {
  const imageMap: { [key: string]: string } = {
    "Hadean Earth": "/Hadean%20Earth.png",
    "Archean Earth": "/Archean%20Earth.png", 
    "Great Oxygenation": "/Great%20Oxygenation.png",
    "Proterozoic Earth": "/Proterozoic%20Earth.png",
    "Ediacaran-Cambrian": "/Ediacaran-Cambrian.png",
    "Paleozoic Earth": "/Paleozoic%20Earth.png",
    "Mesozoic Earth": "/Mesozoic%20Earth.png",
    "Cenozoic Earth": "/Cenozoic%20Earth.png",
    "Anthropocene": "/Cenozoic%20Earth.png" // Use Cenozoic image for Anthropocene
  };
  
  return imageMap[eraName] || "";
};

// Evolution Timeline Carousel Component
function EvolutionCarousel({ selectedEra, onEraSelect }: { selectedEra: number; onEraSelect: (era: number) => void }) {
  const selectedEraData = GEOLOGICAL_ERAS[selectedEra];
  const proportionalWidths = calculateProportionalWidths();
  const backgroundImage = getEraImagePath(selectedEraData.name);
  
  return (
    <div className="relative w-full">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent" 
             style={{
               backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 1px, transparent 1px),
                                radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
               backgroundSize: '30px 30px'
             }} />
      </div>
      
      {/* Main Focus Area - Full Width */}
      <div className="relative z-10">
        {/* Selected Era - Main Display */}
        <div className="w-full">
          <div className={`relative h-80 rounded-2xl overflow-hidden`}
               style={{
                 backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundRepeat: 'no-repeat'
               }}>
            {/* Background overlay for better text readability - only when no image */}
            {!backgroundImage && (
              <div className={`absolute inset-0 bg-gradient-to-br ${selectedEraData.gradient}`} />
            )}
            
            {/* Subtle dark overlay for text readability over images */}
            {backgroundImage && (
              <div className="absolute inset-0 bg-black/20" />
            )}
            
            {/* Enhanced Shimmer Effect */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-shimmer" />
            </div>
            
            {/* Content - Minimal overlay for better image visibility */}
            <div className="relative z-10 h-full flex flex-col justify-end items-start p-6">
              {/* Era Title - Compact bottom overlay */}
              <div className="bg-black/70 px-4 py-2 rounded-lg backdrop-blur-md border border-white/20">
                <h3 className="text-2xl font-bold text-white drop-shadow-lg font-serif">
                  {selectedEraData.name}
                </h3>
                <p className="text-sm text-white/90 font-light">{selectedEraData.timeRange}</p>
              </div>
            </div>
            
            {/* Ring Border */}
            <div className="absolute inset-0 rounded-2xl ring-2 ring-white/30" />
          </div>
        </div>
      </div>
      
      {/* Proportional Geological Timeline */}
      <div className="mt-8 relative">
        {/* Timeline Bar */}
        <div className="flex h-16 rounded-lg overflow-hidden border border-white/20">
          {GEOLOGICAL_ERAS.map((era, index) => {
            const width = proportionalWidths[index];
            const canFitLabel = width.percentage > 8;
            
            return (
              <div
                key={era.id}
                onClick={() => onEraSelect(era.id)}
                className={`relative cursor-pointer transition-all duration-300 hover:brightness-110 ${
                  era.id === selectedEra ? 'ring-2 ring-white/60 brightness-125' : ''
                } bg-gradient-to-br ${era.gradient}`}
                style={{ width: `${width.percentage}%` }}
              >
                {/* Content inside timeline section */}
                {canFitLabel && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
                    <div className="text-xs font-medium text-white drop-shadow-lg truncate w-full px-1 font-serif">
                      {era.name}
                    </div>
                    <div className="text-xs text-white/80 drop-shadow-lg font-light">
                      {era.timeRange}
                    </div>
                  </div>
                )}
                
                {/* Duration indicator */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/30 text-center">
                  <div className="text-xs text-white/90 py-1 font-light">
                    {width.duration >= 1000 ? `${(width.duration/1000).toFixed(1)}Gy` : `${width.duration}Ma`}
                  </div>
                </div>
                
                {/* Selection indicator */}
                {era.id === selectedEra && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Timeline Scale */}
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>4.6 Billion Years Ago</span>
          <span>Present</span>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default function LifeSection({ educatorMode, cosmicTime = 0 }: { educatorMode: boolean; cosmicTime?: number }) {
  const [selectedEra, setSelectedEra] = useState(0)
  const [co2Level, setCo2Level] = useState(50)
  const [oxygenLevel, setOxygenLevel] = useState(20)
  const [temperature, setTemperature] = useState(15)
  const [volcanicActivity, setVolcanicActivity] = useState(70)
  const [outcome, setOutcome] = useState('')

  useEffect(() => {
    const handleRandomize = () => {
      setSelectedEra(Math.floor(Math.random() * GEOLOGICAL_ERAS.length))
      setCo2Level(Math.random() * 100)
      setOxygenLevel(Math.random() * 60)
      setTemperature(-20 + Math.random() * 100)
      setVolcanicActivity(Math.random() * 100)
    }

    window.addEventListener('randomizeUniverse', handleRandomize)
    return () => window.removeEventListener('randomizeUniverse', handleRandomize)
  }, [])

  useEffect(() => {
    // Calculate evolutionary success based on current era and environmental conditions
    const currentEra = GEOLOGICAL_ERAS[selectedEra];
    const idealAtmosphere = currentEra.atmosphere;
    const idealTemp = currentEra.temperature;
    
    // Score based on how close conditions are to the era's optimal values
    const co2Score = Math.max(0, 1 - Math.abs(co2Level - idealAtmosphere.co2) / 50);
    const oxygenScore = Math.max(0, 1 - Math.abs(oxygenLevel - idealAtmosphere.oxygen) / 30);
    const tempScore = Math.max(0, 1 - Math.abs(temperature - idealTemp) / 30);
    const volcanicScore = selectedEra <= 2 ? volcanicActivity / 100 : Math.max(0, 1 - volcanicActivity / 100);
    
    const totalScore = (co2Score * 0.3) + (oxygenScore * 0.3) + (tempScore * 0.25) + (volcanicScore * 0.15);
    
    if (totalScore > 0.85) {
      setOutcome(`✨ Perfect conditions for ${currentEra.name} life forms!`)
    } else if (totalScore > 0.65) {
      setOutcome(`🌟 Good - ${currentEra.description.toLowerCase()} thrives`)
    } else if (totalScore > 0.45) {
      setOutcome(`⚠️ Marginal - some life survives but struggles`)
    } else if (oxygenLevel > 40 && selectedEra <= 1) {
      setOutcome('☠️ Oxygen toxicity - anaerobic life dies')
    } else if (temperature > 60) {
      setOutcome('🔥 Too hot - proteins denature, life cannot survive')
    } else if (temperature < -15) {
      setOutcome('❄️ Global freeze - most life goes extinct')
    } else if (co2Level > 80 && selectedEra >= 4) {
      setOutcome('🌡️ Extreme greenhouse - runaway climate change')
    } else {
      setOutcome('❌ Poor conditions - mass extinction event')
    }
  }, [selectedEra, co2Level, oxygenLevel, temperature, volcanicActivity])

  const currentEra = GEOLOGICAL_ERAS[selectedEra];

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4 text-white">Evolution Through Deep Time</h2>
          <p className="text-xl text-gray-300">
            Earth's geological timeline and the evolution of life
          </p>
        </div>

        {/* Main Layout: Carousel + Era Info on Left, Controls on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side: Carousel and Era Information (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Evolution Timeline Carousel */}
            <Card className="bg-black/20 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="text-white">Geological Timeline</CardTitle>
                <CardDescription className="text-gray-300">
                  Explore 4.6 billion years of Earth's history and the evolution of life
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EvolutionCarousel selectedEra={selectedEra} onEraSelect={setSelectedEra} />
              </CardContent>
            </Card>

            {/* Era Information Panel */}
            <Card className="bg-black/20 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <span className="text-3xl">{currentEra.icon}</span>
                {currentEra.name}
              </CardTitle>
              <CardDescription className="text-gray-300">
                {currentEra.timeRange} • {currentEra.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Detailed Description */}
              <div className="mb-6 p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
                <p className="text-sm text-blue-200 leading-relaxed">
                  {currentEra.details}
                </p>
              </div>
              
              {/* Key Features */}
              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-white text-sm">Key Features:</h4>
                <div className="grid grid-cols-1 gap-1">
                  {currentEra.keyFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-gray-300">
                      <span className="text-green-400">•</span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Life Forms */}
              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-white text-sm">Life Forms:</h4>
                <div className="flex flex-wrap gap-2">
                  {currentEra.lifeforms.map((lifeform, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-purple-900/30 text-purple-200">
                      {lifeform}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Outcome Display */}
              <div className="mt-4 p-3 rounded-lg bg-black/30 border border-white/10">
                <h4 className="font-semibold mb-2 text-white">Environmental Outcome:</h4>
                <p className={`text-sm font-medium ${
                  outcome.includes('✨') ? 'text-green-400' : 
                  outcome.includes('🌟') ? 'text-emerald-400' :
                  outcome.includes('⚠️') ? 'text-yellow-400' : 
                  outcome.includes('☠️') || outcome.includes('❌') ? 'text-red-400' :
                  'text-orange-400'
                }`}>
                  {outcome}
                </p>
              </div>
            </CardContent>
            </Card>
          </div>

          {/* Right Side: Environmental Controls (1/3 width) */}
          <div className="space-y-6">
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">CO₂ Levels</CardTitle>
                <CardDescription className="text-gray-300">
                  Atmospheric carbon dioxide concentration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Slider
                      value={[co2Level]}
                      onValueChange={(value) => setCo2Level(value[0])}
                      max={100}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    {/* Optimal range indicator */}
                    <div className="absolute top-2 h-2 bg-green-500/30 rounded pointer-events-none" 
                         style={{
                           left: `${((currentEra.atmosphere.co2 - 10) / 100) * 100}%`,
                           width: `${(20 / 100) * 100}%`
                         }}></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Low CO₂</span>
                    <span className="text-green-400 font-bold">{currentEra.atmosphere.co2}% (era optimal)</span>
                    <span className="text-white font-medium">{co2Level.toFixed(0)}%</span>
                    <span>High CO₂</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Oxygen Levels</CardTitle>
                <CardDescription className="text-gray-300">
                  Atmospheric oxygen concentration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Slider
                      value={[oxygenLevel]}
                      onValueChange={(value) => setOxygenLevel(value[0])}
                      max={60}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    {/* Optimal range indicator */}
                    <div className="absolute top-2 h-2 bg-green-500/30 rounded pointer-events-none" 
                         style={{
                           left: `${((currentEra.atmosphere.oxygen - 5) / 60) * 100}%`,
                           width: `${(10 / 60) * 100}%`
                         }}></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Anoxic</span>
                    <span className="text-green-400 font-bold">{currentEra.atmosphere.oxygen}% (era optimal)</span>
                    <span className="text-white font-medium">{oxygenLevel.toFixed(0)}%</span>
                    <span>High O₂</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Global Temperature</CardTitle>
                <CardDescription className="text-gray-300">
                  Average global temperature relative to today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Slider
                      value={[temperature]}
                      onValueChange={(value) => setTemperature(value[0])}
                      max={80}
                      min={-20}
                      step={1}
                      className="w-full"
                    />
                    {/* Optimal range indicator */}
                    <div className="absolute top-2 h-2 bg-green-500/30 rounded pointer-events-none" 
                         style={{
                           left: `${((currentEra.temperature - 10 + 20) / 100) * 100}%`,
                           width: `${(20 / 100) * 100}%`
                         }}></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Ice Age</span>
                    <span className="text-green-400 font-bold">{currentEra.temperature > 0 ? '+' : ''}{currentEra.temperature}°C (era optimal)</span>
                    <span className="text-white font-medium">{temperature > 0 ? '+' : ''}{temperature.toFixed(0)}°C</span>
                    <span>Hothouse</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Volcanic Activity</CardTitle>
                <CardDescription className="text-gray-300">
                  Level of volcanic and tectonic activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Slider
                      value={[volcanicActivity]}
                      onValueChange={(value) => setVolcanicActivity(value[0])}
                      max={100}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    {/* Optimal range indicator - high for early eras, low for later */}
                    <div className="absolute top-2 h-2 bg-green-500/30 rounded pointer-events-none" 
                         style={{
                           left: selectedEra <= 2 ? '60%' : '10%',
                           width: '30%'
                         }}></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Quiet</span>
                    <span className="text-green-400 font-bold">{selectedEra <= 2 ? 'High' : 'Low'} (era optimal)</span>
                    <span className="text-white font-medium">{volcanicActivity.toFixed(0)}%</span>
                    <span>Intense</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {educatorMode && (
          <Card className="bg-blue-900/20 border-blue-500/30 mt-8">
            <CardHeader>
              <CardTitle className="text-blue-300">Deep Time and Evolution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-blue-200">
                <p><strong>Geological Time Scale:</strong> Earth's 4.6 billion year history is divided into eons, eras, and periods based on major geological and biological events. Each era represents hundreds of millions to billions of years.</p>
                
                <p><strong>Environmental Drivers:</strong> Life evolved in response to changing atmospheric composition, climate, and geological activity. Oxygen levels, CO₂ concentrations, and temperature fluctuations shaped evolutionary pathways.</p>
                
                <p><strong>Mass Extinctions:</strong> Five major extinction events reset life's trajectory, creating opportunities for new forms to evolve. The most famous killed the dinosaurs 66 million years ago.</p>
                
                <p><strong>Atmospheric Evolution:</strong> Early Earth had no oxygen. Cyanobacteria created the Great Oxygenation Event 2.4 billion years ago, fundamentally changing life's possibilities and causing the first mass extinction.</p>
                
                <p><strong>Continental Drift:</strong> Moving continents changed ocean circulation, climate patterns, and isolated populations, driving speciation and evolution of new life forms.</p>
                
                <p><strong>Climate Oscillations:</strong> Ice ages, greenhouse periods, and volcanic events created selective pressures that shaped intelligence, cooperation, and adaptability in species like early humans.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
