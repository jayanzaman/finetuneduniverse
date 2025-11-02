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
          <div className={`relative h-96 lg:h-[500px] rounded-2xl overflow-hidden`}
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
                title={`${era.name} (${era.timeRange}) - ${era.description}`}
                className={`relative cursor-pointer transition-all duration-300 hover:brightness-110 hover:scale-105 hover:z-10 ${
                  era.id === selectedEra ? 'ring-2 ring-white/60 brightness-125 scale-105 z-10' : ''
                } bg-gradient-to-br ${era.gradient}`}
                style={{ width: `${width.percentage}%` }}
              >
                {/* Content inside timeline section */}
                {canFitLabel && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
                    {/* Adaptive text based on available width */}
                    {width.percentage > 15 ? (
                      // Full name for wide sections
                      <div className="text-xs font-semibold text-white drop-shadow-2xl leading-tight px-1 font-sans">
                        {era.name}
                      </div>
                    ) : width.percentage > 10 ? (
                      // Abbreviated name for medium sections
                      <div className="text-xs font-bold text-white drop-shadow-2xl leading-tight px-1 font-mono transform -rotate-12">
                        {era.name.split(' ')[0]}
                      </div>
                    ) : (
                      // Icon or initial for narrow sections
                      <div className="text-lg font-bold text-white drop-shadow-2xl transform rotate-45">
                        {era.icon || era.name.charAt(0)}
                      </div>
                    )}
                    
                    {/* Time range - only show for wider sections */}
                    {width.percentage > 12 && (
                      <div className="text-xs text-white/90 drop-shadow-lg font-light leading-tight">
                        {era.timeRange}
                      </div>
                    )}
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

// Simple Insight Mode Content for Evolution Section
function EvolutionInsightContent({ selectedEra }: { selectedEra: number }) {
  const era = GEOLOGICAL_ERAS[selectedEra];
  
  return (
    <div className="space-y-4">
      {/* Era Overview */}
      <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
        <h4 className="font-semibold mb-2 text-blue-300">Era Overview</h4>
        <p className="text-blue-200 text-sm leading-relaxed mb-3">{era.details}</p>
        <p className="text-blue-100 text-xs italic">{era.context}</p>
      </div>

      {/* Key Features */}
      <div className="p-4 rounded-lg bg-green-900/20 border border-green-500/30">
        <h4 className="font-semibold mb-3 text-green-300">Key Features</h4>
        <div className="grid grid-cols-1 gap-2">
          {era.keyFeatures.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
              <span className="text-green-100 text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Life Forms */}
      <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30">
        <h4 className="font-semibold mb-3 text-purple-300">Dominant Life Forms</h4>
        <div className="flex flex-wrap gap-2">
          {era.lifeforms.map((lifeform, index) => (
            <span key={index} className="px-2 py-1 bg-purple-800/30 text-purple-200 text-xs rounded-full border border-purple-600/30">
              {lifeform}
            </span>
          ))}
        </div>
      </div>

      {/* Atmospheric Composition */}
      <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-500/30">
        <h4 className="font-semibold mb-3 text-amber-300">Atmospheric Composition</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-lg font-bold text-amber-200">{era.atmosphere.co2}%</div>
            <div className="text-xs text-amber-300">CO₂</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-200">{era.atmosphere.oxygen}%</div>
            <div className="text-xs text-amber-300">O₂</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-200">{era.atmosphere.methane}%</div>
            <div className="text-xs text-amber-300">CH₄</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-200">{era.atmosphere.nitrogen}%</div>
            <div className="text-xs text-amber-300">N₂</div>
          </div>
        </div>
      </div>

      {/* Temperature */}
      <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30">
        <h4 className="font-semibold mb-2 text-red-300">Global Temperature</h4>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-200">
            {era.temperature > 0 ? '+' : ''}{era.temperature}°C
          </div>
          <div className="text-xs text-red-300">relative to present day</div>
        </div>
      </div>
    </div>
  );
}

export default function LifeSection({ educatorMode, cosmicTime = 0 }: { educatorMode: boolean; cosmicTime?: number }) {
  const [selectedEra, setSelectedEra] = useState(0)
  // Initialize with optimal values for first era (Hadean Earth) - using scientific units
  const [co2Level, setCo2Level] = useState(GEOLOGICAL_ERAS[0].atmosphere.co2 * 50) // Convert % to ppm (×500 for scale)
  const [oxygenLevel, setOxygenLevel] = useState(GEOLOGICAL_ERAS[0].atmosphere.oxygen) // Keep as % (0-100% range)
  const [temperature, setTemperature] = useState(GEOLOGICAL_ERAS[0].temperature + 15) // Convert to absolute temp (°C, -20 to +500°C range)
  const [volcanicActivity, setVolcanicActivity] = useState(8.5) // Convert to eruptions per million years (0-15 range)
  const [asteroidActivity, setAsteroidActivity] = useState(10) // Impacts per million years (0-50 range)
  const [outcome, setOutcome] = useState('')

  // Update sliders to optimal values when era changes
  useEffect(() => {
    const currentEra = GEOLOGICAL_ERAS[selectedEra];
    setCo2Level(currentEra.atmosphere.co2 * 50); // Convert % to ppm scale
    setOxygenLevel(currentEra.atmosphere.oxygen); // Keep as %
    setTemperature(currentEra.temperature + 15); // Convert to absolute temp (-20 to +500°C range)
    // Volcanic activity: high for early eras (0-2), moderate-low for later eras
    setVolcanicActivity(selectedEra <= 2 ? 12 : 3); // Convert to eruptions per million years
    // Asteroid activity: very high for Hadean (0), high for Archean (1), moderate for later eras
    setAsteroidActivity(selectedEra === 0 ? 40 : selectedEra <= 2 ? 15 : 2); // Impacts per million years
  }, [selectedEra])

  useEffect(() => {
    const handleRandomize = () => {
      setSelectedEra(Math.floor(Math.random() * GEOLOGICAL_ERAS.length))
      setCo2Level(Math.random() * 5000) // 0-5000 ppm
      setOxygenLevel(Math.random() * 100) // 0-100%
      setTemperature(-20 + Math.random() * 520) // -20 to +500°C
      setVolcanicActivity(Math.random() * 15) // 0-15 eruptions/Myr
      setAsteroidActivity(Math.random() * 50) // 0-50 impacts/Myr
    }

    window.addEventListener('randomizeUniverse', handleRandomize)
    return () => window.removeEventListener('randomizeUniverse', handleRandomize)
  }, [])

  useEffect(() => {
    // Calculate evolutionary success based on current era and environmental conditions
    const currentEra = GEOLOGICAL_ERAS[selectedEra];
    const idealAtmosphere = currentEra.atmosphere;
    const idealTemp = currentEra.temperature;
    
    // Score based on how close conditions are to the era's optimal values (using new units)
    const co2Score = Math.max(0, 1 - Math.abs(co2Level - (idealAtmosphere.co2 * 50)) / 750); // ppm scale
    const oxygenScore = Math.max(0, 1 - Math.abs(oxygenLevel - idealAtmosphere.oxygen) / 25); // % scale (0-100% range)
    const tempScore = Math.max(0, 1 - Math.abs(temperature - (idealTemp + 15)) / 50); // absolute temp scale (-20 to +500°C)
    const idealVolcanic = selectedEra <= 2 ? 12 : 3;
    const volcanicScore = Math.max(0, 1 - Math.abs(volcanicActivity - idealVolcanic) / 5); // eruptions/Myr scale
    const idealAsteroid = selectedEra === 0 ? 40 : selectedEra <= 2 ? 15 : 2;
    const asteroidScore = Math.max(0, 1 - Math.abs(asteroidActivity - idealAsteroid) / 10); // impacts/Myr scale
    
    const totalScore = (co2Score * 0.25) + (oxygenScore * 0.25) + (tempScore * 0.2) + (volcanicScore * 0.15) + (asteroidScore * 0.15);
    
    if (totalScore > 0.85) {
      setOutcome(`✨ Perfect conditions for ${currentEra.name} life forms!`)
    } else if (totalScore > 0.65) {
      setOutcome(`🌟 Good - ${currentEra.description.toLowerCase()} thrives`)
    } else if (totalScore > 0.45) {
      setOutcome(`⚠️ Marginal - some life survives but struggles`)
    } else if (oxygenLevel > 50 && selectedEra <= 1) {
      setOutcome('☠️ Oxygen toxicity - anaerobic life dies')
    } else if (temperature > 200) {
      setOutcome('🔥 Too hot - proteins denature, life cannot survive')
    } else if (temperature < -10) {
      setOutcome('❄️ Global freeze - most life goes extinct')
    } else if (co2Level > 4000 && selectedEra >= 4) {
      setOutcome('🌡️ Extreme greenhouse - runaway climate change')
    } else if (asteroidActivity > 35) {
      setOutcome('☄️ Asteroid bombardment - surface sterilization events')
    } else {
      setOutcome('❌ Poor conditions - mass extinction event')
    }
  }, [selectedEra, co2Level, oxygenLevel, temperature, volcanicActivity, asteroidActivity])

  const currentEra = GEOLOGICAL_ERAS[selectedEra];

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-7xl mx-auto">

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

            {/* Insight Mode Content - Moved to Left Column for Better Visibility */}
            <Card className="bg-blue-900/20 border-blue-500/30">
              <CardContent className="pt-6">
                {educatorMode ? (
                  <div className="space-y-4">
                    {/* Era Overview */}
                    <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
                      <h4 className="font-semibold mb-2 text-blue-300 flex items-center gap-2">
                        <span className="text-lg">{currentEra.icon}</span>
                        Era Overview
                      </h4>
                      <p className="text-blue-200 text-sm leading-relaxed mb-3">{currentEra.details}</p>
                      <p className="text-blue-100 text-xs italic">"{currentEra.context}"</p>
                    </div>

                    {/* Key Features */}
                    <div className="p-4 rounded-lg bg-green-900/20 border border-green-500/30">
                      <h4 className="font-semibold mb-3 text-green-300">Key Features</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {currentEra.keyFeatures.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                            <span className="text-green-100 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Life Forms */}
                    <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30">
                      <h4 className="font-semibold mb-3 text-purple-300">Dominant Life Forms</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentEra.lifeforms.map((lifeform, index) => (
                          <span key={index} className="px-3 py-1 bg-purple-800/30 text-purple-200 text-sm rounded-full border border-purple-600/30">
                            {lifeform}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Environmental Conditions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Atmospheric Composition */}
                      <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-500/30">
                        <h4 className="font-semibold mb-3 text-amber-300">Atmospheric Composition</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center">
                            <div className="text-lg font-bold text-amber-200">{currentEra.atmosphere.co2}%</div>
                            <div className="text-xs text-amber-300">CO₂</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-amber-200">{currentEra.atmosphere.oxygen}%</div>
                            <div className="text-xs text-amber-300">O₂</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-amber-200">{currentEra.atmosphere.methane}%</div>
                            <div className="text-xs text-amber-300">CH₄</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-amber-200">{currentEra.atmosphere.nitrogen}%</div>
                            <div className="text-xs text-amber-300">N₂</div>
                          </div>
                        </div>
                      </div>

                      {/* Temperature */}
                      <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/30">
                        <h4 className="font-semibold mb-2 text-red-300">Global Temperature</h4>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-200">
                            {currentEra.temperature > 0 ? '+' : ''}{currentEra.temperature}°C
                          </div>
                          <div className="text-xs text-red-300">relative to present day</div>
                          <div className="text-xs text-red-400 mt-1">
                            ({currentEra.temperature === 0 ? '15°C average' : `${15 + currentEra.temperature}°C average`})
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Time Period */}
                    <div className="p-3 rounded-lg bg-gray-900/20 border border-gray-500/30">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-gray-300">Time Period</h4>
                          <p className="text-gray-400 text-sm">{currentEra.timeRange}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-200">{currentEra.description}</div>
                          <div className="text-xs text-gray-400">Era Classification</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Play Mode Content - Era-specific detailed descriptions */}
                    {selectedEra === 0 && ( // Hadean Earth
                      <div className="p-6 rounded-lg bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-500/30">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-3xl">🌋</span>
                          <div>
                            <h3 className="text-xl font-bold text-orange-300">Hadean Earth</h3>
                            <p className="text-orange-400 text-sm">4.6–4.0 billion years ago</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="font-semibold text-orange-200 mb-2">Role: Foundation of habitability</h4>
                          <p className="text-orange-100 text-sm leading-relaxed mb-3">
                            The Hadean was less an "era of life" and more an era that built the stage. Earth was still accreting, battered by impacts, its crust repeatedly melting. But during these violent cycles, a stable crust, oceans, and a magnetic field began forming.
                          </p>
                          <p className="text-orange-100 text-sm leading-relaxed">
                            Without these, no later biochemistry could survive: DNA would have been fried by radiation and boiled away by heat.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-orange-200 mb-2">Tempo: Chemical, not biological</h4>
                          <p className="text-orange-100 text-sm leading-relaxed">
                            Even though there were no cells yet, the ingredients—amino acids, nucleotides, phospholipids—were being forged in the crucible of heat, lightning, and meteor chemistry. This took hundreds of millions of years, setting a lower bound for prebiotic complexity. Skip this, and you lose the raw materials and the protective environment necessary for even a single strand of RNA to persist.
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedEra === 1 && ( // Archean Earth
                      <div className="p-6 rounded-lg bg-gradient-to-br from-teal-900/30 to-green-900/30 border border-teal-500/30">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-3xl">🦠</span>
                          <div>
                            <h3 className="text-xl font-bold text-teal-300">Archean Earth</h3>
                            <p className="text-teal-400 text-sm">4.0–2.5 billion years ago</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="font-semibold text-teal-200 mb-2">Role: Birth of life and the first metabolism</h4>
                          <p className="text-teal-100 text-sm leading-relaxed">
                            By now, the planet had cooled enough for liquid water oceans and stable continental crusts. Microbial life arose—probably thermophiles feeding on hydrogen and sulfur. The key invention: photosynthesis (first anoxygenic, then oxygenic cyanobacteria).
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-teal-200 mb-2">Tempo: Molecular experimentation</h4>
                          <p className="text-teal-100 text-sm leading-relaxed">
                            Mutations in primitive genomes (maybe only a few thousand base pairs long) drove exploration of metabolic pathways. Over 1.5 billion years, countless micro-steps—energy coupling, ATP synthesis, lipid membranes—were refined. If this window had been shorter, the statistical odds of evolving such complex systems from random chemistry drop to nearly zero. Skip the Archean, and you skip life's root—no prokaryotes, no genetic code, no photosynthesis.
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedEra === 2 && ( // Great Oxygenation
                      <div className="p-6 rounded-lg bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-3xl">❄️</span>
                          <div>
                            <h3 className="text-xl font-bold text-cyan-300">Great Oxygenation Event</h3>
                            <p className="text-cyan-400 text-sm">2.5–2.0 billion years ago</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="font-semibold text-cyan-200 mb-2">Role: Planetary transformation by life</h4>
                          <p className="text-cyan-100 text-sm leading-relaxed">
                            Cyanobacteria's waste product—oxygen—accumulated in the atmosphere, poisoning anaerobes but enabling new metabolisms: respiration (far more energy-efficient than fermentation). Iron in oceans oxidized, forming the red banded iron formations that mark this cataclysmic shift.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-cyan-200 mb-2">Tempo: Atmospheric-scale mutation</h4>
                          <p className="text-cyan-100 text-sm leading-relaxed">
                            This wasn't a biological invention so much as a planetary feedback loop triggered by biological persistence. It took hundreds of millions of years for oxygen sinks to fill and atmospheric O₂ to rise. Skip this, and no eukaryotes: the jump in available energy per cell was the prerequisite for complex multicellularity.
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedEra === 3 && ( // Proterozoic Earth
                      <div className="p-6 rounded-lg bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-3xl">🔬</span>
                          <div>
                            <h3 className="text-xl font-bold text-purple-300">Proterozoic Earth</h3>
                            <p className="text-purple-400 text-sm">2.0–541 million years ago</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="font-semibold text-purple-200 mb-2">Role: Complexity incubator</h4>
                          <p className="text-purple-100 text-sm leading-relaxed">
                            This is when eukaryotic cells—those with nuclei and mitochondria—arose via endosymbiosis, a once-in-history fusion between archaea and bacteria. Genetic recombination, compartmentalization, and sexual reproduction emerged. The Earth's climate cycled between snowball states and greenhouse phases, pressuring life to innovate.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-purple-200 mb-2">Tempo: Slow genetic architecture building</h4>
                          <p className="text-purple-100 text-sm leading-relaxed">
                            It took roughly 1.5 billion years for single-celled eukaryotes to evolve multicellularity, tissue specialization, and signaling genes. That's the genomic patience required to assemble bodies. Skip the Proterozoic, and you jump straight from bacteria to bodies—impossible without the intermediate eukaryotic toolkit.
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedEra === 4 && ( // Ediacaran-Cambrian
                      <div className="p-6 rounded-lg bg-gradient-to-br from-emerald-900/30 to-green-900/30 border border-emerald-500/30">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-3xl">🐚</span>
                          <div>
                            <h3 className="text-xl font-bold text-emerald-300">Ediacaran–Cambrian</h3>
                            <p className="text-emerald-400 text-sm">635–485 million years ago</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="font-semibold text-emerald-200 mb-2">Role: Explosion of animal body plans</h4>
                          <p className="text-emerald-100 text-sm leading-relaxed">
                            Ediacaran seas hosted soft-bodied multicellular life; the Cambrian saw the evolutionary arms race that produced all major phyla—arthropods, mollusks, chordates. Oxygen levels, genetic prerequisites (Hox genes), and ecological competition converged.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-emerald-200 mb-2">Tempo: Genetic acceleration after a billion-year incubation</h4>
                          <p className="text-emerald-100 text-sm leading-relaxed">
                            The apparent "explosion" spanned ~25 million years—short geologically, long biologically. Mutational rates plus developmental gene networks hit a critical threshold: enough regulatory complexity for morphogenesis to diversify rapidly. Skip this, and you have microbial mats forever—no animals, no eyes, no predation, no nervous systems.
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedEra === 5 && ( // Paleozoic Earth
                      <div className="p-6 rounded-lg bg-gradient-to-br from-lime-900/30 to-green-900/30 border border-lime-500/30">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-3xl">🌿</span>
                          <div>
                            <h3 className="text-xl font-bold text-lime-300">Paleozoic Earth</h3>
                            <p className="text-lime-400 text-sm">485–252 million years ago</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="font-semibold text-lime-200 mb-2">Role: Colonization of land and the invention of diversity</h4>
                          <p className="text-lime-100 text-sm leading-relaxed">
                            Plants, fungi, arthropods, and vertebrates moved ashore. Forests oxygenated the air. Complex food webs formed. The DNA-based instructions for skeletons, circulatory systems, and limbs were refined.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-lime-200 mb-2">Tempo: Steady genetic branching under stable conditions</h4>
                          <p className="text-lime-100 text-sm leading-relaxed">
                            Hundreds of millions of years of gradual selection were needed to tune the transition from water to air—lungs, keratin, seeds. If this interval were compressed, mutation and selection could not have supplied the adaptive diversity. Skip it, and you have only marine ecosystems.
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedEra === 6 && ( // Mesozoic Earth
                      <div className="p-6 rounded-lg bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-500/30">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-3xl">🦕</span>
                          <div>
                            <h3 className="text-xl font-bold text-yellow-300">Mesozoic Earth</h3>
                            <p className="text-yellow-400 text-sm">252–66 million years ago</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="font-semibold text-yellow-200 mb-2">Role: Age of reptiles—and ecosystems testing large-scale design</h4>
                          <p className="text-yellow-100 text-sm leading-relaxed">
                            Following the Permian extinction, reptiles, dinosaurs, and early mammals radiated. Continental drift rearranged habitats; flowering plants evolved, enabling complex pollination systems.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-yellow-200 mb-2">Tempo: Evolutionary dynamism punctuated by catastrophe</h4>
                          <p className="text-yellow-100 text-sm leading-relaxed">
                            The slow refinement of warm-blooded metabolism, feathers, and live birth required tens of millions of generations. Mass extinctions pruned the tree, letting adaptive bursts reshape it. Skip the Mesozoic, and mammals never gain the ecological foothold needed for intelligence to evolve later.
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedEra === 7 && ( // Cenozoic Earth
                      <div className="p-6 rounded-lg bg-gradient-to-br from-amber-900/30 to-yellow-900/30 border border-amber-500/30">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-3xl">🐘</span>
                          <div>
                            <h3 className="text-xl font-bold text-amber-300">Cenozoic Earth</h3>
                            <p className="text-amber-400 text-sm">66 million years ago–today</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="font-semibold text-amber-200 mb-2">Role: Mammalian ascendance and the evolution of cognition</h4>
                          <p className="text-amber-100 text-sm leading-relaxed">
                            After the asteroid impact cleared the dinosaurs, niches opened for small, warm-blooded generalists. Climate oscillations selected for adaptability and social behavior. Eventually, primates evolved high-energy brains—cognitive organisms able to model the world and, ironically, reconstruct this very timeline.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-amber-200 mb-2">Tempo: Fast by geological standards, slow by genetic ones</h4>
                          <p className="text-amber-100 text-sm leading-relaxed">
                            Even here, major innovations—bipedalism, language, tool use—took millions of years and countless generations. Compress time further, and random mutations can't traverse the necessary fitness landscapes.
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedEra === 8 && ( // Anthropocene
                      <div className="p-6 rounded-lg bg-gradient-to-br from-gray-900/30 to-slate-900/30 border border-gray-500/30">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-3xl">🏭</span>
                          <div>
                            <h3 className="text-xl font-bold text-gray-300">Anthropocene</h3>
                            <p className="text-gray-400 text-sm">Present day</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-200 mb-2">Role: Human transformation of Earth systems</h4>
                          <p className="text-gray-100 text-sm leading-relaxed">
                            Humans have become a geological force, reshaping the planet's climate, chemistry, and biology faster than natural processes. This represents the first time in Earth's history that a single species has gained conscious control over planetary systems.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-200 mb-2">Tempo: Technological acceleration</h4>
                          <p className="text-gray-100 text-sm leading-relaxed">
                            The pace of change has accelerated beyond biological timescales. What once took millions of years now happens in decades. This creates both unprecedented opportunities and existential risks for life on Earth.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Right Side: Environmental Controls (1/3 width) */}
          <div className="flex flex-col h-96 lg:h-[500px] gap-2">
            <Card className="bg-black/20 border-white/10 flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">CO₂ Concentration</CardTitle>
                <CardDescription className="text-gray-300 text-xs">
                  Atmospheric carbon dioxide (parts per million)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2">
                  <div className="relative">
                    <Slider
                      value={[co2Level]}
                      onValueChange={(value) => setCo2Level(value[0])}
                      max={5000}
                      min={100}
                      step={50}
                      className="w-full"
                    />
                    {/* Optimal range indicator - ±750 ppm around optimal value */}
                    <div className="absolute top-2 h-2 bg-green-500/30 rounded pointer-events-none" 
                         style={{
                           left: `${Math.max(0, Math.min(100, ((currentEra.atmosphere.co2 * 50) - 750 - 100) / 4900 * 100))}%`,
                           width: `${Math.max(0, Math.min(100 - Math.max(0, ((currentEra.atmosphere.co2 * 50) - 750 - 100) / 4900 * 100), (Math.min(5000, (currentEra.atmosphere.co2 * 50) + 750) - Math.max(100, (currentEra.atmosphere.co2 * 50) - 750)) / 4900 * 100))}%`
                         }}></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>100 ppm</span>
                    <span className="text-green-400 font-bold">{(currentEra.atmosphere.co2 * 50).toFixed(0)} ppm (optimal)</span>
                    <span className="text-white font-medium">{co2Level.toFixed(0)} ppm</span>
                    <span>5000 ppm</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 border-white/10 flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Oxygen Concentration</CardTitle>
                <CardDescription className="text-gray-300 text-xs">
                  Atmospheric oxygen percentage
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2">
                  <div className="relative">
                    <Slider
                      value={[oxygenLevel]}
                      onValueChange={(value) => setOxygenLevel(value[0])}
                      max={100}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    {/* Optimal range indicator - ±10% around optimal value */}
                    <div className="absolute top-2 h-2 bg-green-500/30 rounded pointer-events-none" 
                         style={{
                           left: `${Math.max(0, Math.min(100, (currentEra.atmosphere.oxygen - 10) / 100 * 100))}%`,
                           width: `${Math.max(0, Math.min(100 - Math.max(0, (currentEra.atmosphere.oxygen - 10) / 100 * 100), (Math.min(100, currentEra.atmosphere.oxygen + 10) - Math.max(0, currentEra.atmosphere.oxygen - 10)) / 100 * 100))}%`
                         }}></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>0%</span>
                    <span className="text-green-400 font-bold">{currentEra.atmosphere.oxygen.toFixed(1)}% (optimal)</span>
                    <span className="text-white font-medium">{oxygenLevel.toFixed(1)}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 border-white/10 flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Global Temperature</CardTitle>
                <CardDescription className="text-gray-300 text-xs">
                  Average global temperature (°C)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2">
                  <div className="relative">
                    <Slider
                      value={[temperature]}
                      onValueChange={(value) => setTemperature(value[0])}
                      max={500}
                      min={-20}
                      step={5}
                      className="w-full"
                    />
                    {/* Optimal range indicator - ±25°C around optimal value */}
                    <div className="absolute top-2 h-2 bg-green-500/30 rounded pointer-events-none" 
                         style={{
                           left: `${Math.max(0, Math.min(100, ((currentEra.temperature + 15) - 25 + 20) / 520 * 100))}%`,
                           width: `${Math.max(0, Math.min(100 - Math.max(0, ((currentEra.temperature + 15) - 25 + 20) / 520 * 100), (Math.min(500, (currentEra.temperature + 15) + 25) - Math.max(-20, (currentEra.temperature + 15) - 25) + 20) / 520 * 100))}%`
                         }}></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>-20°C</span>
                    <span className="text-green-400 font-bold">{(currentEra.temperature + 15).toFixed(0)}°C (optimal)</span>
                    <span className="text-white font-medium">{temperature.toFixed(0)}°C</span>
                    <span>500°C</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 border-white/10 flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Volcanic Activity</CardTitle>
                <CardDescription className="text-gray-300 text-xs">
                  Major eruptions per million years
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2">
                  <div className="relative">
                    <Slider
                      value={[volcanicActivity]}
                      onValueChange={(value) => setVolcanicActivity(value[0])}
                      max={15}
                      min={0}
                      step={0.5}
                      className="w-full"
                    />
                    {/* Optimal range indicator - ±2 eruptions around optimal value */}
                    <div className="absolute top-2 h-2 bg-green-500/30 rounded pointer-events-none" 
                         style={{
                           left: `${Math.max(0, Math.min(100, ((selectedEra <= 2 ? 12 : 3) - 2) / 15 * 100))}%`,
                           width: `${Math.max(0, Math.min(100 - Math.max(0, ((selectedEra <= 2 ? 12 : 3) - 2) / 15 * 100), (Math.min(15, (selectedEra <= 2 ? 12 : 3) + 2) - Math.max(0, (selectedEra <= 2 ? 12 : 3) - 2)) / 15 * 100))}%`
                         }}></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>0/Myr</span>
                    <span className="text-green-400 font-bold">{selectedEra <= 2 ? '12' : '3'}/Myr (optimal)</span>
                    <span className="text-white font-medium">{volcanicActivity.toFixed(1)}/Myr</span>
                    <span>15/Myr</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 border-white/10 flex-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Asteroid Bombardment</CardTitle>
                <CardDescription className="text-gray-300 text-xs">
                  Major asteroid impacts per million years
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2">
                  <div className="relative">
                    <Slider
                      value={[asteroidActivity]}
                      onValueChange={(value) => setAsteroidActivity(value[0])}
                      max={50}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    {/* Optimal range indicator - very high for Hadean, high for early eras, low for later */}
                    <div className="absolute top-2 h-2 bg-green-500/30 rounded pointer-events-none" 
                         style={{
                           left: `${Math.max(0, Math.min(100, ((selectedEra === 0 ? 40 : selectedEra <= 2 ? 15 : 2) - 5) / 50 * 100))}%`,
                           width: `${Math.max(0, Math.min(100 - Math.max(0, ((selectedEra === 0 ? 40 : selectedEra <= 2 ? 15 : 2) - 5) / 50 * 100), (Math.min(50, (selectedEra === 0 ? 40 : selectedEra <= 2 ? 15 : 2) + 5) - Math.max(0, (selectedEra === 0 ? 40 : selectedEra <= 2 ? 15 : 2) - 5)) / 50 * 100))}%`
                         }}></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>0/Myr</span>
                    <span className="text-green-400 font-bold">{selectedEra === 0 ? '40' : selectedEra <= 2 ? '15' : '2'}/Myr (optimal)</span>
                    <span className="text-white font-medium">{asteroidActivity.toFixed(0)}/Myr</span>
                    <span>50/Myr</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}
