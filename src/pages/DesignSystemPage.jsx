import React from 'react'
import Header from '../components/ui/Header.jsx'
import Layout from '../components/ui/Layout.jsx'
import Signal from '../components/ui/Signal.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'

export default function DesignSystemPage() {
  return (
    <div className="bg-bg min-h-screen">
      <Header />
      <Layout>
        <div className="space-y-6">

          {/* Signals */}
          <section>
            <h2 className="text-textDim text-xs uppercase tracking-widest mb-3">Signal Feed</h2>
            <div className="space-y-3">
              <Signal text="New system initialized" />
              <Signal text="Live dev signal detected" />
              <Signal text="Framework discussion trending" />
            </div>
          </section>

          {/* Buttons */}
          <section>
            <h2 className="text-textDim text-xs uppercase tracking-widest mb-3">Buttons</h2>
            <div className="flex gap-3 flex-wrap">
              <Button>Primary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </section>

          {/* Cards */}
          <section>
            <h2 className="text-textDim text-xs uppercase tracking-widest mb-3">Cards</h2>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <p className="text-sm text-textDim">Card A — glass surface with hover glow</p>
              </Card>
              <Card>
                <p className="text-sm text-textDim">Card B — hover to see border + shadow</p>
              </Card>
            </div>
          </section>

          {/* Inputs */}
          <section>
            <h2 className="text-textDim text-xs uppercase tracking-widest mb-3">Inputs</h2>
            <div className="space-y-3 max-w-md">
              <Input placeholder="Search signals..." />
              <Input placeholder="Compose a message..." />
            </div>
          </section>

        </div>
      </Layout>
    </div>
  )
}
