import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { ArrowRight, Download, Mail } from 'lucide-react';

const GitHubIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedInIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
import gsap from 'gsap';
import rameshProfile from '../assets/ramesh-profile.jpeg';

// Interactive Three.js Mesh
function FloatingShape() {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.rotation.x = time * 0.15;
      meshRef.current.rotation.y = time * 0.2;
      
      // Responsive reaction to mouse pointer coordinates
      const { x, y } = state.pointer;
      meshRef.current.rotation.x += y * 0.15;
      meshRef.current.rotation.y += x * 0.15;
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1.2, 0.35, 120, 16]} />
      <meshStandardMaterial 
        color="#dc2626" 
        wireframe={true} 
        roughness={0.1}
        metalness={0.9}
        emissive="#450a0a"
        emissiveIntensity={0.8}
      />
    </mesh>
  );
}

export default function Hero() {
  const heroRef = useRef(null);

  useEffect(() => {
    // GSAP text reveal animations
    const ctx = gsap.context(() => {
      gsap.from('.reveal-text', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power4.out',
      });
      
      gsap.from('.hero-badge', {
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(1.7)',
        delay: 0.1,
      });

      gsap.from('.fade-in-btn', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.6,
      });

      gsap.from('.social-icon', {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(2)',
        delay: 0.8,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      id="home" 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6 md:px-12 overflow-hidden z-10"
    >
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left: Headline & Bio Info */}
        <div className="lg:col-span-7 flex flex-col items-start text-left z-20">
          {/* AI automation badge */}
          <div className="flex flex-wrap gap-2 mb-6">
            <div className="hero-badge px-4 py-1.5 rounded-full glassmorphism text-xs font-semibold text-red-400 border border-red-500/25 flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse glow-shadow" />
              AI Master's Student
            </div>
            <div className="hero-badge px-4 py-1.5 rounded-full glassmorphism text-xs font-semibold text-zinc-300 border border-zinc-500/25 flex items-center gap-2">
              MCP Learner
            </div>
          </div>

          <h2 className="reveal-text text-zinc-400 font-display font-medium text-lg md:text-xl mb-2 tracking-wide uppercase">
            Hi, I’m Ramesh Badugu
          </h2>
          
          <h1 className="reveal-text font-display font-black text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.08] mb-6">
            <span className="gradient-text-red">AI Automation &</span> <br />
            <span className="text-white glow-text-red">Orchestration Builder</span>
          </h1>

          <p className="reveal-text text-zinc-400 text-base md:text-lg max-w-lg mb-8 leading-relaxed font-sans font-light">
            I’m an AI Master’s student building practical AI assistant workflows with Claude, ChatGPT, Gemini, MCP, APIs, Telegram, Gmail, and automation tools. My main project, Igris, helps me learn how AI systems can support real daily tasks with human approval and responsible workflow design.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-4 mb-8">
            <motion.a 
              href="#igris" 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="fade-in-btn px-6 py-3.5 rounded-xl text-sm font-semibold tracking-wider text-white bg-gradient-to-r from-red-600 to-red-800 border border-red-500/40 hover:border-red-400 shadow-[0_0_20px_rgba(220,38,38,0.25)] hover:shadow-[0_0_30px_rgba(220,38,38,0.45)] transition-all duration-300 flex items-center gap-2"
            >
              View Igris Project <ArrowRight size={16} />
            </motion.a>

            <motion.a 
              href="#resume" 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="fade-in-btn px-6 py-3.5 rounded-xl text-sm font-semibold tracking-wider text-zinc-300 hover:text-white glassmorphism glassmorphism-hover border border-red-950/40 flex items-center gap-2"
            >
              Download Resume <Download size={16} />
            </motion.a>
            
            <motion.a 
              href="#contact" 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="fade-in-btn px-6 py-3.5 rounded-xl text-sm font-semibold tracking-wider text-zinc-300 hover:text-white glassmorphism glassmorphism-hover border border-red-950/40 flex items-center gap-2"
            >
              Contact Me <Mail size={16} />
            </motion.a>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <span className="text-zinc-600 text-xs font-semibold uppercase tracking-wider">Connect:</span>
            {[
              { icon: <GitHubIcon size={18} />, href: 'https://github.com', label: 'GitHub' },
              { icon: <LinkedInIcon size={18} />, href: 'https://linkedin.com/in/rameshbadugu', label: 'LinkedIn' },
              { icon: <Mail size={18} />, href: 'mailto:rameshbadugums@gmail.com', label: 'Email' }
            ].map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -3, scale: 1.1 }}
                className="social-icon w-10 h-10 rounded-xl glassmorphism glassmorphism-hover flex items-center justify-center text-zinc-400 hover:text-red-500 border border-red-950/30"
                aria-label={social.label}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </div>

        {/* Right: Immersive 3D and Profile Image */}
        <div className="lg:col-span-5 relative flex items-center justify-center min-h-[350px] lg:min-h-[480px]">
          {/* Three.js Canvas container */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <Canvas camera={{ position: [0, 0, 3] }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[2, 2, 5]} intensity={1} />
              <pointLight position={[-3, -3, 2]} intensity={0.5} color="#ef4444" />
              <FloatingShape />
            </Canvas>
          </div>

          {/* Profile Card Overlay (Anti-Gravity Float style) */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -10, rotateX: 5, rotateY: -5 }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative z-10 w-64 h-64 md:w-80 md:h-80 rounded-2xl glassmorphism p-2.5 border border-red-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-float"
          >
            {/* Absolute Red Shadow Glow beneath card */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-red-600/20 to-red-950/20 blur-xl opacity-75 -z-10 animate-pulse-slow" />
            
            <div className="w-full h-full overflow-hidden rounded-xl border border-red-950/40 relative">
              <img 
                src={rameshProfile} 
                alt="Ramesh Badugu Portrait" 
                className="w-full h-full object-cover grayscale-[20%] contrast-110 brightness-95 object-top transition-transform duration-700 hover:scale-105"
              />
              {/* Sleek bottom shadow filter over image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              
              {/* Name caption on bottom of profile */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="text-xs font-display font-medium uppercase tracking-wider text-red-400 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm border border-red-500/10">
                  AI Master's Student
                </span>
                <span className="text-[10px] font-sans text-zinc-400 bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm border border-zinc-500/10">
                  Ramesh Badugu
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Down Chevron Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-zinc-500 animate-bounce cursor-pointer hover:text-red-500 transition-colors">
        <a href="#about" aria-label="Scroll to About">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </a>
      </div>
    </section>
  );
}
