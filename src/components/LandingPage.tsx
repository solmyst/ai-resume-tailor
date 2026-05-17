import React from 'react';
import { 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Cpu,
  Layout,
  Key
} from 'lucide-react';

interface LandingPageProps {
  onSignUp: () => void;
  onSignIn: () => void;
  onQuickStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSignUp, onSignIn, onQuickStart }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-fog text-ink selection:bg-ember/20">
      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto bg-stone/95 mt-4 rounded-2xl border border-linen shadow-[0_4px_24px_rgba(18,18,27,0.015)] mx-4">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="bg-gradient-to-tr from-ember to-ember-light p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black font-['Outfit'] tracking-tighter text-ink">
            Resume<span className="text-ember">Tailor</span>AI
          </span>
        </div>
        
        <div className="hidden lg:flex items-center space-x-10 text-sm font-semibold text-slate">
          <a href="#features" className="hover:text-ember transition-colors">Features</a>
          <a href="#workflow" className="hover:text-ember transition-colors">Workflow</a>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={onQuickStart} 
            className="btn-primary flex items-center group !py-2.5"
          >
            Get Started
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform text-ember" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-32 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-stone border border-linen text-ember text-xs font-bold mb-8 shadow-sm">
            <Zap className="w-3 h-3 mr-2 text-ember" />
            OPENAI POWERED · SUMI CRAFT · ATS COMPATIBLE
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-10 leading-[0.9] tracking-tighter text-ink">
            TAILOR YOUR <br />
            <span className="premium-gradient-text">RESUME</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-slate mb-14 max-w-3xl mx-auto leading-relaxed font-medium">
            Upload your resume, paste a job description, and let AI optimize it for <span className="text-ink font-bold">maximum ATS compatibility</span>. Powered by GPT-4o-mini with minimal token usage.
          </p>

          <div className="flex flex-col sm:row items-center justify-center gap-6 mb-24">
            <button 
              onClick={onQuickStart}
              className="group relative px-10 py-5 bg-ink hover:bg-ink-soft rounded-2xl text-xl font-bold border border-ember/40 hover:border-ember text-fog flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-[0_4px_20px_rgba(18,18,27,0.1)]"
            >
              Start Tailoring
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform text-ember" />
            </button>
            <p className="text-sm text-slate font-medium">No account required · Add your OpenAI key in ⚙ Settings</p>
          </div>

          {/* Feature Grid */}
          <div id="features" className="grid md:grid-cols-3 gap-8 text-left">
            {[
              {
                icon: <Key className="w-8 h-8 text-ember" />,
                title: "OpenAI Powered",
                desc: "Uses GPT-4o-mini for cost-efficient, high-quality tailoring. Aggressive token optimization keeps costs near zero."
              },
              {
                icon: <Layout className="w-8 h-8 text-ember" />,
                title: "ATS-Optimized Output",
                desc: "Generates clean Markdown and PDF files structured for Applicant Tracking Systems."
              },
              {
                icon: <Cpu className="w-8 h-8 text-ember" />,
                title: "Flexible AI Backend",
                desc: "Supports OpenAI, Gemini, and local Ollama. Falls back gracefully with an offline keyword engine."
              }
            ].map((f, i) => (
              <div key={i} className="glass-card glass-card-hover p-10 group transition-all">
                <div className="mb-6 bg-stone w-16 h-16 rounded-2xl flex items-center justify-center border border-linen group-hover:border-ember/40 transition-all">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 font-['Outfit'] text-ink">{f.title}</h3>
                <p className="text-slate leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="py-32 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black text-center mb-20 tracking-tighter text-ink">
            HOW IT <span className="premium-gradient-text">WORKS</span>
          </h2>
          
          <div className="space-y-16">
            {[
              { t: "Upload Your Resume", d: "Upload your existing resume as PDF, DOCX, or plain text. The backend extracts and parses it instantly.", s: "01", c: "text-ember" },
              { t: "Paste the Job Description", d: "Paste the full job description or import it from a URL. The AI identifies the key requirements and keywords.", s: "02", c: "text-ember-light" },
              { t: "Get Your Tailored Resume", d: "Review the AI-tailored version with match score, added keywords, and export it as a professionally formatted PDF.", s: "03", c: "text-ember" }
            ].map((step, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-8 items-center group">
                <div className={`text-8xl font-black ${
                  step.s === '02' ? 'text-ember-light/20 group-hover:text-ember-light' : 'text-ember/20 group-hover:text-ember'
                } transition-colors select-none`}>
                  {step.s}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-3xl font-bold mb-4 font-['Outfit'] text-ink">{step.t}</h3>
                  <p className="text-xl text-slate font-medium leading-relaxed">{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 pt-32 pb-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="w-full h-px bg-linen mb-16" />
          <div className="flex items-center space-x-3 mb-8 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
            <Sparkles className="w-6 h-6 text-ember" />
            <span className="text-xl font-black tracking-tighter text-ink">ResumeTailor AI</span>
          </div>
          <p className="text-slate text-sm font-medium mb-10">Open source · Token-optimized · Built with OpenAI + React</p>
        </div>
      </footer>
    </div>
  );
};