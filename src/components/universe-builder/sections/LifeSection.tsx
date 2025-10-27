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

// Geological Era Details Component (modeled after Abiogenesis scientific details)
function GeologicalEraDetails({ era, selectedEra }: { era: typeof GEOLOGICAL_ERAS[0]; selectedEra: number }) {
  const getEraAnalysis = () => {
    switch (selectedEra) {
      case 0: // Hadean Earth
        return {
          finetuning: "Extreme conditions created the perfect 'chemical laboratory' for prebiotic synthesis",
          mechanisms: [
            "Asteroid bombardment delivered water and organic compounds to Earth's surface",
            "Volcanic outgassing created dense CO₂/methane atmosphere for greenhouse warming",
            "Lightning and UV radiation provided energy for amino acid and nucleotide synthesis",
            "Hydrothermal vents created temperature/chemical gradients for complex chemistry"
          ],
          challenges: [
            "Surface temperatures too hot (>100°C) for stable organic molecules",
            "Intense asteroid bombardment repeatedly sterilized surface",
            "No protective ozone layer - lethal UV radiation reached surface",
            "Atmospheric composition hostile to life - no free oxygen"
          ],
          reality: "The Hadean was Earth's 'chemical boot camp' - hostile conditions that paradoxically created the building blocks of life. Without this violent phase, complex organic chemistry could never have emerged."
        };
      case 1: // Archean Earth
        return {
          finetuning: "First stable oceans and hydrothermal systems enabled the emergence of life",
          mechanisms: [
            "Stable liquid water oceans provided solvent for biochemical reactions",
            "Hydrothermal vents supplied chemical energy (H₂S, Fe²⁺) for chemosynthesis",
            "Reduced atmosphere (no O₂) allowed complex organic molecules to persist",
            "Continental crust formation created shallow seas ideal for early life"
          ],
          challenges: [
            "Anoxic atmosphere meant no protection from UV radiation",
            "High CO₂ levels created extreme greenhouse conditions",
            "Limited nutrient availability in early oceans",
            "Continued asteroid impacts disrupted early ecosystems"
          ],
          reality: "The Archean represents life's first foothold on Earth. Prokaryotic cells emerged ~3.8 Ga, but remained simple for over a billion years. This 'boring billion' was actually crucial preparation for complexity."
        };
      case 2: // Great Oxygenation
        return {
          finetuning: "Oxygen crisis forced evolutionary innovation and enabled complex cellular machinery",
          mechanisms: [
            "Cyanobacteria evolved oxygenic photosynthesis, releasing O₂ as waste",
            "Iron in oceans oxidized, creating banded iron formations and clearing water",
            "Ozone layer formation provided UV protection for surface life",
            "Aerobic respiration evolved, providing 16x more energy than fermentation"
          ],
          challenges: [
            "Oxygen was toxic to existing anaerobic life - first mass extinction",
            "Methane greenhouse gases oxidized, triggering Snowball Earth glaciation",
            "Atmospheric chemistry became highly reactive and corrosive",
            "Existing metabolic pathways had to completely reorganize"
          ],
          reality: "The Great Oxygenation Event was Earth's first environmental catastrophe caused by life itself. This 'oxygen holocaust' killed most existing species but enabled the energy-rich metabolism required for complex life."
        };
      case 3: // Proterozoic Earth
        return {
          finetuning: "Stable oxygen levels and supercontinent cycles enabled eukaryotic complexity",
          mechanisms: [
            "Endosymbiosis created eukaryotic cells with mitochondria and chloroplasts",
            "Sexual reproduction evolved, accelerating genetic diversity and evolution",
            "Supercontinent Rodinia formed and broke apart, driving speciation",
            "Ocean stratification created diverse chemical environments"
          ],
          challenges: [
            "Fluctuating oxygen levels created boom-bust cycles for life",
            "Snowball Earth episodes repeatedly stressed global ecosystems",
            "Eukaryotic cells required precise oxygen levels - too little or too much was lethal",
            "Complex cellular machinery was fragile and energy-expensive"
          ],
          reality: "The Proterozoic was evolution's 'research and development' phase. For 1.5 billion years, life experimented with cellular complexity, setting the stage for the Cambrian explosion."
        };
      case 4: // Ediacaran-Cambrian
        return {
          finetuning: "Optimal oxygen levels and nutrient availability triggered the Cambrian explosion",
          mechanisms: [
            "Oxygen reached ~21% - optimal for large, active organisms",
            "Phosphorus weathering from glacial runoff fertilized oceans",
            "Predator-prey arms race drove rapid morphological innovation",
            "Hox genes evolved, enabling complex body plan development"
          ],
          challenges: [
            "High oxygen levels enabled wildfires, creating environmental instability",
            "Rapid evolution led to many evolutionary dead ends",
            "Competition intensified as ecological niches filled rapidly",
            "Climate remained unstable with continued glacial-interglacial cycles"
          ],
          reality: "The Cambrian explosion represents evolution's greatest creative burst. In just 25 million years, all major animal phyla appeared. This required precisely tuned environmental conditions that may be rare in the universe."
        };
      case 5: // Paleozoic Earth
        return {
          finetuning: "Land colonization required precise atmospheric and climate conditions",
          mechanisms: [
            "Ozone layer thick enough to allow surface colonization by plants",
            "CO₂ levels high enough to support plant photosynthesis on land",
            "Weathering of rocks provided nutrients for terrestrial ecosystems",
            "Tectonic activity created diverse terrestrial habitats"
          ],
          challenges: [
            "Transition from water to land required new respiratory and structural systems",
            "Pangea formation created massive deserts and climate extremes",
            "High oxygen levels (35%) created fire-prone environments",
            "Mass extinctions repeatedly reset evolutionary progress"
          ],
          reality: "The Paleozoic conquest of land was life's greatest expansion. Plants transformed the atmosphere, creating soils and enabling the evolution of terrestrial food webs. Without this phase, intelligence could never have evolved."
        };
      case 6: // Mesozoic Earth
        return {
          finetuning: "Warm, stable climate enabled the evolution of large, complex organisms",
          mechanisms: [
            "High CO₂ levels created warm, humid greenhouse conditions globally",
            "Continental breakup increased coastal habitats and marine diversity",
            "Flowering plants co-evolved with insects, creating complex ecosystems",
            "Stable climate allowed long-term evolutionary trends toward gigantism"
          ],
          challenges: [
            "High temperatures stressed many organisms near thermal limits",
            "Lack of ice caps meant sea levels were 100+ meters higher",
            "Asteroid impact at end-Cretaceous caused sudden mass extinction",
            "Volcanic activity from Deccan Traps created additional environmental stress"
          ],
          reality: "The Mesozoic was Earth's 'golden age' of reptiles. Stable greenhouse conditions allowed evolution to explore large body sizes and complex behaviors. The asteroid impact was a cosmic accident that reset life's trajectory."
        };
      case 7: // Cenozoic Earth
        return {
          finetuning: "Climate oscillations and continental positions enabled mammalian diversification and intelligence",
          mechanisms: [
            "Cooling climate favored warm-blooded mammals over reptiles",
            "Grassland expansion created new ecological niches",
            "Ice age cycles drove rapid evolution and migration",
            "Isolated continents allowed independent evolutionary experiments"
          ],
          challenges: [
            "Rapid climate changes stressed many species to extinction",
            "Competition from mammals drove many reptile groups extinct",
            "Volcanic activity and asteroid impacts continued to disrupt ecosystems",
            "Cooling temperatures reduced global productivity"
          ],
          reality: "The Cenozoic represents evolution's final preparation for intelligence. Mammals diversified into every available niche, and climate instability selected for behavioral flexibility and large brains."
        };
      case 8: // Anthropocene
        return {
          finetuning: "Stable Holocene climate enabled agriculture and civilization",
          mechanisms: [
            "Stable climate for 10,000 years allowed agriculture to develop",
            "Predictable seasons enabled food storage and population growth",
            "Diverse ecosystems provided resources for technological development",
            "Moderate CO₂ levels maintained climate stability"
          ],
          challenges: [
            "Human activities now dominate global environmental systems",
            "Rapid climate change threatens ecosystem stability",
            "Mass extinction event in progress - sixth in Earth's history",
            "Atmospheric CO₂ levels highest in 3 million years"
          ],
          reality: "The Anthropocene represents a new phase of Earth's evolution where one species has become a geological force. Whether this leads to sustainable civilization or ecosystem collapse depends on choices made in the next few decades."
        };
      default:
        return { finetuning: "", mechanisms: [], challenges: [], reality: "" };
    }
  };

  const analysis = getEraAnalysis();

  return (
    <div className="space-y-4 text-sm">
      {/* Fine-tuning Description */}
      <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
        <h4 className="font-semibold mb-2 text-blue-300">Fine-Tuned Conditions</h4>
        <p className="text-blue-200 leading-relaxed">{analysis.finetuning}</p>
      </div>

      {/* Key Mechanisms */}
      <div className="p-4 rounded-lg bg-green-900/20 border border-green-500/30">
        <h4 className="font-semibold mb-2 text-green-300">Key Mechanisms</h4>
        <div className="space-y-1">
          {analysis.mechanisms.map((mechanism, index) => (
            <div key={index} className="flex items-start gap-2 text-green-200">
              <span className="text-green-400 mt-1">•</span>
              <span className="text-xs leading-relaxed">{mechanism}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Major Challenges */}
      <div className="p-4 rounded-lg bg-orange-900/20 border border-orange-500/30">
        <h4 className="font-semibold mb-2 text-orange-300">Major Challenges</h4>
        <div className="space-y-1">
          {analysis.challenges.map((challenge, index) => (
            <div key={index} className="flex items-start gap-2 text-orange-200">
              <span className="text-orange-400 mt-1">•</span>
              <span className="text-xs leading-relaxed">{challenge}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scientific Reality */}
      <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30">
        <h4 className="font-semibold mb-2 text-purple-300">Scientific Reality</h4>
        <p className="text-purple-200 text-xs leading-relaxed">{analysis.reality}</p>
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

            {/* Educator Mode - Inside Left Column */}
            {educatorMode && (
              <Card className="bg-blue-900/20 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-blue-300">{currentEra.name} - Scientific Analysis</CardTitle>
                  <CardDescription className="text-blue-400">
                    Fine-tuned conditions that enabled the next phase of Earth's evolution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <GeologicalEraDetails era={currentEra} selectedEra={selectedEra} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
