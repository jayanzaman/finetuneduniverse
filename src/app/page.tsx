'use client'

import UniverseBuilderApp from '@/components/universe-builder/UniverseBuilderApp'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Our Finetuned Universe
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto mb-8">
            An interactive exploration of the improbable conditions that allow complexity to emerge in our cosmos. 
            Discover how the fundamental parameters of reality appear precisely calibrated for the existence of stars, 
            planets, and life itself.
          </p>
          <div className="text-lg text-gray-300 max-w-3xl mx-auto">
            <p className="mb-4">
              From the initial entropy of the Big Bang to the formation of matter, from stellar nucleosynthesis to 
              planetary habitability—explore the delicate balance of forces that makes our universe not just possible, 
              but inevitable in its complexity.
            </p>
            <p className="text-yellow-200 font-semibold">
              ✨ Adjust cosmic parameters and witness how tiny changes lead to dramatically different universes
            </p>
          </div>
        </div>
      </div>

      {/* Universe Builder App */}
      <UniverseBuilderApp />
      
      {/* Footer */}
      <footer className="bg-black/30 border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-300 mb-2">
            Our Finetuned Universe - An Interactive Cosmic Exploration
          </p>
          <p className="text-gray-400 text-sm">
            Discover the remarkable precision required for complexity to emerge in our cosmos
          </p>
        </div>
      </footer>
    </main>
  )
}
