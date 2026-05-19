'use client';

import UniverseBuilderApp from '../components/universe-builder/UniverseBuilderApp';

export default function Home() {
  return (
    <main className="hifi" style={{ minHeight: '100vh', background: 'var(--void)' }}>
      <UniverseBuilderApp />
    </main>
  );
}
