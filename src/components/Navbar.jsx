import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { PanelLeft, X, Terminal, ChevronRight } from 'lucide-react';

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Skills', href: '#skills' },
  { name: 'Experience', href: '#experience' },
  { name: 'Igris', href: '#igris' },
  { name: 'Projects', href: '#projects' },
  { name: 'Resume', href: '#resume' },
  { name: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const shouldReduceMotion = useReducedMotion();
  const sidebarRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      if (wasOpenRef.current) {
        toggleBtnRef.current?.focus();
      }
      wasOpenRef.current = false;
      return undefined;
    }

    wasOpenRef.current = true;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the sidebar after portal mount so keyboard users enter the drawer immediately
    const focusTimer = window.requestAnimationFrame(() => {
      sidebarRef.current?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !sidebarRef.current) return;
      const focusable = sidebarRef.current.querySelectorAll(
        'button, a[href], input, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusTimer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const sidebarPortal = typeof document !== 'undefined'
    ? createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="sidebar-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-[90] lg:hidden bg-slate-900/35 backdrop-blur-sm"
                aria-hidden="true"
              />

              {/* Right-Side Toggle Sidebar */}
              <motion.aside
                key="sidebar-panel"
                ref={sidebarRef}
                id="mobile-navigation"
                role="dialog"
                aria-modal="true"
                aria-label="Site navigation"
                tabIndex={-1}
                initial={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
                animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0.1 }
                    : { type: 'spring', stiffness: 360, damping: 34 }
                }
                className="fixed top-0 right-0 z-[100] lg:hidden h-dvh w-72 max-w-[85vw] liquid-glass-strong border-y-0 border-r-0 shadow-2xl flex flex-col justify-between p-6 overflow-y-auto focus:outline-none"
              >
                <div>
                  {/* Sidebar Header */}
                  <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-200/70">
                    <a
                      href="#home"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 font-display font-semibold text-base tracking-tight text-gray-900"
                    >
                      <Terminal size={18} className="text-gray-700" />
                      <span>
                        Ramesh<span className="text-gray-500 font-normal">Badugu</span>
                      </span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-gray-600 hover:text-gray-900 hover:bg-white/70 transition-colors"
                      aria-label="Close sidebar"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Sidebar Links */}
                  <nav aria-label="Mobile navigation" className="flex flex-col gap-1.5">
                    {navLinks.map((link) => {
                      const isActive = activeSection === link.href.substring(1);
                      return (
                        <a
                          key={link.name}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className={`min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 flex items-center justify-between ${
                            isActive
                              ? 'text-blue-700 bg-blue-50/90 border border-blue-200/70 font-semibold'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                          }`}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <span>{link.name}</span>
                          {isActive && <ChevronRight size={16} className="text-blue-600" />}
                        </a>
                      );
                    })}
                  </nav>
                </div>

                {/* Sidebar Footer CTA */}
                <div className="pt-6 mt-6 border-t border-gray-200/70">
                  <a
                    href="#contact"
                    onClick={() => setIsOpen(false)}
                    className="w-full min-h-[44px] flex items-center justify-center rounded-xl text-xs font-semibold uppercase tracking-wider text-white bg-blue-700 hover:bg-blue-800 transition-colors duration-200 shadow-sm"
                  >
                    Hire Me
                  </a>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>,
        document.body
      )
    : null;

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'liquid-glass-strong border-x-0 border-t-0 py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">

          {/* Brand Logo */}
          <a href="#home" className="flex items-center gap-2 group font-display font-semibold text-lg tracking-tight text-gray-900">
            <Terminal size={18} className="text-gray-700" />
            <span>
              Ramesh<span className="text-gray-500 font-normal">Badugu</span>
            </span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1 font-sans">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <a
                  key={link.name}
                  href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative px-3 py-2 text-sm font-medium tracking-wide transition-colors duration-200 ${isActive ? 'text-blue-700' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeNavTab"
                      className="absolute inset-0 rounded-lg bg-blue-50 -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  {link.name}
                </a>
              );
            })}
          </div>

          {/* Action Button */}
          <div className="hidden lg:block">
            <a
              href="#contact"
              className="px-5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-white bg-blue-700 hover:bg-blue-800 transition-colors duration-200"
            >
              Hire Me
            </a>
          </div>

          {/* Mobile Sidebar Toggle */}
          <div className="lg:hidden">
            <button
              ref={toggleBtnRef}
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition-colors"
              aria-label={isOpen ? 'Close navigation sidebar' : 'Open navigation sidebar'}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
            >
              {isOpen ? <X size={20} /> : <PanelLeft size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {sidebarPortal}
    </>
  );
}
