'use client'

import UniverseBuilderApp from '../components/universe-builder/UniverseBuilderApp'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">

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
