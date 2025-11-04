'use client';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Slider } from '../../ui/slider'
import { SimpleStrongForceVisual, SimpleHierarchyVisual, SimpleMatterAntimatterVisual } from './SimpleMatterVisuals'
import { TimelineProbabilityVisual, TimelineProbabilityVisualMobile } from './TimelineProbabilityVisual'
import { QuarkBindingVisual } from './QuarkBindingVisual'

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
              animationName: 'orbit',
              animationDuration: `${3 / (strongForce + 0.1)}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationDelay: `${i * 0.3}s`,
              animationFillMode: 'both',
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
  
  // Mobile navigation state
  const [currentStep, setCurrentStep] = useState(0)
  
  // Define the steps in optimal order for Formation of Matter
  const steps = [
    {
      id: 'strong-force',
      title: 'Quark Binding Force',
      subtitle: 'Strong Nuclear Force',
      description: 'How tightly are the pieces of protons held together?',
      visual: <QuarkBindingVisual strongForce={strongForce} />,
      value: strongForce,
      onChange: (value: number[]) => setStrongForce(value[0]),
      min: 0.8,
      max: 1.2,
      step: 0.001,
      unit: 'αs',
      optimal: '0.98-1.02 αs (optimal)',
      optimalRange: { left: ((0.98 - 0.8) / (1.2 - 0.8)) * 100, width: ((1.02 - 0.98) / (1.2 - 0.8)) * 100 },
      educatorContent: (
        <div className="text-xs text-blue-200 space-y-2">
          <p><strong>What you're seeing:</strong> Three quarks bound by flux tubes (gluon field) inside a proton. The visualization transitions from chaos to creation to collapse as you adjust αs.</p>
          <p><strong>Critical precision:</strong> Strong force (αs) must be within 0.98-1.02 range - just 4% tolerance for stable matter. This represents extraordinary fine-tuning.</p>
          <p><strong>Too weak (&lt; 0.98):</strong> Flux tubes weaken, quarks drift apart. No protons can form - just scattered energy in an empty void.</p>
          <p><strong>Too strong (&gt; 1.02):</strong> Violent fusion reactions. All hydrogen burns instantly into heavier elements. No long-lived stars possible.</p>
          <p><strong>Just right (0.98-1.02):</strong> Stable protons form atoms, enabling hydrogen fusion in stars and the chemistry of life.</p>
        </div>
      )
    },
    {
      id: 'mass-hierarchy',
      title: 'Mass Hierarchy',
      subtitle: 'Force Strength Ratios',
      description: 'Why are fundamental forces so different in strength?',
      visual: <SimpleHierarchyVisual massScale={hierarchyScale} />,
      value: hierarchyScale,
      onChange: (value: number[]) => setHierarchyScale(value[0]),
      min: 0.5,
      max: 2,
      step: 0.01,
      unit: '',
      optimal: '0.9-1.1 (optimal)',
      optimalRange: { left: ((0.9 - 0.5) / (2 - 0.5)) * 100, width: ((1.1 - 0.9) / (2 - 0.5)) * 100 },
      educatorContent: (
        <div className="text-xs text-blue-200 space-y-2">
          <p><strong>What you're seeing:</strong> Bar chart displays relative strengths of fundamental forces - gravity is 10^40 times weaker than the others.</p>
          <p><strong>The hierarchy mystery:</strong> Forces differ by 10^40 - requires 1 part in 10^34 fine-tuning. Why is gravity so incredibly weak compared to everything else?</p>
          <p><strong>Quantum puzzle:</strong> Our theories predict all forces should be roughly equal strength, like identical cakes from the same recipe. Instead, one is crumb-sized while others are normal.</p>
          <p><strong>Precision required:</strong> Like balancing the entire Earth on a needle tip and having it stay perfectly stable. This remains one of physics' greatest unsolved problems.</p>
        </div>
      )
    },
    {
      id: 'matter-antimatter',
      title: 'Matter vs Antimatter',
      subtitle: 'Cosmic Asymmetry',
      description: 'Why does matter exist instead of nothing?',
      visual: <SimpleMatterAntimatterVisual asymmetry={matterAsymmetry} />,
      value: matterAsymmetry,
      onChange: (value: number[]) => setMatterAsymmetry(value[0]),
      min: 0,
      max: 0.2,
      step: 0.001,
      unit: '%',
      optimal: '8-12% excess (optimal)',
      optimalRange: { left: ((0.08 - 0) / (0.2 - 0)) * 100, width: ((0.12 - 0.08) / (0.2 - 0)) * 100 },
      educatorContent: (
        <div className="text-xs text-blue-200 space-y-2">
          <p><strong>What you're seeing:</strong> Particle visualization shows matter/antimatter distribution - the tiny excess that became everything we see.</p>
          <p><strong>The existence puzzle:</strong> Need 8-12% matter excess, but theory is off by factor of 100 million. Why does anything exist instead of nothing?</p>
          <p><strong>What should have happened:</strong> Big Bang creates equal matter/antimatter (like equal left/right shoes). They annihilate completely, leaving only energy.</p>
          <p><strong>Miraculous leftover:</strong> Somehow 1 extra matter particle per billion pairs survived annihilation. This tiny excess became stars, planets, and us - but we don't know why.</p>
        </div>
      )
    },
    {
      id: 'proton-stability',
      title: 'Proton Stability',
      subtitle: 'Atomic Longevity',
      description: 'How long do the building blocks of atoms last?',
      visual: <TimelineProbabilityVisualMobile lifetime={protonLifetime} />,
      value: protonLifetime,
      onChange: (value: number[]) => setProtonLifetime(value[0]),
      min: 30,
      max: 40,
      step: 0.1,
      unit: ' years',
      optimal: '10³⁴-10³⁶ years (optimal)',
      optimalRange: { left: ((34 - 30) / (40 - 30)) * 100, width: ((36 - 34) / (40 - 30)) * 100 },
      educatorContent: (
        <div className="text-xs text-blue-200 space-y-2">
          <p><strong>What you're seeing:</strong> Threshold visualization showing minimum proton stability needed for cosmic complexity - this is NOT traditional fine-tuning.</p>
          <p><strong>Threshold vs Fine-Tuning:</strong> Unlike other parameters (strong force: 0.98-1.02), proton stability just needs to exceed ~10³⁰ years. Longer lifetimes (10³⁴, 10⁴⁰, ∞) work equally well.</p>
          <p><strong>Scientific reality:</strong> Protons have never been observed to decay despite decades of experiments. They may be absolutely stable (infinite lifetime), making this parameter irrelevant to fine-tuning.</p>
          <p><strong>Honest assessment:</strong> This demonstrates a threshold requirement, not precise tuning. Any value above the minimum works - there's no narrow "optimal" window like true fine-tuned parameters.</p>
          <p><strong>Educational point:</strong> Not all cosmic parameters are fine-tuned. Some are thresholds (minimum requirements), others are ranges, and only some require precise values.</p>
        </div>
      )
    }
  ]

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
    <div className="container mx-auto px-4 md:px-4">
      {/* Mobile: Optimized full-screen layout */}
      <div className="md:hidden mb-6">
        <Card className="bg-black/20 border-white/10 text-white">
          <CardContent>
                <div className="space-y-2">
                  {/* Compact header with progress */}
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
                  
                  {/* Full-height visualization */}
                  <div className="bg-black/30 rounded-lg p-3">
                    <div className="h-80 mb-3">
                      {steps[currentStep].visual}
                    </div>
                    
                    {/* Compact slider */}
                    <div className="space-y-1">
                      <div className="relative">
                        <Slider
                          value={[steps[currentStep].value]}
                          onValueChange={steps[currentStep].onChange}
                          max={steps[currentStep].max}
                          min={steps[currentStep].min}
                          step={steps[currentStep].step}
                          className="w-full"
                        />
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded pointer-events-none" 
                          style={{
                            left: `${steps[currentStep].optimalRange.left}%`,
                            width: `${steps[currentStep].optimalRange.width}%`
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Low</span>
                        <span className="text-green-400 font-medium">{steps[currentStep].optimal}</span>
                        <span className="text-white font-medium">
                          {steps[currentStep].id === 'matter-antimatter' 
                            ? `${(steps[currentStep].value * 100).toFixed(1)}${steps[currentStep].unit}`
                            : steps[currentStep].id === 'proton-stability'
                            ? `10^${steps[currentStep].value.toFixed(0)}${steps[currentStep].unit}`
                            : `${steps[currentStep].value.toFixed(2)} ${steps[currentStep].unit}`
                          }
                        </span>
                        <span>High</span>
                      </div>
                    </div>
                  </div>

                  {/* Compact navigation */}
                  <div className="flex justify-between items-center">
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

                  {/* Educator Mode Content */}
                  {educatorMode && (
                    <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      {steps[currentStep].educatorContent}
                    </div>
                  )}
                </div>
            </CardContent>
          </Card>
        </div>

      {/* Primary Controls - Desktop only */}
      <div className="hidden md:grid md:grid-cols-1 sm:md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
        {/* Quark Binding Force */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Quark Binding Force</CardTitle>
            <CardDescription className="text-gray-300">
              How tightly are the pieces of protons held together?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Visualization - Fixed Height */}
              <div className="h-48 bg-black/30 rounded-lg overflow-hidden">
                <QuarkBindingVisual strongForce={strongForce} />
              </div>
              
              {/* Current Value */}
              <div className="text-center py-2">
                <div className="text-3xl font-bold text-yellow-400 font-mono">{strongForce.toFixed(3)}</div>
                <div className={`text-xs mt-1 font-medium ${
                  strongForce >= 0.98 && strongForce <= 1.02 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {strongForce >= 0.98 && strongForce <= 1.02 ? '✅ Stable Matter' : '❌ Unstable'}
                </div>
              </div>

              {/* Slider with Optimal Range */}
              <div className="relative px-1">
                <Slider
                  value={[strongForce]}
                  onValueChange={(value) => setStrongForce(value[0])}
                  max={1.2}
                  min={0.8}
                  step={0.001}
                  className="w-full"
                />
                <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded pointer-events-none" 
                     style={{
                       left: `${((0.98 - 0.8) / (1.2 - 0.8)) * 100}%`,
                       width: `${((1.02 - 0.98) / (1.2 - 0.8)) * 100}%`
                     }}></div>
              </div>

              {/* Range Labels */}
              <div className="flex justify-between text-xs text-gray-400 px-1">
                <span>0.8</span>
                <span className="text-green-400 font-medium">0.98-1.02</span>
                <span>1.2</span>
              </div>
              
              {educatorMode && (
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="text-xs text-blue-200 space-y-2">
                    <p><strong>What you're seeing:</strong> Three quarks bound by flux tubes (gluon field) inside a proton. The visualization transitions from chaos to creation to collapse as you adjust αₛ.</p>
                    <p><strong>Critical precision:</strong> Strong force (αₛ) must be within 0.98-1.02 range - just 4% tolerance for stable matter. This represents extraordinary fine-tuning.</p>
                    <p><strong>Too weak (&lt; 0.98):</strong> Flux tubes weaken, quarks drift apart. No protons can form - just scattered energy in an empty void.</p>
                    <p><strong>Too strong (&gt; 1.02):</strong> Violent fusion reactions. All hydrogen burns instantly into heavier elements. No long-lived stars possible.</p>
                    <p><strong>Just right (0.98-1.02):</strong> Stable protons form atoms, enabling hydrogen fusion in stars and the chemistry of life.</p>
                  </div>
                </div>
              )}
            </div>
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
              {/* Visualization - Fixed Height */}
              <div className="h-48 bg-black/30 rounded-lg overflow-hidden">
                <SimpleHierarchyVisual massScale={hierarchyScale} />
              </div>
              
              {/* Current Value */}
              <div className="text-center py-2">
                <div className="text-3xl font-bold text-yellow-400 font-mono">{hierarchyScale.toFixed(2)}</div>
                <div className={`text-xs mt-1 font-medium ${
                  hierarchyScale >= 0.9 && hierarchyScale <= 1.1 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {hierarchyScale >= 0.9 && hierarchyScale <= 1.1 ? '✅ Balanced Forces' : '❌ Imbalanced'}
                </div>
              </div>

              {/* Slider with Optimal Range */}
              <div className="relative px-1">
                <Slider
                  value={[hierarchyScale]}
                  onValueChange={(value) => setHierarchyScale(value[0])}
                  max={2}
                  min={0.5}
                  step={0.01}
                  className="w-full"
                />
                <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded pointer-events-none" 
                     style={{
                       left: `${((0.9 - 0.5) / (2 - 0.5)) * 100}%`,
                       width: `${((1.1 - 0.9) / (2 - 0.5)) * 100}%`
                     }}></div>
              </div>

              {/* Range Labels */}
              <div className="flex justify-between text-xs text-gray-400 px-1">
                <span>0.5</span>
                <span className="text-green-400 font-medium">0.9-1.1</span>
                <span>2.0</span>
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
              {/* Visualization - Fixed Height */}
              <div className="h-48 bg-black/30 rounded-lg overflow-hidden">
                <SimpleMatterAntimatterVisual asymmetry={matterAsymmetry} />
              </div>
              
              {/* Current Value */}
              <div className="text-center py-2">
                <div className="text-3xl font-bold text-yellow-400 font-mono">{(matterAsymmetry * 100).toFixed(1)}%</div>
                <div className={`text-xs mt-1 font-medium ${
                  matterAsymmetry >= 0.08 && matterAsymmetry <= 0.12 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {matterAsymmetry >= 0.08 && matterAsymmetry <= 0.12 ? '✅ Matter Exists' : '❌ No Matter'}
                </div>
              </div>

              {/* Slider with Optimal Range */}
              <div className="relative px-1">
                <Slider
                  value={[matterAsymmetry]}
                  onValueChange={(value) => setMatterAsymmetry(value[0])}
                  max={0.2}
                  min={0}
                  step={0.001}
                  className="w-full"
                />
                <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded pointer-events-none" 
                     style={{
                       left: `${((0.08 - 0) / (0.2 - 0)) * 100}%`,
                       width: `${((0.12 - 0.08) / (0.2 - 0)) * 100}%`
                     }}></div>
              </div>

              {/* Range Labels */}
              <div className="flex justify-between text-xs text-gray-400 px-1">
                <span>0%</span>
                <span className="text-green-400 font-medium">8-12%</span>
                <span>20%</span>
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
              {/* Visualization - Fixed Height */}
              <div className="h-48 bg-black/30 rounded-lg overflow-hidden">
                <TimelineProbabilityVisual lifetime={protonLifetime} />
              </div>
              
              {/* Current Value */}
              <div className="text-center py-2">
                <div className="text-3xl font-bold text-yellow-400 font-mono">10^{protonLifetime.toFixed(0)}</div>
                <div className={`text-xs mt-1 font-medium ${
                  protonLifetime >= 34 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {protonLifetime >= 34 ? '✅ Stable Protons' : '❌ Decay Too Fast'}
                </div>
              </div>

              {/* Slider with Optimal Range */}
              <div className="relative px-1">
                <Slider
                  value={[protonLifetime]}
                  onValueChange={(value) => setProtonLifetime(value[0])}
                  max={40}
                  min={30}
                  step={0.1}
                  className="w-full"
                />
                <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded pointer-events-none" 
                     style={{
                       left: `${((34 - 30) / (40 - 30)) * 100}%`,
                       width: `${((36 - 34) / (40 - 30)) * 100}%`
                     }}></div>
              </div>

              {/* Range Labels */}
              <div className="flex justify-between text-xs text-gray-400 px-1">
                <span>10^30</span>
                <span className="text-green-400 font-medium">10^34+</span>
                <span>10^40</span>
              </div>
            </div>
              
              {educatorMode && (
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="text-xs text-blue-200 space-y-2">
                    <p><strong>What you're seeing:</strong> Threshold visualization showing minimum proton stability needed for cosmic complexity - this is NOT traditional fine-tuning.</p>
                    <p><strong>Threshold vs Fine-Tuning:</strong> Unlike other parameters (strong force: 0.98-1.02), proton stability just needs to exceed ~10³⁰ years. Longer lifetimes (10³⁴, 10⁴⁰, ∞) work equally well.</p>
                    <p><strong>Scientific reality:</strong> Protons have never been observed to decay despite decades of experiments. They may be absolutely stable (infinite lifetime), making this parameter irrelevant to fine-tuning.</p>
                    <p><strong>Honest assessment:</strong> This demonstrates a threshold requirement, not precise tuning. Any value above the minimum works - there's no narrow "optimal" window like true fine-tuned parameters.</p>
                    <p><strong>Educational point:</strong> Not all cosmic parameters are fine-tuned. Some are thresholds (minimum requirements), others are ranges, and only some require precise values.</p>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
