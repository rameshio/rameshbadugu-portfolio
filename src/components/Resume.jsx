import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Award, Download, FileCheck, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const education = [
  {
    degree: 'Master of Science in Information Technology Management',
    institution: 'Concordia University, St. Paul',
    period: 'Graduate',
    description: 'Focus on IT governance, strategic management, enterprise technology alignment, and secure information systems.'
  },
  {
    degree: 'Master of Science in Artificial Intelligence',
    institution: 'Southwest Baptist University, Bolivar, MO',
    period: 'Graduate',
    description: 'Deep study of machine learning, cognitive systems, neural network designs, and AI agentic automation structures.'
  }
];

const certifications = [
  {
    title: 'Oracle Certified Professional: Java SE Developer',
    issuer: 'Oracle Corporation',
    date: '2022'
  },
  {
    title: 'AWS Certified Developer – Associate',
    issuer: 'Amazon Web Services',
    date: '2023'
  },
  {
    title: 'LangChain & Generative AI Solutions Architect',
    issuer: 'DeepLearning.AI',
    date: '2024'
  },
  {
    title: 'Professional Workflow Automation Developer',
    issuer: 'n8n Academy',
    date: '2025'
  }
];

export default function Resume() {
  const handleConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ef4444', '#991b1b', '#ffffff', '#000000']
    });
  };

  return (
    <section id="resume" className="relative py-24 px-6 md:px-12 max-w-6xl mx-auto z-10">
      {/* Title */}
      <div className="flex flex-col items-center mb-16 text-center">
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-2 glow-text-red"
        >
          My Credentials
        </motion.span>
        <h2 className="font-display font-black text-3xl md:text-5xl text-white tracking-tight">
          Curriculum <span className="gradient-text-red">Vitae</span>
        </h2>
        <div className="w-16 h-1 bg-red-600 rounded-full mt-4 shadow-[0_0_10px_#ef4444]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 items-start">
        {/* Left Column: Education */}
        <div className="lg:col-span-7 text-left space-y-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-red-950/30 border border-red-500/15 text-red-500">
              <GraduationCap size={22} />
            </div>
            <h3 className="font-display font-extrabold text-xl text-white">Education History</h3>
          </div>

          <div className="relative border-l border-zinc-900 pl-6 ml-3 space-y-8">
            {education.map((edu, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                key={idx}
                className="relative"
              >
                {/* Timeline node */}
                <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-950 border border-red-500/50" />
                
                <h4 className="font-display font-extrabold text-base md:text-lg text-white">
                  {edu.degree}
                </h4>
                <div className="flex items-center justify-between text-xs text-red-400 font-semibold mt-1">
                  <span>{edu.institution}</span>
                  <span className="font-mono">{edu.period}</span>
                </div>
                <p className="text-zinc-500 text-xs md:text-sm mt-3 font-sans leading-relaxed font-light">
                  {edu.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Certifications */}
        <div className="lg:col-span-5 text-left space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-red-950/30 border border-red-500/15 text-red-500">
              <Award size={22} />
            </div>
            <h3 className="font-display font-extrabold text-xl text-white">Certifications</h3>
          </div>

          <div className="space-y-4">
            {certifications.map((cert, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ x: 3, borderColor: 'rgba(239, 68, 68, 0.2)' }}
                key={idx}
                className="p-4 rounded-xl glassmorphism border border-red-950/20 flex justify-between items-center transition-all duration-300 group"
              >
                <div>
                  <h4 className="font-display font-bold text-sm text-white group-hover:text-red-400 transition-colors">
                    {cert.title}
                  </h4>
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Issued by: {cert.issuer}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-red-500 bg-red-950/20 px-2 py-0.5 rounded border border-red-500/10 shrink-0 ml-4">
                  {cert.date}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Downloader Section (confetti download button) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glassmorphism p-8 md:p-12 rounded-3xl border border-red-950/30 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-[0_0_10px_#ef4444]" />
        
        <div className="text-left max-w-xl">
          <h3 className="font-display font-extrabold text-xl md:text-2xl text-white mb-2">
            Interested in my detailed work records?
          </h3>
          <p className="text-zinc-500 text-xs md:text-sm font-sans font-light leading-relaxed">
            Download my comprehensive resume outlining enterprise microservices architecture, API security specifications, and real-world AI pipeline implementations.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 shrink-0 justify-center md:justify-end">
          <a
            href="/resume/Ramesh_Badugu_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-2xl text-xs font-semibold uppercase tracking-wider text-zinc-300 hover:text-white glassmorphism glassmorphism-hover border border-red-950/40 transition-all duration-300 flex items-center gap-2 cursor-pointer"
          >
            <FileCheck size={16} />
            View Resume
          </a>

          <a
            href="/resume/Ramesh_Badugu_Resume.pdf"
            download="Ramesh_Badugu_Resume.pdf"
            onClick={handleConfetti}
            className="px-6 py-3.5 rounded-2xl text-xs font-semibold tracking-wider uppercase text-white bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 border border-red-500/40 shadow-red-500/20 shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2 cursor-pointer"
          >
            <Download size={16} />
            Download Resume
          </a>
        </div>
      </motion.div>
    </section>
  );
}
