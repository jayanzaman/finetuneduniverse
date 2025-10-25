'use client';

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../ui/button'
import { RotateCcw, Shuffle } from 'lucide-react'
import { useSwipeable } from 'react-swipeable'

// Section Components
import BeginningSection from './sections/BeginningSection'
import MatterSection from './sections/MatterSection'
import StarlightSection from './sections/StarlightSection'
import GalacticHeartSection from './sections/GalacticHeartSection'
import PlanetsSection from './sections/PlanetsSection'
import AbiogenesisLabSection from './sections/AbiogenesisLabSection'
import ComplexitySection from './sections/ComplexitySection'

export default function UniverseBuilderApp() {
  const [currentSection, setCurrentSection] = useState(0)
  const [educatorMode, setEducatorMode] = useState(false)
  const [cosmicTime, setCosmicTime] = useState(0)

  const sections = [
    { id: 0, title: 'The Beginning', subtitle: 'Low Entropy Start', component: BeginningSection },
    { id: 1, title: 'Formation of Matter', subtitle: 'Quarks to Atoms', component: MatterSection },
    { id: 2, title: 'Formation of Stars', subtitle: 'First Stars', component: StarlightSection },
    { id: 3, title: 'Formation of Galaxy', subtitle: 'Blackhole at the Heart', component: GalacticHeartSection },
    { id: 4, title: 'Planets & Habitability', subtitle: 'Goldilocks Zone', component: PlanetsSection },
    { id: 5, title: 'Abiogenesis Lab', subtitle: 'From Chemistry to Codes', component: AbiogenesisLabSection },
    { id: 6, title: 'Evolution', subtitle: 'Beginning of Species', component: ComplexitySection }
  ]

  const CurrentSectionComponent = sections[currentSection].component

  const handleNext = useCallback(() => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
    }
  }, [currentSection, sections.length])

  const handlePrevious = useCallback(() => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }, [currentSection])

  const handleReset = () => {
    setCurrentSection(0)
    window.location.reload()
  }

  const handleRandomize = () => {
    window.dispatchEvent(new CustomEvent('randomizeUniverse'))
  }


  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrevious()
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentSection, handleNext, handlePrevious])

  // Cosmic time evolution
  useEffect(() => {
    const interval = setInterval(() => {
      setCosmicTime(prev => prev + 0.1)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // Swipe handlers for mobile navigation
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handlePrevious(),  // Swipe left = go back (like turning pages)
    onSwipedRight: () => handleNext(),     // Swipe right = go forward (like turning pages)
    trackMouse: false, // Only track touch, not mouse
    preventScrollOnSwipe: false,
    delta: 50, // Minimum swipe distance
  })

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent truncate">
                Our Finetuned Universe
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Exploring the Improbable Path to Complexity</p>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEducatorMode(!educatorMode)}
                className="bg-white/5 border-white/20 hover:bg-white/10 text-white min-h-[44px] px-3 sm:px-4 text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">{educatorMode ? 'Student Mode' : 'Educator Mode'}</span>
                <span className="sm:hidden">{educatorMode ? 'Student' : 'Educator'}</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRandomize}
                className="bg-white/5 border-white/20 hover:bg-white/10 text-white min-h-[44px] min-w-[44px]"
                title="Randomize Parameters"
              >
                <Shuffle className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
                className="bg-white/5 border-white/20 hover:bg-white/10 text-white min-h-[44px] min-w-[44px]"
                title="Reset to Defaults"
              >
                <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="fixed top-[73px] left-0 right-0 z-40 h-1 bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-red-500"
          initial={{ width: 0 }}
          animate={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Section Navigation */}
      <nav className="fixed top-[73px] sm:top-[81px] left-0 right-0 z-40 bg-black/70 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-2 sm:px-4 py-2">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
            {sections.map((section, idx) => (
              <button
                key={section.id}
                onClick={() => setCurrentSection(idx)}
                className={`flex-shrink-0 snap-start px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm transition-all min-w-[100px] sm:min-w-[120px] min-h-[44px] rounded-lg mx-1 ${
                  currentSection === idx
                    ? 'text-orange-400 bg-orange-400/10 border border-orange-400/30'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                <div className="font-semibold text-xs sm:text-sm leading-tight">{section.title}</div>
                <div className="text-xs opacity-70 hidden sm:block">{section.subtitle}</div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-[160px] sm:pt-[180px] pb-20" {...swipeHandlers}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <CurrentSectionComponent 
              educatorMode={educatorMode} 
              cosmicTime={cosmicTime}
            />
          </motion.div>
        </AnimatePresence>
      </main>


      {/* Navigation Controls */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-4">
        <Button
          onClick={handlePrevious}
          disabled={currentSection === 0}
          variant="outline"
          className="bg-black/50 backdrop-blur-md border-white/20 hover:bg-white/10 disabled:opacity-30 text-white"
        >
          Previous
        </Button>
        
        <div className="bg-black/50 backdrop-blur-md border border-white/20 rounded-full px-4 py-2">
          <span className="text-sm font-medium text-white">
            {currentSection + 1} / {sections.length}
          </span>
        </div>

        <Button
          onClick={handleNext}
          disabled={currentSection === sections.length - 1}
          variant="outline"
          className="bg-black/50 backdrop-blur-md border-white/20 hover:bg-white/10 disabled:opacity-30 text-white"
        >
          Next
        </Button>
      </div>

      {/* Background Stars */}
      <div className="fixed inset-0 -z-10 opacity-50">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>
      
      <style jsx>{`
        .stars {
          width: 1px;
          height: 1px;
          background: transparent;
          box-shadow: 
            1541px 1046px #FFF, 1446px 906px #FFF, 1081px 1395px #FFF, 1051px 1729px #FFF,
            1847px 1064px #FFF, 1831px 1427px #FFF, 1756px 1729px #FFF, 1064px 1729px #FFF,
            1081px 1395px #FFF, 1051px 1729px #FFF, 1847px 1064px #FFF, 1831px 1427px #FFF;
          animation: animStar 50s linear infinite;
        }
        
        .stars2 {
          width: 2px;
          height: 2px;
          background: transparent;
          box-shadow: 
            700px 400px #FFF, 400px 600px #FFF, 800px 200px #FFF, 1200px 800px #FFF,
            300px 1200px #FFF, 1600px 400px #FFF, 200px 1000px #FFF, 1400px 1200px #FFF;
          animation: animStar 100s linear infinite;
        }
        
        .stars3 {
          width: 3px;
          height: 3px;
          background: transparent;
          box-shadow: 
            500px 300px #FFF, 1100px 500px #FFF, 300px 900px #FFF, 1500px 300px #FFF,
            900px 1100px #FFF, 100px 700px #FFF, 1300px 900px #FFF, 700px 1300px #FFF;
          animation: animStar 150s linear infinite;
        }
        
        @keyframes animStar {
          from { transform: translateY(0px); }
          to { transform: translateY(-2000px); }
        }
      `}</style>
    </div>
  )
}
