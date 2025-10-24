'use client';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Slider } from '../../ui/slider'
import { SimpleStrongForceVisual, SimpleHierarchyVisual, SimpleMatterAntimatterVisual, SimpleProtonStabilityVisual } from './SimpleMatterVisuals'

// Particle Visualization Component
function ParticleField({ strongForce }: { strongForce: number }) {
  const protonStability = Math.exp(-Math.abs(strongForce - 1) * 2);
  const nucleosynthesisEfficiency = 1 / (1 + Math.pow(Math.abs(strongForce - 1) * 3, 2));
  
  const particleSize = 100 + (strongForce * 50);
  const bondStrength = Math.min(255, strongForce * 128);
  const vibrationSpeed = Math.abs(strongForce - 1) * 5;
  const stability = protonStability * 100;

  return (
    <div className="relative w-full h-64 overflow-hidden bg-black/20 rounded-lg">
      <div 
        className="particle-container"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '200px',
          height: '200px',
          filter: `brightness(${100 + stability}%) contrast(${100 + bondStrength / 2}%)`,
        }}
      >
        {/* Central Proton */}
        <div 
          className="proton"
          style={{
            width: `${particleSize * 0.8}px`,
            height: `${particleSize * 0.8}px`,
            backgroundColor: `rgba(255, ${Math.floor(bondStrength)}, ${Math.floor(bondStrength * 0.5)}, ${0.6 + protonStability * 0.4})`,
            borderRadius: '50%',
            boxShadow: `0 0 ${particleSize * 0.3}px rgba(255, ${Math.floor(bondStrength)}, 0, ${protonStability})`,
          }}
        />
        
        {/* Neutrons */}
        {[0, 1, 2].map((i) => (
          <div 
            key={i}
            className="neutron"
            style={{
              width: `${particleSize * 0.6}px`,
              height: `${particleSize * 0.6}px`,
              backgroundColor: `rgba(${Math.floor(bondStrength * 0.8)}, ${Math.floor(bondStrength * 0.8)}, 255, ${0.5 + nucleosynthesisEfficiency * 0.5})`,
              borderRadius: '50%',
              position: 'absolute',
              left: `${50 + Math.cos(i * 2.1) * 60}%`,
              top: `${50 + Math.sin(i * 2.1) * 60}%`,
              transform: 'translate(-50%, -50%)',
              animation: `orbit ${3 / (strongForce + 0.1)}s linear infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>
      
      <style jsx>{`
        .particle-container {
          position: relative;
        }
        .proton {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          animation: vibrate ${Math.max(0.5, 2 - vibrationSpeed)}s ease-in-out infinite;
        }
        @keyframes vibrate {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.05); }
        }
        @keyframes orbit {
          from { transform: translate(-50%, -50%) rotate(0deg) translateX(40px) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg) translateX(40px) rotate(-360deg); }
        }
      `}</style>
    </div>
  )
}

export default function MatterSection({ 
  educatorMode, 
  cosmicTime = 0
}: { 
  educatorMode: boolean; 
  cosmicTime?: number;
}) {
  const [strongForce, setStrongForce] = useState(1)
  
  // Additional fine-tuning parameters
  const [hierarchyScale, setHierarchyScale] = useState(1)
  const [matterAsymmetry, setMatterAsymmetry] = useState(0.1)
  const [protonLifetime, setProtonLifetime] = useState(35)

  useEffect(() => {
    const handleRandomize = () => {
      setStrongForce(Math.random() * 2)
      setHierarchyScale(0.5 + Math.random() * 1.5)
      setMatterAsymmetry(Math.random() * 0.2)
      setProtonLifetime(30 + Math.random() * 10)
    }

    window.addEventListener('randomizeUniverse', handleRandomize)
    return () => window.removeEventListener('randomizeUniverse', handleRandomize)
  }, [])

  return (
    <div className="container mx-auto px-4">
      {/* Primary Controls - Balanced Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
        {/* Quark Binding Force */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Quark Binding Force</CardTitle>
            <CardDescription className="text-gray-300">
              How tightly are the pieces of protons held together?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ParticleField strongForce={strongForce} />
            <div className="relative mt-4">
                <Slider
                  value={[strongForce]}
                  onValueChange={(value) => setStrongForce(value[0])}
                  max={2}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
                <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                     style={{
                       left: `${((0.8 - 0.1) / (2 - 0.1)) * 100}%`,
                       width: `${((1.2 - 0.8) / (2 - 0.1)) * 100}%`
                     }}></div>
              </div>
              <div className="flex justify-between text-sm text-gray-400 mt-4">
                <span>Too Weak</span>
                <span className="text-green-400 font-bold">0.8-1.2 αs (optimal)</span>
                <span className="text-white font-medium">{strongForce.toFixed(2)} αs</span>
                <span>Too Strong</span>
              </div>
              
              {educatorMode && (
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="text-xs text-blue-200 space-y-2">
                    <p><strong>What you're seeing:</strong> ParticleField shows proton formation with orbiting neutrons - visualizing how the strong force binds quarks together.</p>
                    <p><strong>Critical precision:</strong> Strong force (αs) must be within 0.8-1.2 range - just 2% precision for stable protons. This is extraordinary fine-tuning.</p>
                    <p><strong>2% weaker = no protons:</strong> Quarks would fly apart instantly. No atoms, no chemistry, no life - just a soup of loose quarks.</p>
                    <p><strong>2% stronger = no hydrogen:</strong> Protons would stick so tightly that all matter fuses immediately into heavy elements. No stars could form or shine.</p>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Mass Hierarchy */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Mass Hierarchy</CardTitle>
            <CardDescription className="text-gray-300">
              Why are fundamental forces so different in strength?
            </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                <div className="h-48 bg-black/30 rounded-lg overflow-hidden">
                  <SimpleHierarchyVisual massScale={hierarchyScale} />
                </div>
                <div className="relative">
                  <Slider
                    value={[hierarchyScale]}
                    onValueChange={(value) => setHierarchyScale(value[0])}
                    max={2}
                    min={0.5}
                    step={0.01}
                    className="w-full"
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                       style={{
                         left: `${((0.9 - 0.5) / (2 - 0.5)) * 100}%`,
                         width: `${((1.1 - 0.9) / (2 - 0.5)) * 100}%`
                       }}></div>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Collapsed</span>
                  <span className="text-green-400 font-bold">0.9-1.1 (optimal)</span>
                  <span className="text-white font-medium">{hierarchyScale.toFixed(2)}</span>
                  <span>Runaway</span>
                </div>
              </div>
              
              {educatorMode && (
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="text-xs text-blue-200 space-y-2">
                    <p><strong>What you're seeing:</strong> Bar chart displays relative strengths of fundamental forces - gravity is 10^40 times weaker than the others.</p>
                    <p><strong>The hierarchy mystery:</strong> Forces differ by 10^40 - requires 1 part in 10^34 fine-tuning. Why is gravity so incredibly weak compared to everything else?</p>
                    <p><strong>Quantum puzzle:</strong> Our theories predict all forces should be roughly equal strength, like identical cakes from the same recipe. Instead, one is crumb-sized while others are normal.</p>
                    <p><strong>Precision required:</strong> Like balancing the entire Earth on a needle tip and having it stay perfectly stable. This remains one of physics' greatest unsolved problems.</p>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Matter vs Antimatter */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Matter vs Antimatter</CardTitle>
            <CardDescription className="text-gray-300">
              Why does matter exist instead of nothing?
            </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                <div className="h-48 bg-black/30 rounded-lg overflow-hidden">
                  <SimpleMatterAntimatterVisual asymmetry={matterAsymmetry} />
                </div>
                <div className="relative">
                  <Slider
                    value={[matterAsymmetry]}
                    onValueChange={(value) => setMatterAsymmetry(value[0])}
                    max={0.2}
                    min={0}
                    step={0.001}
                    className="w-full"
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                       style={{
                         left: `${((0.08 - 0) / (0.2 - 0)) * 100}%`,
                         width: `${((0.12 - 0.08) / (0.2 - 0)) * 100}%`
                       }}></div>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Equal (Nothing)</span>
                  <span className="text-green-400 font-bold">8-12% excess (optimal)</span>
                  <span className="text-white font-medium">{(matterAsymmetry * 100).toFixed(1)}%</span>
                  <span>Too Much</span>
                </div>
              </div>
              
              {educatorMode && (
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="text-xs text-blue-200 space-y-2">
                    <p><strong>What you're seeing:</strong> Particle visualization shows matter/antimatter distribution - the tiny excess that became everything we see.</p>
                    <p><strong>The existence puzzle:</strong> Need 8-12% matter excess, but theory is off by factor of 100 million. Why does anything exist instead of nothing?</p>
                    <p><strong>What should have happened:</strong> Big Bang creates equal matter/antimatter (like equal left/right shoes). They annihilate completely, leaving only energy.</p>
                    <p><strong>Miraculous leftover:</strong> Somehow 1 extra matter particle per billion pairs survived annihilation. This tiny excess became stars, planets, and us - but we don't know why.</p>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Proton Stability */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Proton Stability</CardTitle>
            <CardDescription className="text-gray-300">
              How long do the building blocks of atoms last?
            </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                <div className="h-48 bg-black/30 rounded-lg overflow-hidden">
                  <SimpleProtonStabilityVisual lifetime={protonLifetime} />
                </div>
                <div className="relative">
                  <Slider
                    value={[protonLifetime]}
                    onValueChange={(value) => setProtonLifetime(value[0])}
                    max={40}
                    min={30}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                       style={{
                         left: `${((34 - 30) / (40 - 30)) * 100}%`,
                         width: `${((36 - 34) / (40 - 30)) * 100}%`
                       }}></div>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Unstable</span>
                  <span className="text-green-400 font-bold">10^34-10^36 years (optimal)</span>
                  <span className="text-white font-medium">10^{protonLifetime.toFixed(0)} years</span>
                  <span>Too Stable</span>
                </div>
              </div>
              
              {educatorMode && (
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="text-xs text-blue-200 space-y-2">
                    <p><strong>What you're seeing:</strong> Decay timeline shows proton lifetime scenarios - building blocks must last longer than stellar evolution.</p>
                    <p><strong>Stability requirement:</strong> Protons must exceed 10^34 years lifetime - trillion trillion times the universe's age. They're the cores of every atom.</p>
                    <p><strong>The stability mystery:</strong> Our theories predict protons should decay, but we've never observed it. They appear incredibly stable against all expectations.</p>
                    <p><strong>Life's foundation:</strong> If protons decayed too quickly, atoms would fall apart and nothing stable could exist. This stability enables chemistry, biology, and consciousness.</p>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
