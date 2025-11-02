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

  // Get factory status based on rate
  const getFactoryStatus = () => {
    if (starFormationRate <= 0.2) return { status: 'Shutdown', color: 'text-red-400' }
    if (starFormationRate <= 0.6) return { status: 'Maintenance Mode', color: 'text-blue-400' }
    if (starFormationRate <= 1.1) return { status: 'Standard Operation', color: 'text-green-400' }
    if (starFormationRate <= 1.6) return { status: 'High Demand', color: 'text-yellow-400' }
    return { status: 'Emergency Production', color: 'text-red-400' }
  }

  const factoryStatus = getFactoryStatus()

  return (
    <div className="w-full space-y-4">
      {/* Factory Status Header */}
      <div className="bg-black/40 rounded-lg p-3 border border-white/10">
        <div className="flex justify-between items-center mb-2">
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
            <span className={`text-xs font-medium ${factoryStatus.color}`}>
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

      {/* Cosmic Timeline */}
      <div className="bg-black/40 rounded-lg p-3 border border-white/10">
        <div className="text-sm font-semibold text-white mb-3 text-center">
          Cosmic Star Formation History
        </div>
        
        {/* Timeline bar */}
        <div className="relative h-6 bg-gradient-to-r from-purple-900 via-blue-600 to-orange-500 rounded mb-3">
          <div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-white font-bold">
            <span>13.8 Gya</span>
            <span>Peak</span>
            <span>Today</span>
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

      {/* Current Era Display */}
      <motion.div
        key={currentEra}
        className={`bg-gradient-to-br ${currentEraData.color} rounded-lg p-4 border border-white/20`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{currentEraData.icon}</span>
          <div>
            <div className="text-white font-semibold text-sm">{currentEraData.name}</div>
            <div className="text-white/80 text-xs">{currentEraData.period}</div>
          </div>
        </div>
        
        <div className="text-white/90 text-xs mb-2">
          {currentEraData.description}
        </div>
        
        <div className="flex justify-between items-center text-xs">
          <span className="text-white/80">Formation Rate:</span>
          <span className="text-white font-semibold">{currentEraData.rate}</span>
        </div>
      </motion.div>

      {/* Era Cards Grid */}
      <div className="grid grid-cols-2 gap-2">
        {eras.map((era, index) => (
          <motion.div
            key={index}
            className={`p-2 rounded border transition-all duration-300 ${
              index === currentEra
                ? 'bg-white/10 border-white/30 scale-105'
                : 'bg-black/20 border-white/10 hover:bg-white/5'
            }`}
            whileHover={{ scale: index === currentEra ? 1.05 : 1.02 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{era.icon}</span>
              <div className="text-xs font-semibold text-white truncate">
                {era.name.replace(' Era', '')}
              </div>
            </div>
            <div className="text-xs text-gray-300">{era.rate}</div>
            <div className="text-xs text-gray-400">{era.status}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
