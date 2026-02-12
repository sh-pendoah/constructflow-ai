import { Pricing } from './app/components/pricing';
import { HardHat, FileText, Users, BarChart3, Shield, Zap, ArrowRight, CheckCircle } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <HardHat className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Worklight</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition">Features</a>
            <a href="#benefits" className="text-sm text-gray-600 hover:text-gray-900 transition">Benefits</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="http://localhost:3001/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition">Sign In</a>
            <a href="http://localhost:3001/register" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8">
            <Zap className="w-4 h-4" /> Now with AI-powered document processing
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Build Smarter.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Manage Better.</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            The all-in-one construction document management platform that streamlines workflows, 
            automates processes, and keeps your entire team connected.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <a href="http://localhost:3001/register" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </a>
            <a href="#features" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-100 text-gray-800 rounded-xl text-lg font-semibold hover:bg-gray-200 transition">
              See Features
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Everything You Need</h2>
            <p className="mt-4 text-lg text-gray-600">Purpose-built for construction teams of every size</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: FileText, title: 'Document Management', desc: 'Upload, organize, and search construction documents with AI-powered tagging and smart categorization.' },
              { icon: Users, title: 'Team Collaboration', desc: 'Role-based access for admins, managers, and workers. Everyone sees exactly what they need.' },
              { icon: BarChart3, title: 'Project Analytics', desc: 'Real-time dashboards for project progress, document status, and team productivity metrics.' },
              { icon: Shield, title: 'Enterprise Security', desc: 'JWT auth, encrypted storage, audit trails, and compliant data handling out of the box.' },
              { icon: Zap, title: 'AI Processing', desc: 'Automated document analysis, data extraction, and intelligent workflow suggestions with LangChain.' },
              { icon: HardHat, title: 'Construction-First', desc: 'Built for RFIs, submittals, change orders, daily logs, and every construction workflow.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-8 rounded-2xl border hover:shadow-xl transition group">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition">
                  <Icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-gray-900">{title}</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Why Construction Teams Choose Worklight</h2>
              <div className="mt-8 space-y-5">
                {[
                  'Reduce document processing time by 70%',
                  'Real-time project visibility across all stakeholders',
                  'AI-powered data extraction from construction documents',
                  'Secure, compliant document storage and sharing',
                  'Integrates with your existing construction tools',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-lg">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-3xl p-12 text-white text-center">
              <div className="text-6xl font-bold">70%</div>
              <div className="mt-2 text-xl opacity-90">Faster Document Processing</div>
              <div className="mt-8 text-5xl font-bold">3x</div>
              <div className="mt-2 text-xl opacity-90">Team Productivity Increase</div>
              <div className="mt-8 text-5xl font-bold">99.9%</div>
              <div className="mt-2 text-xl opacity-90">Uptime Guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing">
        <Pricing />
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Transform Your Construction Workflows?</h2>
          <p className="mt-4 text-lg text-gray-400">Start your free trial today. No credit card required.</p>
          <a href="http://localhost:3001/register" className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-500 transition">
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HardHat className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Worklight</span>
          </div>
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Worklight. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

