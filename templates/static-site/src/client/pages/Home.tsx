import { Head } from '@inertiajs/react'
import React from 'react'
import Layout from '../components/Layout'
import { StaticLink } from '../components/StaticLink'

export default function Home({ msg, version }: { msg: string; version: string }) {
  const [count, setCount] = React.useState(0)

  return (
    <Layout>
      <Head title="Home - Gravito Static Site" />

      <div className="container" style={{ textAlign: 'center' }}>
        <header>
          <h1>🚀 Gravito Static Site</h1>
          <p className="tagline">
            {msg} (v{version})
          </p>
        </header>

        <div className="stats">
          <div className="stat-card">
            <span className="stat-number">{count}</span>
            <span className="stat-label">Counter Interaction</span>
            <div style={{ marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setCount(count + 1)}
                className="endpoint"
                style={{ cursor: 'pointer', background: 'var(--color-primary)', color: 'white' }}
              >
                Increment
              </button>
            </div>
          </div>
        </div>

        <div className="features">
          <h2>Static Site Navigation</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            This site uses StaticLink for navigation, which automatically uses full page navigation
            in static environments (like GitHub Pages) and Inertia navigation in development.
          </p>
          <StaticLink href="/about" className="endpoint">
            Go to About Page &rarr;
          </StaticLink>
        </div>
      </div>
    </Layout>
  )
}

