'use client';

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface StarFormationRateVisualProps {
  starFormationRate: number;
}

export function StarFormationRateVisual({ starFormationRate }: StarFormationRateVisualProps) {
  const [currentEra, setCurrentEra] = useState(0)

  // Define cosmic eras based on star formation rate
  const eras = [
    {
      name: 'Dark Ages Era',
      period: '13.8-13.0 Gya',
      rate: '0.1x',
      status: 'Dormant',
      description: 'Before first stars - factory not yet built',
      color: 'from-gray-800 to-black',
      icon: '🌑'
    },
    {
      name: 'First Light Era', 
      period: '13.0-11.0 Gya',
      rate: '0.5x',
      status: 'Startup',
      description: 'Population III stars ignite - factory startup',
      color: 'from-blue-600 to-purple-700',
      icon: '💫'
    },
    {
      name: 'Peak Production Era',
      period: '11.0-8.0 Gya', 
      rate: '1.5x',
      status: 'Peak',
      description: 'Maximum cosmic star formation rate',
      color: 'from-orange-500 to-red-600',
      icon: '🌟'
    },
    {
      name: 'Modern Era',
      period: '4.6 Gya-Today',
      rate: '1x',
      status: 'Standard',
      description: 'Current galactic production rate',
      color: 'from-green-500 to-blue-500',
      icon: '🌍'
    }
  ]

  // Determine current era based on formation rate
  useEffect(() => {
    if (starFormationRate <= 0.3) setCurrentEra(0) // Dark Ages
    else if (starFormationRate <= 0.7) setCurrentEra(1) // First Light
    else if (starFormationRate > 1.3) setCurrentEra(2) // Peak Production
    else setCurrentEra(3) // Modern Era
  }, [starFormationRate])

  const currentEraData = eras[currentEra]

  // Get factory status based on rate - using consistent short names
  const getFactoryStatus = () => {
    if (starFormationRate <= 0.2) return { status: 'Shutdown', color: 'text-red-400' }
    if (starFormationRate <= 0.6) return { status: 'Maintenance', color: 'text-blue-400' }
    if (starFormationRate <= 1.1) return { status: 'Standard', color: 'text-green-400' }
    if (starFormationRate <= 1.6) return { status: 'High Demand', color: 'text-yellow-400' }
    return { status: 'Emergency', color: 'text-red-400' }
  }

  const factoryStatus = getFactoryStatus()

  return (
    <div className="w-full space-y-2">
      {/* Factory Status Header - Ultra Compact */}
      <div className="bg-black/40 rounded-lg p-2 border border-white/10">
        <div className="flex justify-between items-center mb-1">
          <div className="text-sm font-semibold text-white">Universe Factory Settings</div>
          <div className="flex items-center gap-2">
            <motion.div
              className={`w-2 h-2 rounded-full ${
                starFormationRate <= 0.6 ? 'bg-blue-400' :
                starFormationRate > 1.5 ? 'bg-red-400' : 'bg-green-400'
              }`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className={`text-xs font-medium ${factoryStatus.color} w-16 text-center`}>
              {factoryStatus.status}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-300">
            <strong className="text-white">{starFormationRate.toFixed(1)}x</strong> Rate
          </span>
          <span className="text-gray-300">
            <strong className="text-white">{Math.min(100, starFormationRate * 50).toFixed(0)}%</strong> Efficiency
          </span>
        </div>
      </div>

      {/* Cosmic Timeline - Ultra Compact */}
      <div className="bg-black/40 rounded-lg p-2 border border-white/10">
        <div className="text-sm font-semibold text-white mb-1 text-center">
          Cosmic Star Formation History
        </div>
        
        {/* Timeline bar */}
        <div className="relative h-3 bg-gradient-to-r from-purple-900 via-blue-600 to-orange-500 rounded mb-1">
          <div className="absolute inset-0 flex items-center justify-between px-1 text-xs text-white font-bold">
            <span className="text-xs">13.8 Gya</span>
            <span className="text-xs">Peak</span>
            <span className="text-xs">Today</span>
          </div>
          
          {/* Current position indicator */}
          <motion.div
            className="absolute top-0 w-1 h-full bg-white shadow-lg"
            style={{ 
              left: `${((starFormationRate - 0.1) / (2 - 0.1)) * 100}%` 
            }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
        
        <div className="text-xs text-gray-400 text-center">
          <strong className="text-white">{(13.8 - starFormationRate * 5).toFixed(1)} Gya</strong> - 
          {starFormationRate < 1 ? ' Post-Peak Era' : ' Peak Era'}
        </div>
      </div>

      {/* Era Cards Grid - Ultra Compact 4-column layout */}
      <div className="grid grid-cols-4 gap-1">
        {eras.map((era, index) => (
          <motion.div
            key={index}
            className={`p-1.5 rounded border transition-all duration-300 ${
              index === currentEra
                ? 'bg-white/10 border-white/30 scale-105'
                : 'bg-black/20 border-white/10 hover:bg-white/5'
            }`}
            whileHover={{ scale: index === currentEra ? 1.05 : 1.02 }}
          >
            <div className="flex flex-col items-center text-center">
              <span className="text-sm mb-0.5">{era.icon}</span>
              <div className="text-xs font-semibold text-white mb-0.5 leading-tight">
                {era.name.replace(' Era', '')}
              </div>
              <div className="text-xs text-gray-300 mb-0.5">{era.rate}</div>
              <div className="text-xs text-gray-400 leading-tight">{era.status}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
