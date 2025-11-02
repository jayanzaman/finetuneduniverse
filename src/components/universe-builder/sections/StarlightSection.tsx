'use client';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Slider } from '../../ui/slider'
import { MetallicitySpectrumVisual } from './MetallicitySpectrumVisual'

// Enhanced Star Visualization Component with Death/Explosion States
function StarField({ stellarMass, metallicity, starFormationRate }: {
  stellarMass: number;
  metallicity: number;
  starFormationRate: number;
}) {
  // Optimal range: 0.8 - 1.4 solar masses
  const isTooDim = stellarMass < 0.8;
  const isTooMassive = stellarMass > 1.4;
  const isOptimal = stellarMass >= 0.8 && stellarMass <= 1.4;
  
  // Calculate star properties based on mass
  const baseSize = 50;
  let starSize, starColor, starOpacity, glowIntensity, animationType;
  
  if (isTooDim) {
    // Dying star - shrinking and dimming
    const dimFactor = stellarMass / 0.8; // 0 to 1
    starSize = baseSize * (0.3 + dimFactor * 0.7); // 30% to 100% size
    starOpacity = 0.2 + dimFactor * 0.6; // Very dim to somewhat bright
    starColor = `rgba(255, ${Math.floor(100 + dimFactor * 100)}, ${Math.floor(50 + dimFactor * 50)}, ${starOpacity})`;
    glowIntensity = dimFactor * 20; // Minimal glow
    animationType = 'dying-flicker';
  } else if (isTooMassive) {
    // Massive star - growing and changing color toward explosion
    const massFactor = Math.min((stellarMass - 1.4) / 0.6, 1); // 0 to 1 (caps at 2.0 mass)
    starSize = baseSize * (1 + massFactor * 1.5); // 100% to 250% size
    starOpacity = 0.9 + massFactor * 0.1;
    // Color shifts from yellow to blue-white to red (pre-supernova)
    if (massFactor < 0.5) {
      starColor = `rgba(${Math.floor(255 - massFactor * 100)}, ${Math.floor(255 - massFactor * 50)}, ${Math.floor(200 + massFactor * 55)}, ${starOpacity})`;
    } else {
      starColor = `rgba(255, ${Math.floor(150 - (massFactor - 0.5) * 100)}, ${Math.floor(100 - (massFactor - 0.5) * 100)}, ${starOpacity})`;
    }
    glowIntensity = 40 + massFactor * 60; // Intense glow
    animationType = massFactor > 0.7 ? 'pre-explosion' : 'massive-pulse';
  } else {
    // Optimal star - stable and bright
    starSize = baseSize + (stellarMass - 0.8) * 20;
    starOpacity = 0.9;
    starColor = `rgba(255, ${Math.floor(220 + metallicity * 35)}, ${Math.floor(150 + metallicity * 100)}, ${starOpacity})`;
    glowIntensity = 30 + metallicity * 20;
    animationType = 'stable-pulse';
  }

  return (
    <div className="relative w-full h-64 flex items-center justify-center overflow-hidden bg-black/30 rounded-lg">
      <div className="star-system">
        {/* Main Star */}
        <div 
          className={`main-star ${animationType}`}
          style={{
            width: `${starSize}px`,
            height: `${starSize}px`,
            backgroundColor: starColor,
            boxShadow: `0 0 ${glowIntensity}px ${starColor}, 0 0 ${glowIntensity * 2}px ${starColor}`,
            opacity: starOpacity,
          }}
        />
        
        {/* Explosion Effect for Massive Stars */}
        {isTooMassive && stellarMass > 1.7 && (
          <div className="explosion-ring">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i}
                className="explosion-particle"
                style={{
                  transform: `rotate(${i * 45}deg) translateX(${60 + (stellarMass - 1.7) * 40}px)`,
                  backgroundColor: `rgba(255, ${Math.floor(100 + Math.random() * 155)}, 0, 0.8)`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
        
        {/* Dying Embers for Dim Stars */}
        {isTooDim && stellarMass < 0.5 && (
          <div className="dying-embers">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i}
                className="ember"
                style={{
                  left: `${45 + Math.random() * 10}%`,
                  top: `${45 + Math.random() * 10}%`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}
        
        {/* Planetary Building Blocks Visualization */}
        {isOptimal && (
          <div className="planetary-system">
            {/* Protoplanetary Disk */}
            <div 
              className="dust-disk"
              style={{
                opacity: Math.min(metallicity * 25, 0.8),
                transform: `scale(${0.8 + metallicity * 4})`,
              }}
            />
            
            {/* Planetesimals forming in disk */}
            {metallicity > 0.005 && (
              <div className="planetesimals">
                {[...Array(Math.floor(metallicity * 200))].map((_, i) => (
                  <div 
                    key={i}
                    className="planetesimal"
                    style={{
                      left: `${30 + Math.random() * 40}%`,
                      top: `${30 + Math.random() * 40}%`,
                      backgroundColor: `rgba(${150 + Math.random() * 105}, ${100 + Math.random() * 100}, ${80 + Math.random() * 80}, 0.7)`,
                      animationDelay: `${Math.random() * 3}s`,
                      transform: `scale(${0.5 + Math.random() * 0.5})`,
                    }}
                  />
                ))}
              </div>
            )}
            
            {/* Habitable Zone Ring */}
            {metallicity > 0.01 && metallicity < 0.05 && (
              <div className="habitable-zone" style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}>
                <div className="hz-ring" />
                <div className="hz-label">Habitable Zone</div>
              </div>
            )}
            
            {/* Forming Rocky Planets */}
            {metallicity > 0.015 && metallicity < 0.04 && (
              <div className="forming-planets">
                {[...Array(Math.min(Math.floor(metallicity * 100), 3))].map((_, i) => (
                  <div 
                    key={i}
                    className="proto-planet"
                    style={{
                      left: `${40 + i * 15}%`,
                      top: `${45 + Math.sin(i) * 10}%`,
                      backgroundColor: `rgba(${120 + i * 30}, ${80 + i * 20}, ${60 + i * 15}, 0.8)`,
                      animationDelay: `${i * 0.8}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Heavy Elements Orbiting (simplified) */}
        {isOptimal && metallicity > 0.015 && (
          <div className="heavy-elements">
            {['C', 'O', 'Si', 'Fe'].slice(0, Math.floor(metallicity * 200)).map((element, i) => (
              <div 
                key={`${element}-${i}`}
                className="element-particle"
                style={{
                  backgroundColor: `rgba(${100 + i * 40}, ${150 + i * 20}, 255, ${Math.min(metallicity * 30, 0.6)})`,
                  animation: `element-orbit-${i % 4} ${3 + (i % 4) * 0.5}s linear infinite`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>
        )}
        
        {/* Status Text */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-center">
          {isTooDim && (
            <span className="text-red-400">
              {stellarMass < 0.3 ? "💀 Brown Dwarf - No Fusion" : 
               stellarMass < 0.5 ? "🔥 Dying Red Dwarf" : 
               "⚠️ Insufficient Mass"}
            </span>
          )}
          {isOptimal && (
            <span className="text-green-400">✨ Stable Main Sequence</span>
          )}
          {isTooMassive && (
            <span className="text-orange-400">
              {stellarMass > 1.8 ? "💥 Supernova Imminent!" : 
               stellarMass > 1.6 ? "🔥 Blue Supergiant" : 
               "⚠️ Massive & Unstable"}
            </span>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .star-system {
          position: relative;
          width: 200px;
          height: 200px;
        }
        .main-star {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          transition: all 0.5s ease;
        }
        .stable-pulse {
          animation: stable-pulse 3s ease-in-out infinite;
        }
        .dying-flicker {
          animation: dying-flicker 1.5s ease-in-out infinite;
        }
        .massive-pulse {
          animation: massive-pulse 1s ease-in-out infinite;
        }
        .pre-explosion {
          animation: pre-explosion 0.5s ease-in-out infinite;
        }
        .explosion-particle {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: explosion-expand 2s ease-out infinite;
        }
        .ember {
          position: absolute;
          width: 3px;
          height: 3px;
          background: rgba(255, 100, 0, 0.6);
          border-radius: 50%;
          animation: ember-fade 2s ease-in-out infinite;
        }
        .planetary-system {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 180px;
          height: 180px;
          transform: translate(-50%, -50%);
        }
        .dust-disk {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 160px;
          height: 160px;
          border: 2px solid rgba(139, 69, 19, 0.6);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, transparent 30%, rgba(139, 69, 19, 0.2) 50%, transparent 70%);
          animation: disk-rotation 20s linear infinite;
        }
        .planetesimal {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          animation: planetesimal-drift 4s ease-in-out infinite;
        }
        .habitable-zone {
          position: absolute;
          pointer-events: none;
        }
        .hz-ring {
          width: 120px;
          height: 120px;
          border: 2px dashed rgba(0, 255, 0, 0.6);
          border-radius: 50%;
          animation: hz-pulse 3s ease-in-out infinite;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
        .hz-label {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 8px;
          color: rgba(0, 255, 0, 0.8);
          white-space: nowrap;
        }
        .proto-planet {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: planet-formation 2s ease-in-out infinite;
        }
        .element-particle {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          transform-origin: 0 0;
        }
        @keyframes stable-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.05); }
        }
        @keyframes dying-flicker {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          25% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.1; }
          50% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.4; }
          75% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.2; }
        }
        @keyframes massive-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes pre-explosion {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          25% { transform: translate(-50%, -50%) scale(1.2); }
          50% { transform: translate(-50%, -50%) scale(0.9); }
          75% { transform: translate(-50%, -50%) scale(1.3); }
        }
        @keyframes explosion-expand {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(3); opacity: 0; }
        }
        @keyframes ember-fade {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.8; transform: scale(1); }
        }
        @keyframes element-orbit-0 {
          from { transform: translate(-50%, -50%) rotate(0deg) translateX(50px) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg) translateX(50px) rotate(-360deg); }
        }
        @keyframes element-orbit-1 {
          from { transform: translate(-50%, -50%) rotate(0deg) translateX(65px) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg) translateX(65px) rotate(-360deg); }
        }
        @keyframes element-orbit-2 {
          from { transform: translate(-50%, -50%) rotate(0deg) translateX(80px) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg) translateX(80px) rotate(-360deg); }
        }
        @keyframes element-orbit-3 {
          from { transform: translate(-50%, -50%) rotate(0deg) translateX(95px) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg) translateX(95px) rotate(-360deg); }
        }
        @keyframes disk-rotation {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes planetesimal-drift {
          0%, 100% { transform: translateY(0px); opacity: 0.7; }
          50% { transform: translateY(-3px); opacity: 1; }
        }
        @keyframes hz-pulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
        }
        @keyframes planet-formation {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        .spectrum-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .spectrum-bar {
          position: relative;
          height: 40px;
          margin: 10px 0;
          border-radius: 4px;
          overflow: hidden;
        }
        .rainbow-gradient {
          width: 100%;
          height: 100%;
          background: linear-gradient(to right, 
            #8b00ff 0%,   /* Violet */
            #4b0082 14%,  /* Indigo */
            #0000ff 28%,  /* Blue */
            #00ff00 42%,  /* Green */
            #ffff00 57%,  /* Yellow */
            #ff7f00 71%,  /* Orange */
            #ff0000 85%   /* Red */
          );
        }
        .absorption-lines {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .absorption-line {
          position: absolute;
          width: 2px;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
        }
        .fe-line-1 { left: 25%; }
        .fe-line-2 { left: 45%; }
        .fe-line-3 { left: 65%; }
        .ca-line-1 { left: 15%; }
        .ca-line-2 { left: 18%; }
        .na-line-1 { left: 58%; }
        .na-line-2 { left: 59%; }
        .mg-line-1 { left: 52%; }
        .ti-line-1 { left: 35%; }
        .ti-line-2 { left: 72%; }
        .si-line-1 { left: 40%; }
        .cr-line-1 { left: 48%; }
        .ni-line-1 { left: 78%; }
        .element-list {
          position: absolute;
          bottom: -20px;
          left: 0;
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          justify-content: center;
          align-items: center;
        }
        .element-tag {
          font-size: 10px;
          font-weight: bold;
          background: rgba(0, 0, 0, 0.8);
          padding: 2px 4px;
          border-radius: 3px;
          border: 1px solid currentColor;
          text-shadow: none;
          transition: opacity 0.3s ease;
        }
        .wavelength-scale {
          display: flex;
          justify-content: space-between;
          margin-top: 5px;
          padding: 0 10px;
        }
        .star-temp-indicator {
          position: absolute;
          top: 10px;
          right: 10px;
          text-align: center;
        }
        .temp-star {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          margin: 0 auto;
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  )
}

export default function StarlightSection({ 
  educatorMode, 
  cosmicTime = 0
}: { 
  educatorMode: boolean; 
  cosmicTime?: number;
}) {
  const [stellarMass, setStellarMass] = useState(1)
  const [selectedStar, setSelectedStar] = useState('sun')
  
  // Real stellar data from astronomical observations
  const stellarDatabase = {
    'popiii': { name: 'Population III', nickname: 'First Stars (Theoretical)', metallicity: 0.00001, distance: '∞ ly', age: '13.7 Gyr', type: 'Population III Primordial' },
    'hd140283': { name: 'HD 140283', nickname: '"Methuselah Star"', metallicity: 0.0004, distance: '190 ly', age: '14.5 Gyr', type: 'Population II Halo' },
    'tauceti': { name: 'Tau Ceti', nickname: 'Metal-Poor Neighbor', metallicity: 0.008, distance: '11.9 ly', age: '5.8 Gyr', type: 'Population II Disk' },
    'sun': { name: 'Sun (Sol)', nickname: 'Solar Standard', metallicity: 0.02, distance: '0 ly', age: '4.6 Gyr', type: 'Population I Disk' },
    'muleo': { name: 'μ Leonis', nickname: 'Metal-Rich Giant', metallicity: 0.04, distance: '133 ly', age: '2.5 Gyr', type: 'Population I Enriched' },
    'galcenter': { name: 'Sgr A* Region', nickname: 'Galactic Core Stars', metallicity: 0.08, distance: '26,000 ly', age: '1.0 Gyr', type: 'Super Metal-Rich' }
  }
  
  const currentStar = stellarDatabase[selectedStar as keyof typeof stellarDatabase]
  const metallicity = currentStar.metallicity
  const [starFormationRate, setStarFormationRate] = useState(1)
  const [isTimeLapseActive, setIsTimeLapseActive] = useState(false)
  const [currentCosmicAge, setCurrentCosmicAge] = useState(13.8) // Start at Big Bang

  // Mobile navigation state
  const [currentStep, setCurrentStep] = useState(0)
  
  // Define the steps in optimal order for Formation of Stars
  const steps = [
    {
      id: 'stellar-mass',
      title: 'Stellar Mass',
      subtitle: 'First Generation Stars',
      description: 'Mass of first-generation stars (in solar masses)',
      visual: <StarField stellarMass={stellarMass} metallicity={metallicity} starFormationRate={starFormationRate} />,
      value: stellarMass,
      onChange: (value: number[]) => setStellarMass(value[0]),
      min: 0.1,
      max: 2,
      step: 0.1,
      unit: 'M☉',
      optimal: '0.8-1.4 M☉ (optimal)',
      optimalRange: { left: ((0.8 - 0.1) / (2 - 0.1)) * 100, width: ((1.4 - 0.8) / (2 - 0.1)) * 100 },
      educatorContent: (
        <div className="text-xs text-blue-200 space-y-2">
          <p><strong>What you're seeing:</strong> StarField shows stellar evolution - optimal stars pulse steadily, too small stars flicker and dim, too massive stars grow unstable and approach explosion.</p>
          <p><strong>Critical mass range:</strong> Stars need 0.8-1.4 solar masses for stable hydrogen fusion lasting billions of years. This narrow window enables planetary systems and life.</p>
          <p><strong>Too small = stellar death:</strong> Below 0.8 M☉, stars can't sustain fusion and become dim red dwarfs or brown dwarfs. No energy for complex chemistry.</p>
          <p><strong>Too massive = stellar explosion:</strong> Above 1.4 M☉, stars burn too fast and explode as supernovae within millions of years. No time for life to evolve.</p>
        </div>
      )
    },
    {
      id: 'metallicity',
      title: 'Metallicity',
      subtitle: 'Heavy Element Content',
      description: 'Fraction of heavy elements in stellar composition',
      visual: <MetallicitySpectrumVisual 
        metallicity={metallicity} 
        starName={currentStar.name} 
        starType={currentStar.type}
        selectedStar={selectedStar}
        onStarChange={setSelectedStar}
        starOptions={[
          { value: 'popiii', label: 'Population III (0.00001)', description: 'First Stars - No Heavy Elements', metallicity: 0.00001, nickname: 'First Stars (Theoretical)' },
          { value: 'hd140283', label: 'HD 140283 (0.0004)', description: 'Methuselah Star - Ancient', metallicity: 0.0004, nickname: '"Methuselah Star"' },
          { value: 'tauceti', label: 'Tau Ceti (0.008)', description: 'Metal-Poor Neighbor', metallicity: 0.008, nickname: 'Metal-Poor Neighbor' },
          { value: 'sun', label: 'Sun (0.02)', description: 'Solar Standard - Optimal', metallicity: 0.02, nickname: 'Solar Standard' },
          { value: 'muleo', label: 'μ Leonis (0.04)', description: 'Metal-Rich Giant', metallicity: 0.04, nickname: 'Metal-Rich Giant' },
          { value: 'galcenter', label: 'Galactic Core (0.08)', description: 'Super Metal-Rich', metallicity: 0.08, nickname: 'Galactic Core Stars' }
        ]}
      />,
      value: metallicity,
      onChange: (value: string) => setSelectedStar(value),
      isSelector: true,
      options: [
        { value: 'popiii', label: 'Population III (0.00001)', description: 'First Stars - No Heavy Elements' },
        { value: 'hd140283', label: 'HD 140283 (0.0004)', description: 'Methuselah Star - Ancient' },
        { value: 'tauceti', label: 'Tau Ceti (0.008)', description: 'Metal-Poor Neighbor' },
        { value: 'sun', label: 'Sun (0.02)', description: 'Solar Standard - Optimal' },
        { value: 'muleo', label: 'μ Leonis (0.04)', description: 'Metal-Rich Giant' },
        { value: 'galcenter', label: 'Galactic Core (0.08)', description: 'Super Metal-Rich' }
      ],
      optimal: 'Sun (0.02) - Solar Standard',
      educatorContent: (
        <div className="text-xs text-blue-200 space-y-2">
          <p><strong>What you're seeing:</strong> Star color and properties change with metallicity - metal-rich stars burn differently and can form rocky planets.</p>
          <p><strong>Heavy elements required:</strong> Stars need ~2% heavy elements (metals) to form rocky planets. First stars had zero metals - only hydrogen and helium.</p>
          <p><strong>Stellar nucleosynthesis:</strong> Stars forge heavy elements in their cores and scatter them when they die. Each generation enriches the galaxy with more metals.</p>
          <p><strong>Planet formation threshold:</strong> Below 1% metallicity, rocky planets can't form. Above 4%, gas giants migrate inward and destroy terrestrial worlds.</p>
        </div>
      )
    },
    {
      id: 'formation-rate',
      title: 'Star Formation Rate',
      subtitle: 'Stellar Birth Rate',
      description: 'Rate of stellar birth in early galaxies',
      visual: <StarField stellarMass={stellarMass} metallicity={metallicity} starFormationRate={starFormationRate} />,
      value: starFormationRate,
      onChange: (value: number[]) => setStarFormationRate(value[0]),
      min: 0.1,
      max: 2,
      step: 0.1,
      unit: 'M☉/yr',
      optimal: '0.8-1.5 M☉/yr (optimal)',
      optimalRange: { left: ((0.8 - 0.1) / (2 - 0.1)) * 100, width: ((1.5 - 0.8) / (2 - 0.1)) * 100 },
      educatorContent: (
        <div className="text-xs text-blue-200 space-y-2">
          <p><strong>What you're seeing:</strong> Formation rate affects stellar density and interactions - optimal rates create stable stellar neighborhoods for planetary systems.</p>
          <p><strong>Goldilocks star formation:</strong> Need 0.8-1.5 solar masses per year in local regions. Too slow = not enough heavy elements, too fast = destructive stellar interactions.</p>
          <p><strong>Cosmic evolution:</strong> Star formation peaked 10 billion years ago, then declined. We live in the optimal era for complex chemistry and stable systems.</p>
          <p><strong>Stellar feedback:</strong> High formation rates create stellar winds and supernovae that disrupt planet formation. Low rates provide insufficient heavy elements for rocky worlds.</p>
        </div>
      )
    }
  ]

  // Time-lapse animation effect
  useEffect(() => {
    if (!isTimeLapseActive) return

    const interval = setInterval(() => {
      setCurrentCosmicAge(prevAge => {
        const newAge = prevAge - 0.2 // Progress forward in time (age decreases)
        
        // Determine formation rate based on cosmic age
        let newRate
        if (newAge > 13.0) {
          newRate = 0.1 // Dark Ages
        } else if (newAge > 11.0) {
          newRate = 0.5 // First Light
        } else if (newAge > 8.0) {
          newRate = 1.5 // Peak Era
        } else if (newAge > 4.6) {
          newRate = 1.2 // Post-Peak
        } else if (newAge > 0) {
          newRate = 1.0 // Modern Era
        } else {
          // Reset to beginning
          setIsTimeLapseActive(false)
          return 13.8
        }
        
        setStarFormationRate(newRate)
        return newAge
      })
    }, 500) // Update every 500ms

    return () => clearInterval(interval)
  }, [isTimeLapseActive])

  useEffect(() => {
    const handleRandomize = () => {
      setStellarMass(0.1 + Math.random() * 1.9)
      // Randomly select a star for metallicity
      const starKeys = Object.keys(stellarDatabase)
      const randomStar = starKeys[Math.floor(Math.random() * starKeys.length)]
      setSelectedStar(randomStar)
      setStarFormationRate(0.1 + Math.random() * 1.9)
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
                
                {/* Compact control - only for non-selector steps */}
                {!steps[currentStep].isSelector && (
                  <div className="space-y-1">
                    <div className="relative">
                      <Slider
                        value={[steps[currentStep].value as number]}
                        onValueChange={steps[currentStep].onChange as (value: number[]) => void}
                        max={steps[currentStep].max}
                        min={steps[currentStep].min}
                        step={steps[currentStep].step}
                        className="w-full"
                      />
                      {steps[currentStep].optimalRange && (
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded pointer-events-none" 
                          style={{
                            left: `${steps[currentStep].optimalRange.left}%`,
                            width: `${steps[currentStep].optimalRange.width}%`
                          }}
                        />
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Low</span>
                      <span className="text-green-400 font-medium">{steps[currentStep].optimal}</span>
                      <span className="text-white font-medium">
                        {`${steps[currentStep].value.toFixed(1)} ${steps[currentStep].unit}`}
                      </span>
                      <span>High</span>
                    </div>
                  </div>
                )}
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
      <div className="hidden md:grid md:grid-cols-1 sm:md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
        {/* Stellar Mass */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Stellar Mass</CardTitle>
            <CardDescription className="text-gray-300">
              Mass of first-generation stars (in solar masses)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StarField 
              stellarMass={stellarMass}
              metallicity={metallicity}
              starFormationRate={starFormationRate}
            />
            <div className="relative mt-4">
              <Slider
                value={[stellarMass]}
                onValueChange={(value) => setStellarMass(value[0])}
                max={2}
                min={0.1}
                step={0.1}
                className="w-full"
              />
              <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-green-500/30 rounded" 
                   style={{
                     left: `${((0.8 - 0.1) / (2 - 0.1)) * 100}%`,
                     width: `${((1.4 - 0.8) / (2 - 0.1)) * 100}%`
                   }}></div>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-4">
              <span>Red Dwarf</span>
              <span className="text-green-400 font-bold">0.8-1.4 M☉ (optimal)</span>
              <span className="text-white font-medium">{stellarMass.toFixed(1)} M☉</span>
              <span>Supergiant</span>
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> StarField visualization shows stellar nucleosynthesis - how stars forge heavy elements through nuclear fusion.</p>
                  <p><strong>Mass matters:</strong> Stars need 0.8-1.4 solar masses for optimal heavy element production. Too small = insufficient fusion, too large = short-lived supergiants.</p>
                  <p><strong>The triple-alpha process:</strong> Carbon formation requires three helium nuclei to collide simultaneously - astronomically unlikely without precise energy resonance.</p>
                  <p><strong>Cosmic seeding:</strong> These first stars created and dispersed carbon, oxygen, silicon, and iron - the building blocks for planets and life.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metallicity */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Metallicity</CardTitle>
            <CardDescription className="text-gray-300">
              Fraction of heavy elements in stellar composition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-black/30 rounded-lg p-4 mb-4 relative overflow-hidden">
              {/* Stellar Spectrum Visualization */}
              <div className="spectrum-container">
                {/* Title */}
                <div className="text-xs text-gray-300 mb-2 text-center">Stellar Spectrum Analysis</div>
                
                {/* Rainbow Spectrum Bar */}
                <div className="spectrum-bar">
                  <div className="rainbow-gradient" />
                  
                  {/* Absorption Lines */}
                  <div className="absorption-lines">
                    {/* Iron (Fe) Lines - Multiple strong lines */}
                    {metallicity > 0.0003 && (
                      <>
                        <div className="absorption-line fe-line-1" style={{ opacity: Math.min(metallicity * 40, 0.9) }} />
                        <div className="absorption-line fe-line-2" style={{ opacity: Math.min(metallicity * 35, 0.8) }} />
                        <div className="absorption-line fe-line-3" style={{ opacity: Math.min(metallicity * 45, 0.9) }} />
                      </>
                    )}
                    
                    {/* Calcium (Ca) H&K Lines */}
                    {metallicity > 0.0005 && (
                      <>
                        <div className="absorption-line ca-line-1" style={{ opacity: Math.min(metallicity * 30, 0.8) }} />
                        <div className="absorption-line ca-line-2" style={{ opacity: Math.min(metallicity * 25, 0.7) }} />
                      </>
                    )}
                    
                    {/* Sodium (Na) D Lines */}
                    {metallicity > 0.001 && (
                      <>
                        <div className="absorption-line na-line-1" style={{ opacity: Math.min(metallicity * 25, 0.7) }} />
                        <div className="absorption-line na-line-2" style={{ opacity: Math.min(metallicity * 23, 0.7) }} />
                      </>
                    )}
                    
                    {/* Magnesium (Mg) Lines */}
                    {metallicity > 0.003 && (
                      <div className="absorption-line mg-line-1" style={{ opacity: Math.min(metallicity * 20, 0.7) }} />
                    )}
                    
                    {/* Titanium (Ti) Lines */}
                    {metallicity > 0.005 && (
                      <>
                        <div className="absorption-line ti-line-1" style={{ opacity: Math.min(metallicity * 18, 0.6) }} />
                        <div className="absorption-line ti-line-2" style={{ opacity: Math.min(metallicity * 16, 0.6) }} />
                      </>
                    )}
                    
                    {/* Silicon (Si) Lines */}
                    {metallicity > 0.008 && (
                      <div className="absorption-line si-line-1" style={{ opacity: Math.min(metallicity * 15, 0.6) }} />
                    )}
                    
                    {/* Chromium (Cr) Lines */}
                    {metallicity > 0.01 && (
                      <div className="absorption-line cr-line-1" style={{ opacity: Math.min(metallicity * 12, 0.5) }} />
                    )}
                    
                    {/* Nickel (Ni) Lines */}
                    {metallicity > 0.015 && (
                      <div className="absorption-line ni-line-1" style={{ opacity: Math.min(metallicity * 10, 0.5) }} />
                    )}
                  </div>
                  
                  {/* Element Labels - Compact List Below Spectrum */}
                  <div className="element-list">
                    {[
                      { key: 'fe', name: 'Fe', threshold: 0.0003, multiplier: 40, color: '#ff6b6b' },
                      { key: 'ca', name: 'Ca', threshold: 0.0005, multiplier: 30, color: '#4ecdc4' },
                      { key: 'na', name: 'Na', threshold: 0.001, multiplier: 25, color: '#ffd93d' },
                      { key: 'mg', name: 'Mg', threshold: 0.003, multiplier: 20, color: '#45b7d1' },
                      { key: 'ti', name: 'Ti', threshold: 0.005, multiplier: 18, color: '#c44569' },
                      { key: 'si', name: 'Si', threshold: 0.008, multiplier: 15, color: '#96ceb4' },
                      { key: 'cr', name: 'Cr', threshold: 0.01, multiplier: 12, color: '#a55eea' },
                      { key: 'ni', name: 'Ni', threshold: 0.015, multiplier: 10, color: '#fd79a8' }
                    ].filter(element => metallicity > element.threshold).map((element, index) => (
                      <span 
                        key={element.key}
                        className="element-tag"
                        style={{ 
                          color: element.color,
                          opacity: Math.min(metallicity * element.multiplier, 1)
                        }}
                      >
                        {element.name}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Wavelength Scale */}
                <div className="wavelength-scale">
                  <span className="text-xs text-purple-300">400nm</span>
                  <span className="text-xs text-blue-300">450nm</span>
                  <span className="text-xs text-green-300">550nm</span>
                  <span className="text-xs text-yellow-300">600nm</span>
                  <span className="text-xs text-red-300">700nm</span>
                </div>
                
                {/* Star Color Temperature Indicator */}
                <div className="star-temp-indicator">
                  <div 
                    className="temp-star"
                    style={{
                      backgroundColor: `rgb(${255 - metallicity * 500}, ${240 - metallicity * 300}, ${200 - metallicity * 200})`,
                      boxShadow: `0 0 15px rgb(${255 - metallicity * 500}, ${240 - metallicity * 300}, ${200 - metallicity * 200})`,
                    }}
                  />
                  <div className="text-xs text-gray-300 mt-1">
                    {metallicity < 0.01 ? "Hot Blue-White" :
                     metallicity < 0.03 ? "Yellow (Sun-like)" :
                     "Cool Red Giant"}
                  </div>
                </div>
                
                {/* Metallicity Reading */}
                <div className="absolute bottom-2 right-2 text-right">
                  <div className="text-xs text-gray-400">Metallicity [Fe/H]</div>
                  <div className="text-sm font-bold text-white">
                    {metallicity < 0.001 ? "-∞" : 
                     metallicity < 0.01 ? `${(Math.log10(metallicity / 0.02)).toFixed(1)}` :
                     `+${(Math.log10(metallicity / 0.02)).toFixed(1)}`}
                  </div>
                </div>
              </div>
            </div>
            {/* Observatory Telescope Selector */}
            <div className="space-y-3">
              <div className="text-sm text-gray-300 mb-2">🔭 Select Target Star:</div>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(stellarDatabase).map(([key, star]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedStar(key)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedStar === key 
                        ? 'bg-blue-600/30 border-blue-400 text-white' 
                        : 'bg-black/20 border-white/20 text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{star.name}</div>
                        <div className="text-xs text-gray-400">{star.nickname}</div>
                        <div className="text-xs text-blue-300 mt-1">{star.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white">{(star.metallicity * 100).toFixed(2)}%</div>
                        <div className="text-xs text-gray-400">{star.distance}</div>
                        <div className="text-xs text-gray-500">{star.age}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Current Star Info */}
            <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="text-sm text-green-200">
                <strong>Observing:</strong> {currentStar.name} • <strong>Metallicity:</strong> {(metallicity * 100).toFixed(3)}% • <strong>[Fe/H]:</strong> {metallicity < 0.001 ? "-∞" : (Math.log10(metallicity / 0.02)).toFixed(1)}
              </div>
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> A stellar spectrum showing how astronomers actually measure metallicity. The rainbow bar represents starlight spread into its component wavelengths (like a prism), while dark absorption lines reveal which elements are present in the star's atmosphere.</p>
                  <p><strong>Reading the spectrum:</strong> Each element absorbs light at specific wavelengths, creating dark lines. More metallicity = more absorption lines and stronger/darker existing lines. Watch as Fe, Ca, Na, Mg, Ti, Si, Cr, and Ni lines appear and intensify as you select more metal-rich stars.</p>
                  <p><strong>The [Fe/H] scale:</strong> Astronomers use logarithmic notation where 0.0 = solar metallicity, negative values = metal-poor stars, positive = metal-rich. The star's color also shifts from blue-white (metal-poor) to yellow (solar) to red (metal-rich).</p>
                  <p><strong>Solar metallicity:</strong> Our Sun has ~2% heavy elements ([Fe/H] ≈ 0.0), which is optimal for planet formation and complex chemistry.</p>
                  <div className="p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg mt-2">
                    <p className="text-yellow-200"><strong>🌟 The Population III Mystery - The Ultimate Fine-Tuning Paradox:</strong></p>
                    <div className="text-xs text-yellow-100 mt-2 space-y-1">
                      <p><strong>The Problem:</strong> The first stars (Population III) had ZERO metallicity - only hydrogen and helium from Big Bang nucleosynthesis. But how did they form without heavy elements to cool the gas clouds?</p>
                      <p><strong>The Paradox:</strong> Modern star formation requires dust grains (made of heavy elements) to cool gas from 10,000K to 10K. Population III had no dust, yet somehow formed anyway at much higher temperatures.</p>
                      <p><strong>The Stakes:</strong> If Population III stars hadn't formed, there would be no heavy elements, no planets, no life. The universe would be forever stuck with only hydrogen and helium.</p>
                      <p><strong>The Evidence:</strong> We've never directly observed a Population III star - they all died 13+ billion years ago. We only know they existed because we see their heavy element "fingerprints" in ancient Population II stars.</p>
                      <p><strong>The Fine-Tuning:</strong> The conditions had to be EXACTLY right - dark matter halos massive enough to trap gas, but not so massive that they collapsed into black holes before forming stars.</p>
                    </div>
                  </div>
                  <p><strong>Goldilocks zone:</strong> Too little metallicity = no planets, too much = runaway stellar formation disrupts galactic structure.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Star Formation Rate */}
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-white">Star Formation Rate</CardTitle>
                <CardDescription className="text-gray-300">
                  Rate of stellar birth in early galaxies
                </CardDescription>
              </div>
              
              {/* Time-Lapse Controls */}
              <div className="flex items-center gap-2">
                {/* Play/Pause Button */}
                <button
                  onClick={() => setIsTimeLapseActive(!isTimeLapseActive)}
                  className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-300 ${
                    isTimeLapseActive 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105' 
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105'
                  }`}
                >
                  <div className={`w-3 h-3 flex items-center justify-center transition-transform duration-300 ${
                    isTimeLapseActive ? 'scale-110' : 'scale-100'
                  }`}>
                    {isTimeLapseActive ? (
                      <div className="flex gap-0.5">
                        <div className="w-0.5 h-2 bg-white rounded-full"></div>
                        <div className="w-0.5 h-2 bg-white rounded-full"></div>
                      </div>
                    ) : (
                      <div className="w-0 h-0 border-l-[4px] border-l-white border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent ml-0.5"></div>
                    )}
                  </div>
                  <span className="font-semibold">
                    {isTimeLapseActive ? 'Pause' : 'Play'}
                  </span>
                  <div className={`absolute inset-0 rounded-lg bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                </button>
                
                {/* Reset Button */}
                <button
                  onClick={() => {
                    setCurrentCosmicAge(13.8)
                    setStarFormationRate(0.1)
                    setIsTimeLapseActive(false)
                  }}
                  className="group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 text-white font-medium text-xs shadow-md shadow-slate-600/25 hover:shadow-slate-600/40 hover:scale-105 transition-all duration-300"
                >
                  <div className="w-3 h-3 flex items-center justify-center">
                    <div className="w-2 h-2 border-2 border-white border-t-transparent rounded-full animate-spin group-hover:animate-none transition-all duration-300"></div>
                  </div>
                  <span className="font-semibold">Reset</span>
                  <div className="absolute inset-0 rounded-lg bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Cosmic Timeline & Factory Settings Combined */}
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-300">Universe Factory Settings</div>
                
                {/* Current Status - Modern UI */}
                <div className="flex items-center gap-3 px-3 py-1.5 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-lg border border-slate-600/30 backdrop-blur-sm min-w-[280px]">
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <div className={`w-2 h-2 rounded-full ${
                      starFormationRate <= 0.6 ? 'bg-blue-400 animate-pulse' :
                      starFormationRate > 1.5 ? 'bg-red-400 animate-pulse' : 
                      'bg-green-400 animate-pulse'
                    }`}></div>
                    <span className="text-xs font-medium text-white truncate">
                      {starFormationRate <= 0.2 ? 'Shutdown' :
                       starFormationRate <= 0.6 ? 'Maintenance Mode' :
                       starFormationRate <= 1.1 ? 'Standard Operation' :
                       starFormationRate <= 1.6 ? 'High Demand' : 'Emergency Production'}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-slate-500/50 flex-shrink-0"></div>
                  <div className="flex items-center gap-3 text-xs text-slate-300 min-w-[100px]">
                    <span className="min-w-[35px]"><strong className="text-white">{starFormationRate.toFixed(1)}x</strong> Rate</span>
                    <span className="min-w-[45px]"><strong className="text-white">{Math.min(100, starFormationRate * 50).toFixed(0)}%</strong> Eff</span>
                  </div>
                </div>
              </div>
              
              {/* Animated Timeline Visualization */}
              <div className="relative bg-black/40 rounded-lg p-3 mb-4">
                <div className="text-xs text-gray-400 mb-2 text-center">Cosmic Star Formation History</div>
                
                <div className="relative h-8 bg-gradient-to-r from-purple-900 via-blue-600 to-orange-500 rounded overflow-hidden">
                  {/* Timeline markers */}
                  <div className="absolute inset-0 flex items-center justify-between px-2">
                    <span className="text-xs text-white font-bold">13.8 Gya</span>
                    <span className="text-xs text-white font-bold">Peak (10 Gya)</span>
                    <span className="text-xs text-white font-bold">Today</span>
                  </div>
                  
                  {/* Animated position indicator */}
                  <div 
                    className={`absolute top-0 w-2 h-full bg-white shadow-lg transition-all duration-500 ${
                      isTimeLapseActive ? 'animate-pulse' : ''
                    }`}
                    style={{ 
                      left: `${Math.max(0, Math.min(100, ((13.8 - currentCosmicAge) / 13.8) * 100))}%`
                    }}
                  />
                  
                  {/* Progress fill */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-white/20 transition-all duration-500"
                    style={{ 
                      width: `${Math.max(0, Math.min(100, ((13.8 - currentCosmicAge) / 13.8) * 100))}%`
                    }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Big Bang</span>
                  <span>Star Formation Peak</span>
                  <span>Present Day</span>
                </div>
                
                {/* Current Age Display */}
                <div className="text-center mt-2">
                  <div className="text-sm font-bold text-white">
                    {currentCosmicAge.toFixed(1)} Gya 
                    <span className="text-xs text-gray-400 ml-2">
                      ({currentCosmicAge > 13.0 ? 'Dark Ages' :
                        currentCosmicAge > 11.0 ? 'First Light Era' :
                        currentCosmicAge > 8.0 ? 'Peak Formation Era' :
                        currentCosmicAge > 4.6 ? 'Post-Peak Era' :
                        'Modern Era'})
                    </span>
                  </div>
                  {isTimeLapseActive && (
                    <div className="text-xs text-blue-300 mt-1 animate-pulse">
                      ⏰ Time-lapse in progress... Factory settings auto-adjusting
                    </div>
                  )}
                </div>
              </div>

              {/* Era-Based Factory Settings */}
              <div className="grid grid-cols-1 gap-2">
                {[
                  { 
                    key: 'dark_ages', 
                    label: 'Dark Ages Era', 
                    rate: 0.1, 
                    era: '13.8-13.0 Gya',
                    description: 'Before first stars - factory not yet built', 
                    status: 'danger',
                    cosmicEvent: 'Recombination complete, no stars yet'
                  },
                  { 
                    key: 'first_light', 
                    label: 'First Light Era', 
                    rate: 0.5, 
                    era: '13.0-11.0 Gya',
                    description: 'Population III stars ignite - factory startup', 
                    status: 'warning',
                    cosmicEvent: 'First stars end cosmic dark ages'
                  },
                  { 
                    key: 'modern', 
                    label: 'Modern Era', 
                    rate: 1.0, 
                    era: '4.6 Gya-Today',
                    description: 'Current galactic production rate', 
                    status: 'success',
                    cosmicEvent: 'Solar system formation, life emerges'
                  },
                  { 
                    key: 'peak', 
                    label: 'Peak Production Era', 
                    rate: 1.5, 
                    era: '11.0-8.0 Gya',
                    description: 'Maximum cosmic star formation rate', 
                    status: 'success',
                    cosmicEvent: 'Universe reaches peak star formation'
                  },
                  { 
                    key: 'starburst', 
                    label: 'Starburst Events', 
                    rate: 2.0, 
                    era: 'Various Times',
                    description: 'Galaxy mergers trigger extreme production', 
                    status: 'danger',
                    cosmicEvent: 'Galactic collisions, rapid gas consumption'
                  }
                ].map((setting) => (
                  <button
                    key={setting.key}
                    onClick={() => setStarFormationRate(setting.rate)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      Math.abs(starFormationRate - setting.rate) < 0.05
                        ? setting.status === 'success' 
                          ? 'bg-green-600/30 border-green-400 text-white' 
                          : setting.status === 'warning'
                          ? 'bg-yellow-600/30 border-yellow-400 text-white'
                          : 'bg-red-600/30 border-red-400 text-white'
                        : 'bg-black/20 border-white/20 text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          {setting.status === 'success' ? '🟢' : setting.status === 'warning' ? '🟡' : '🔴'}
                          {setting.label}
                        </div>
                        <div className="text-xs text-blue-300 font-medium">{setting.era}</div>
                        <div className="text-xs text-gray-400 mt-1">{setting.description}</div>
                        <div className="text-xs text-purple-300 mt-1 italic">{setting.cosmicEvent}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white">{setting.rate}x</div>
                        <div className="text-xs text-gray-400">
                          {setting.rate <= 0.3 ? 'Dormant' :
                           setting.rate <= 0.7 ? 'Startup' :
                           setting.rate <= 1.2 ? 'Standard' :
                           setting.rate <= 1.6 ? 'Peak' : 'Extreme'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {educatorMode && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="text-xs text-blue-200 space-y-2">
                  <p><strong>What you're seeing:</strong> An interactive cosmic timeline showing how star formation rates changed throughout the universe's 13.8-billion-year history. Each era represents different cosmic conditions that drove stellar birth.</p>
                  <p><strong>The timeline:</strong> Watch the white indicator move as you play the time-lapse, showing how formation rates evolved from the Dark Ages (no stars) through the Peak Era (maximum formation) to today's Modern Era.</p>
                  <p><strong>Era controls:</strong> Click any cosmic era to jump to that period and see how environmental conditions - gas density, temperature, and galactic evolution - determined star formation rates.</p>
                  <div className="p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg mt-2">
                    <p className="text-yellow-200"><strong>⚖️ Fine-Tuning Insight:</strong></p>
                    <p className="text-yellow-100 mt-1">The Peak Era (11-8 Gya) was crucial - it produced most heavy elements while leaving enough gas for later generations. Too early and no heavy elements exist; too late and gas is depleted.</p>
                  </div>
                  <p><strong>Population III mystery:</strong> The first stars had to form without any heavy elements to cool gas clouds - a seemingly impossible bootstrap problem that somehow worked perfectly.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
