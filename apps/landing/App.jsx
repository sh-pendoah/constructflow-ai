import React from 'react'

const FRONTEND = 'http://localhost:3001'

const cardStyle = { background: '#1e293b', borderRadius: '12px', padding: '1.5rem', border: '1px solid #334155' }
const linkBtn = { display: 'inline-block', background: '#f59e0b', color: '#0f172a', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' }
const linkOutline = { display: 'inline-block', border: '1px solid #334155', color: '#e2e8f0', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }

function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid #1e293b', position: 'sticky', top: 0, background: '#0f172aee', zIndex: 10, backdropFilter: 'blur(8px)' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>Worklight</span>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem' }}>Features</a>
          <a href="#benefits" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem' }}>Benefits</a>
          <a href="#pricing" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem' }}>Pricing</a>
          <a href={`${FRONTEND}/login`} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.875rem' }}>Sign In</a>
          <a href={`${FRONTEND}/register`} style={linkBtn}>Get Started</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '5rem 2rem 4rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#1e293b', borderRadius: '9999px', padding: '0.25rem 1rem', fontSize: '0.75rem', color: '#f59e0b', marginBottom: '1.5rem', border: '1px solid #334155' }}>
          Now with AI-powered document processing
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
          Build Smarter.<br /><span style={{ color: '#f59e0b' }}>Manage Better.</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
          The all-in-one construction document management platform that streamlines workflows, automates processes, and keeps your entire team connected.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href={`${FRONTEND}/register`} style={linkBtn}>Start Free Trial &rarr;</a>
          <a href="#features" style={linkOutline}>See Features</a>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.5rem' }}>Everything You Need</h2>
        <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '2rem' }}>Purpose-built for construction teams of every size</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {[
            { icon: '📄', title: 'Document Management', desc: 'Upload, organize, and search construction documents with AI-powered tagging and smart categorization.' },
            { icon: '👥', title: 'Team Collaboration', desc: 'Role-based access for admins, managers, and workers. Everyone sees exactly what they need.' },
            { icon: '📊', title: 'Project Analytics', desc: 'Real-time dashboards for project progress, document status, and team productivity metrics.' },
            { icon: '🔒', title: 'Enterprise Security', desc: 'JWT auth, encrypted storage, audit trails, and compliant data handling out of the box.' },
            { icon: '🤖', title: 'AI Processing', desc: 'Automated document analysis, data extraction, and intelligent workflow suggestions with LangChain.' },
            { icon: '🏗️', title: 'Construction-First', desc: 'Built for RFIs, submittals, change orders, daily logs, and every construction workflow.' },
          ].map(f => (
            <div key={f.title} style={cardStyle}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '2rem' }}>Why Construction Teams Choose Worklight</h2>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {['Reduce document processing time by 70%', 'Real-time project visibility', 'AI-powered data extraction', 'Secure & compliant storage', 'Integrates with existing tools'].map(b => (
            <div key={b} style={{ background: '#1e293b', borderRadius: '8px', padding: '0.75rem 1.25rem', border: '1px solid #334155', fontSize: '0.8125rem', color: '#cbd5e1' }}>
              ✅ {b}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {[{ val: '70%', label: 'Faster Document Processing' }, { val: '3x', label: 'Team Productivity Increase' }, { val: '99.9%', label: 'Uptime Guarantee' }].map(s => (
            <div key={s.val} style={{ ...cardStyle, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{s.val}</div>
              <div style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.5rem' }}>Simple, Transparent Pricing</h2>
        <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '2rem' }}>Start free. Scale as you grow.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {[
            { name: 'Starter', price: 'Free', desc: 'For small teams getting started', features: ['Up to 5 users', '100 documents', 'Basic analytics', 'Email support'] },
            { name: 'Professional', price: '$29', desc: 'For growing construction firms', features: ['Up to 25 users', 'Unlimited documents', 'AI processing', 'Priority support', 'Advanced analytics'], highlight: true },
            { name: 'Enterprise', price: '$99', desc: 'For large organizations', features: ['Unlimited users', 'Unlimited documents', 'Custom integrations', 'Dedicated support', 'SSO & audit logs', 'SLA guarantee'] },
          ].map(plan => (
            <div key={plan.name} style={{ ...cardStyle, border: plan.highlight ? '2px solid #f59e0b' : '1px solid #334155', position: 'relative' }}>
              {plan.highlight && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#f59e0b', color: '#0f172a', fontSize: '0.625rem', fontWeight: 700, padding: '2px 10px', borderRadius: '9999px', textTransform: 'uppercase' }}>Most Popular</div>}
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>{plan.name}</h3>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{plan.price}<span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 400 }}>{plan.price !== 'Free' ? '/mo' : ''}</span></div>
              <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '1rem' }}>{plan.desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem' }}>
                {plan.features.map(f => <li key={f} style={{ fontSize: '0.8125rem', color: '#94a3b8', padding: '0.25rem 0' }}>✓ {f}</li>)}
              </ul>
              <a href={`${FRONTEND}/register`} style={{ ...linkBtn, width: '100%', textAlign: 'center', boxSizing: 'border-box', background: plan.highlight ? '#f59e0b' : '#334155', color: plan.highlight ? '#0f172a' : '#e2e8f0' }}>Get Started</a>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>Ready to Transform Your Construction Workflows?</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Start your free trial today. No credit card required.</p>
        <a href={`${FRONTEND}/register`} style={linkBtn}>Start Free Trial &rarr;</a>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid #1e293b', color: '#475569', fontSize: '0.875rem' }}>
        <span style={{ color: '#f59e0b', fontWeight: 600 }}>Worklight</span> &mdash; &copy; 2026 All rights reserved.
      </footer>
    </div>
  )
}

export default App
