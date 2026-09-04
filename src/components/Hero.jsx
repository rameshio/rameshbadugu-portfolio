import { ArrowRight, Download, Mail } from 'lucide-react';
import rameshProfile from '../assets/ramesh-profile.jpeg';
import SplitText from './SplitText';

const GitHubIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedInIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Hero() {
  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6 md:px-12"
    >
      <div className="liquid-glass max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center rounded-[2rem] p-8 md:p-12 lg:p-14">

        {/* Left: Headline & Bio Info */}
        <div className="lg:col-span-7 flex flex-col items-start text-left z-20">

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-8">
            {['React & Frontend', 'AI Agent Orchestration', 'Human-in-the-Loop'].map((badge) => (
              <span key={badge} className="glass-chip px-3 py-1 rounded-full text-xs font-medium text-blue-700">
                {badge}
              </span>
            ))}
          </div>

          <p className="text-gray-500 font-sans text-lg mb-3 tracking-wide">
            Hi, I’m Ramesh Badugu
          </p>
          
          <SplitText
            text="Frontend Developer & AI Agent Builder"
            className="font-display font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.1] mb-6 text-gray-900"
            tag="h1"
            textAlign="left"
            delay={50}
          />

          <p className="text-gray-600 text-base md:text-lg max-w-xl mb-10 leading-relaxed font-sans">
            I build accessible React interfaces and practical AI workflows. My experience spans production web development at Vanguard and Infosys, while my current work explores safe agent orchestration through Igris AI Commander.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-4 mb-10">
            <a
              href="#igris" 
              className="px-6 py-3 rounded-lg text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 transition-colors flex items-center gap-2"
            >
              View Igris Project <ArrowRight size={16} />
            </a>

            <a
              href="/resume/Ramesh_Badugu_Resume.pdf"
              download="Ramesh_Badugu_Resume.pdf"
              className="glass-chip px-6 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-white/80 transition-colors flex items-center gap-2"
            >
              Download Resume <Download size={16} />
            </a>
            
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Connect:</span>
            {[
              { icon: <GitHubIcon size={18} />, href: 'https://github.com/rameshio', label: 'GitHub' },
              { icon: <LinkedInIcon size={18} />, href: 'https://linkedin.com/in/rameshbadugu', label: 'LinkedIn' },
              { icon: <Mail size={18} />, href: 'mailto:rameshbadugums@gmail.com', label: 'Email' }
            ].map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Right: Clean Profile Image */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="liquid-glass relative w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden p-2">
            <img
              src={rameshProfile}
              alt="Ramesh Badugu Portrait"
              className="w-full h-full object-cover object-top rounded-[1.15rem]"
              fetchPriority="high"
              decoding="async"
            />
            {/* Minimal Caption */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-900 bg-white/90 px-2.5 py-1 rounded-md backdrop-blur-sm border border-gray-200/50 shadow-sm">
                Frontend Developer · AI M.S.
              </span>
            </div>
          </div>
        </div>
      </div>
      
    </section>
  );
}
