/**
 * clausescan 营销落地页
 * 功能：全宽营销落地页，Hero + 功能 + 定价 + FAQ
 */
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="max-w-6xl mx-auto px-6 py-24 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-1.5 text-sm mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              AI-Powered Contract Intelligence
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Catch Hidden Risks<br />
              <span className="text-blue-200">Before You Sign.</span>
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-xl leading-relaxed">
              Upload any contract and get an AI-powered risk analysis in minutes. 
              Built for the 33 million small businesses that can't afford a lawyer for every document.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/app" className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-8 py-4 rounded-lg hover:bg-blue-50 transition shadow-lg">
                Start Free Trial →
              </Link>
              <Link href="#features" className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-lg hover:bg-white/10 transition">
                See How It Works
              </Link>
            </div>
            <div className="flex flex-wrap gap-8 mt-12 text-sm text-blue-200">
              <div><span className="text-white font-bold text-lg">10K+</span><br />Contracts Analyzed</div>
              <div><span className="text-white font-bold text-lg">94%</span><br />Risk Detection Rate</div>
              <div><span className="text-white font-bold text-lg">&lt;3min</span><br />Average Review Time</div>
              <div><span className="text-white font-bold text-lg">$0</span><br />Free Trial Available</div>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Review Contracts</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">No legal degree required. Our AI does the heavy lifting.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '🔍', title: 'Risk Detection', desc: 'Instantly identify hidden risks, unfair terms, and dangerous clauses buried in your contracts.' },
            { icon: '📋', title: 'Clause Analysis', desc: 'Get plain-English explanations of every important clause. Know exactly what each section means for your business.' },
            { icon: '✏️', title: 'Smart Suggestions', desc: 'Receive AI-generated revision suggestions and negotiation talking points for every red flag found.' },
            { icon: '✅', title: 'Compliance Check', desc: 'Verify contracts against industry standards. Ensure GDPR, CCPA, and sector-specific compliance.' },
            { icon: '📊', title: 'Risk Scoring', desc: 'Each contract gets a 1-10 risk score with a detailed breakdown by category — liability, payment, IP, and more.' },
            { icon: '🔒', title: 'Bank-Grade Security', desc: 'Documents are encrypted at rest and in transit. We never share or train on your contracts.' },
          ].map((f, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
              <p className="text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gray-50 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">Three Steps to Contract Confidence</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Upload', desc: 'Drag & drop your contract. We support PDF, DOCX, and TXT files up to 50 pages.' },
              { step: '2', title: 'AI Analyzes', desc: 'Our AI scans every clause, cross-references industry standards, and flags potential risks.' },
              { step: '3', title: 'Get Report', desc: 'Receive a detailed risk report with scores, clause highlights, and actionable recommendations.' },
            ].map((s, i) => (
              <div key={i} className="relative">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6">{s.step}</div>
                <h3 className="text-xl font-semibold mb-3">{s.title}</h3>
                <p className="text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-500 text-lg">Start free. Upgrade when you need more.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { plan: 'Starter', price: '$29', period: '/month', tag: '', features: ['10 contracts/month', 'Risk scoring', 'Clause highlights', 'Email support'], cta: 'Start Free Trial', href: '/app' },
            { plan: 'Pro', price: '$79', period: '/month', tag: 'MOST POPULAR', features: ['50 contracts/month', 'Advanced risk analysis', 'Negotiation tips', 'Industry compliance check', 'Priority support'], cta: 'Start Free Trial', href: '/app', highlight: true },
            { plan: 'Business', price: '$199', period: '/month', tag: '', features: ['Unlimited contracts', 'Custom compliance rules', 'Team collaboration', 'API access', 'Dedicated support'], cta: 'Contact Sales', href: '/app' },
          ].map((p, i) => (
            <div key={i} className={`rounded-2xl p-8 ${p.highlight ? 'bg-blue-600 text-white ring-4 ring-blue-200 scale-105' : 'bg-gray-50'}`}>
              {p.tag && <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 inline-block ${p.highlight ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700'}`}>{p.tag}</span>}
              <h3 className={`text-xl font-semibold mb-2 ${p.highlight ? 'text-white' : 'text-gray-900'}`}>{p.plan}</h3>
              <div className="mb-6"><span className="text-4xl font-extrabold">{p.price}</span><span className={p.highlight ? 'text-blue-100' : 'text-gray-400'}>{p.period}</span></div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f, j) => (
                  <li key={j} className={`flex items-center gap-2 ${p.highlight ? 'text-blue-50' : 'text-gray-600'}`}>
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href={p.href} className={`block text-center font-semibold py-3 rounded-lg transition ${p.highlight ? 'bg-white text-blue-700 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>{p.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-center px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Stop Worrying About Contracts?</h2>
        <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">Join thousands of small business owners who review contracts with confidence.</p>
        <Link href="/app" className="inline-flex bg-white text-blue-700 font-semibold px-10 py-4 rounded-lg hover:bg-blue-50 transition shadow-lg text-lg">
          Get Started Free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; 2026 clausescan. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
