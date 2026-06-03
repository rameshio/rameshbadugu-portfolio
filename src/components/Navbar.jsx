import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Terminal } from 'lucide-react';

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Skills', href: '#skills' },
  { name: 'Projects', href: '#projects' },
  { name: 'Experience', href: '#experience' },
  { name: 'Resume', href: '#resume' },
  { name: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Simple intersection observer behavior for active navbar link highlighting
      const sections = navLinks.map(link => document.querySelector(link.href));
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navLinks[i].href.substring(1));
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-500 py-4 px-6">
      {/* Container with anti-gravity floating glassmorphism */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`max-w-6xl mx-auto rounded-2xl transition-all duration-300 ${
          scrolled 
            ? 'glassmorphism py-3 px-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-red-950/40' 
            : 'bg-transparent py-4 px-4 border-transparent'
        } border flex items-center justify-between`}
      >
        {/* Brand Logo */}
        <a href="#home" className="flex items-center gap-2 group font-display font-bold text-xl tracking-tight text-white">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-950 flex items-center justify-center text-white border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
          >
            <Terminal size={16} />
          </motion.div>
          <span>
            Ramesh<span className="text-red-500 font-extrabold glow-text-red">Badugu</span>
          </span>
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1 font-sans">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.substring(1);
            return (
              <a
                key={link.name}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-300 text-zinc-400 hover:text-white"
              >
                {isActive && (
                  <motion.span
                    layoutId="activeNavTab"
                    className="absolute inset-0 rounded-lg bg-red-950/30 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)] -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {link.name}
              </a>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="hidden md:block">
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-white bg-gradient-to-r from-red-700 to-red-950 border border-red-500/30 hover:border-red-500/60 shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:shadow-[0_0_25px_rgba(220,38,38,0.4)] transition-all duration-300"
          >
            Hire Me
          </motion.a>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-red-950/50 hover:bg-red-950/20"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.div>

      {/* Mobile Drawer (Glassmorphism Overlay) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden max-w-6xl mx-auto mt-2 rounded-2xl glassmorphism border border-red-950/30 overflow-hidden shadow-2xl"
          >
            <div className="flex flex-col gap-1 p-4">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.substring(1);
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 flex items-center justify-between ${
                      isActive 
                        ? 'text-white bg-red-950/40 border border-red-500/20 glow-text-red shadow-[0_0_15px_rgba(239,68,68,0.15)]' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50 border border-transparent'
                    }`}
                  >
                    {link.name}
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]" />}
                  </a>
                );
              })}
              <a
                href="#contact"
                onClick={() => setIsOpen(false)}
                className="mt-2 w-full text-center py-3 rounded-xl text-sm font-semibold uppercase tracking-wider text-white bg-red-600 border border-red-500/40 hover:bg-red-700 shadow-lg block"
              >
                Hire Me
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
