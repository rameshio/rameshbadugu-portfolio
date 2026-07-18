import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Igris from './components/Igris';
import Projects from './components/Projects';

import Resume from './components/Resume';
import Contact from './components/Contact';

export default function App() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="relative min-h-screen text-zinc-900 flex flex-col font-sans bg-white selection:bg-gray-200">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[200] -translate-y-24 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      {/* Floating Navigation Header */}
      <Navbar />

      {/* Page Content sections */}
      <main id="main-content" className="flex-grow">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Igris />
        <Projects />

        <Resume />
        <Contact />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <a href="#home" className="font-display font-bold text-lg text-black">
              Ramesh<span className="text-gray-400 font-medium">Badugu</span>
            </a>
            <p className="text-xs text-gray-500 mt-2 max-w-sm leading-relaxed font-sans">
              Frontend Developer and AI Master's student building practical AI agents, orchestration workflows, and human-in-the-loop systems.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end text-center md:text-right gap-2 font-mono text-[10px] text-gray-400">
            <span className="font-semibold text-gray-500">
              &copy; {currentYear} Ramesh Badugu. All rights reserved.
            </span>
            <span className="text-[9px] text-gray-400">
              Designed &amp; Built by Ramesh Badugu &bull; React, Vite, Tailwind v4
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
