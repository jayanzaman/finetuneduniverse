'use client';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

// Galaxy Visualization Component
function GalaxyVisualization({ 
  blackHoleMass, 
  activityLevel, 
  starFormationRate 
}: {
  blackHoleMass: number;
  activityLevel: 'dormant' | 'active' | 'quasar';
  starFormationRate: number;
}) {
  const massScale = Math.log10(blackHoleMass / 1e5) / 5; // 0-1 scale
  const coreSize = 20 + (massScale * 40);
  
  // Activity effects
  const getActivityEffects = () => {
    switch (activityLevel) {
      case 'quasar':
        return {
          coreBrightness: 150,
          jetLength: 200,
          radiationZone: 180,
          starDensity: 0.2,
          diskColor: 'rgba(255, 100, 100, 0.8)'
        };
      case 'active':
        return {
          coreBrightness: 120,
          jetLength: 100,
          radiationZone: 80,
          starDensity: 0.6,
          diskColor: 'rgba(255, 180, 100, 0.6)'
        };
      default: // dormant
        return {
          coreBrightness: 80,
          jetLength: 0,
          radiationZone: 0,
          starDensity: 1.0,
          diskColor: 'rgba(200, 200, 255, 0.4)'
        };
    }
  };

  const effects = getActivityEffects();

  return (
    <div className="relative w-full h-48 flex items-center justify-center overflow-hidden bg-black/30 rounded-lg">
      <div className="galaxy-container relative w-48 h-48">
        
        {/* Galactic Disk */}
        <div 
          className="absolute inset-0 rounded-full opacity-60"
          style={{
            background: `radial-gradient(ellipse at center, ${effects.diskColor} 0%, transparent 70%)`,
            animation: 'galaxy-rotation 20s linear infinite'
          }}
        />
        
        {/* Central Black Hole */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: `${coreSize}px`,
            height: `${coreSize}px`,
            backgroundColor: '#000',
            boxShadow: `0 0 ${coreSize * 2}px rgba(255, 255, 255, ${effects.coreBrightness / 100})`,
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}
        />
        
        {/* Jets (if active) */}
        {effects.jetLength > 0 && (
          <>
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                width: '4px',
                height: `${effects.jetLength}px`,
                background: 'linear-gradient(to top, rgba(0, 150, 255, 0.8), transparent)',
                marginTop: `-${effects.jetLength/2}px`
              }}
            />
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                width: '4px',
                height: `${effects.jetLength}px`,
                background: 'linear-gradient(to bottom, rgba(0, 150, 255, 0.8), transparent)',
                marginTop: `${effects.jetLength/2}px`
              }}
            />
          </>
        )}
        
        {/* Stars */}
        {Array.from({ length: Math.floor(20 * effects.starDensity) }).map((_, i) => {
          const angle = (i / (20 * effects.starDensity)) * 2 * Math.PI;
          const radius = 30 + Math.random() * 60;
          const x = 50 + Math.cos(angle) * radius;
          const y = 50 + Math.sin(angle) * radius;
          
          return (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                opacity: 0.3 + Math.random() * 0.7,
                animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`
              }}
            />
          );
        })}
      </div>
      
      <style jsx>{`
        @keyframes galaxy-rotation {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
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
  const [blackHoleMass, setBlackHoleMass] = useState(4e6) // Milky Way mass
  const [activityLevel, setActivityLevel] = useState<'dormant' | 'active' | 'quasar'>('dormant')
  const [starFormationRate, setStarFormationRate] = useState(1)
  const [metalEnrichment, setMetalEnrichment] = useState(0.5)

  useEffect(() => {
    const handleRandomize = () => {
      setBlackHoleMass(Math.pow(10, 5 + Math.random() * 5)) // 10^5 to 10^10
      const activities: ('dormant' | 'active' | 'quasar')[] = ['dormant', 'active', 'quasar']
      setActivityLevel(activities[Math.floor(Math.random() * activities.length)])
      setStarFormationRate(0.1 + Math.random() * 1.9)
      setMetalEnrichment(Math.random())
    }

    window.addEventListener('randomizeUniverse', handleRandomize)
    return () => window.removeEventListener('randomizeUniverse', handleRandomize)
  }, [])

  return (
    <div className="container mx-auto px-4">
      {/* Header Section */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-white">The Galactic Heart</h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Supermassive black holes shape galactic evolution, controlling star formation and metal enrichment across cosmic time.
        </p>
      </div>

      {/* Primary Controls - Balanced Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
        {/* Black Hole Mass */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Black Hole Mass</CardTitle>
            <CardDescription className="text-gray-300">
              Mass of central supermassive black hole
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GalaxyVisualization 
              blackHoleMass={blackHoleMass}
              activityLevel={activityLevel}
              starFormationRate={starFormationRate}
            />
            <div className="relative mt-4">
              <Slider
                value={[Math.log10(blackHoleMass)]}
                onValueChange={(value) => setBlackHoleMass(Math.pow(10, value[0]))}
                min={5} // 10^5 solar masses
                max={10} // 10^10 solar masses
                step={0.1}
                className="w-full"
              />
              <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                   style={{
                     left: `${((6.0 - 5) / (10 - 5)) * 100}%`,
                     width: `${((7.5 - 6.0) / (10 - 5)) * 100}%`
                   }}></div>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-4">
              <span>Dwarf</span>
              <span className="text-green-400 font-bold">10⁶-10⁷ M☉ (optimal)</span>
              <span className="text-white font-medium">{blackHoleMass.toExponential(1)} M☉</span>
              <span>Giant</span>
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> Galaxy visualization showing the central black hole, stellar disk, and activity jets based on mass and activity level.</p>
                  <p><strong>Mass matters:</strong> Black holes need 10⁶-10⁷ solar masses for optimal galaxy regulation. Too small = no feedback, too large = galaxy destruction.</p>
                  <p><strong>The M-sigma relation:</strong> Black hole mass correlates precisely with galaxy bulge velocity - suggesting co-evolution across cosmic time.</p>
                  <p><strong>Galactic gardeners:</strong> Black holes regulate star formation through feedback, preventing galaxies from consuming all their gas too quickly.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Level */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Activity Level</CardTitle>
            <CardDescription className="text-gray-300">
              Black hole accretion and feedback intensity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-black/30 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-2xl mb-2">
                  {activityLevel === 'quasar' ? '💥' : activityLevel === 'active' ? '🔥' : '😴'}
                </div>
                <div className="text-sm text-gray-300">Activity</div>
                <div className="text-lg font-bold text-white capitalize">{activityLevel}</div>
              </div>
            </div>
            <div className="space-y-2">
              {(['dormant', 'active', 'quasar'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setActivityLevel(level)}
                  className={`w-full p-2 rounded text-sm font-medium transition-colors ${
                    activityLevel === level
                      ? 'bg-green-500/30 border border-green-500/50 text-green-200'
                      : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> Activity selector showing different black hole feeding states - from dormant to active galactic nuclei to quasars.</p>
                  <p><strong>Dormant phase:</strong> Black hole quietly accretes material, allowing steady star formation and metal enrichment in the galaxy.</p>
                  <p><strong>Active phase:</strong> Moderate accretion creates jets and winds that regulate star formation - the "goldilocks" state for galaxy evolution.</p>
                  <p><strong>Quasar phase:</strong> Violent accretion creates powerful jets that can sterilize the entire galaxy, halting star formation completely.</p>
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
              Rate of stellar birth in the galaxy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-black/30 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-2xl mb-2">⭐</div>
                <div className="text-sm text-gray-300">Formation Rate</div>
                <div className="text-lg font-bold text-white">{starFormationRate.toFixed(1)} M☉/yr</div>
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
                     left: `${((0.5 - 0.1) / (2 - 0.1)) * 100}%`,
                     width: `${((1.5 - 0.5) / (2 - 0.1)) * 100}%`
                   }}></div>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-4">
              <span>Quenched</span>
              <span className="text-green-400 font-bold">0.5-1.5 M☉/yr (optimal)</span>
              <span className="text-white font-medium">{starFormationRate.toFixed(1)}</span>
              <span>Starburst</span>
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> Star formation rate display showing how many solar masses of stars form per year in the galaxy.</p>
                  <p><strong>Regulated formation:</strong> Optimal rates (0.5-1.5 M☉/yr) allow steady metal enrichment while preserving gas for future generations.</p>
                  <p><strong>Black hole feedback:</strong> Active galactic nuclei regulate star formation through jets and winds, preventing runaway gas consumption.</p>
                  <p><strong>Cosmic balance:</strong> Too fast depletes gas reservoirs, too slow fails to enrich the interstellar medium with heavy elements.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metal Enrichment */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Metal Enrichment</CardTitle>
            <CardDescription className="text-gray-300">
              Heavy element distribution efficiency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-black/30 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-2xl mb-2">⚛️</div>
                <div className="text-sm text-gray-300">Enrichment</div>
                <div className="text-lg font-bold text-white">{(metalEnrichment * 100).toFixed(0)}%</div>
              </div>
            </div>
            <div className="relative">
              <Slider
                value={[metalEnrichment]}
                onValueChange={(value) => setMetalEnrichment(value[0])}
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
              <span>Poor</span>
              <span className="text-green-400 font-bold">30-80% (optimal)</span>
              <span className="text-white font-medium">{(metalEnrichment * 100).toFixed(0)}%</span>
              <span>Uniform</span>
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> Metal enrichment efficiency - how well supernovae and stellar winds distribute heavy elements throughout the galaxy.</p>
                  <p><strong>Mixing matters:</strong> Optimal enrichment (30-80%) ensures heavy elements reach star-forming regions without over-enriching the galaxy.</p>
                  <p><strong>Galactic winds:</strong> Black hole activity and supernovae drive metal-rich gas into the halo, then back into star-forming regions.</p>
                  <p><strong>Chemical evolution:</strong> This process creates the metallicity gradients observed in spiral galaxies, enabling diverse planetary systems.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
