import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Briefcase, ChevronRight } from 'lucide-react';

const experiences = [
  {
    role: 'Java Developer',
    company: 'Fidelity Investments — Boston, United States',
    period: 'March 2024 – Dec 2025',
    description: 'Designed and developed scalable full-stack applications for a cloud-based financial platform, focusing on secure API services and responsive user interfaces.',
    achievements: [
      'Built and maintained Spring Boot microservices with OAuth 2.0 authentication and integrated them with React-based frontend applications.',
      'Implemented RESTful APIs to support high-volume transactions and optimized database performance using Oracle and MySQL.',
      'Leveraged Docker and Kubernetes for containerized deployments.',
      'Automated robust CI/CD pipelines using Jenkins.'
    ]
  },
  {
    role: 'Java/J2EE Developer',
    company: 'Walmart — Bengaluru, India',
    period: 'Nov 2021 – Dec 2022',
    description: 'Contributed to the development of Walmart Healthcare’s Medicare platform by building scalable backend microservices and integrating distributed systems through RESTful APIs.',
    achievements: [
      'Implemented real-time data processing using Kafka to improve system responsiveness and reliability.',
      'Collaborated with frontend teams to enable smooth API integration and enhance user workflows.'
    ]
  },
  {
    role: 'Software Engineer',
    company: 'Infosys — Bengaluru, India',
    period: 'June 2020 – Oct 2021',
    description: 'Worked on modernizing a legacy application by transitioning it to a microservices-based architecture using Spring Boot and React.',
    achievements: [
      'Developed dynamic and responsive frontend components using React.js and integrated them with backend services.',
      'Built RESTful APIs and implemented secure authentication using OAuth 2.0.',
      'Improved overall application performance, scalability, and maintainability.'
    ]
  }
];

export default function Experience() {
  return (
    <section id="experience" className="relative py-24 px-6 md:px-12 max-w-5xl mx-auto z-10">
      {/* Title */}
      <div className="flex flex-col items-center mb-16 text-center">
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-2 glow-text-red"
        >
          My Journey
        </motion.span>
        <h2 className="font-display font-black text-3xl md:text-5xl text-white tracking-tight">
          Work <span className="gradient-text-red">Experience</span>
        </h2>
        <div className="w-16 h-1 bg-red-600 rounded-full mt-4 shadow-[0_0_10px_#ef4444]" />
      </div>

      {/* Timeline track container */}
      <div className="relative border-l border-red-950/40 ml-4 md:ml-32 space-y-12">
        {experiences.map((exp, idx) => (
          <div key={idx} className="relative">
            {/* Timeline Dot Marker */}
            <div className="absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-[#030303] border border-red-500 timeline-dot z-20 flex items-center justify-center" />
            
            {/* Date Tag Left Aligned (Desktop Only) */}
            <div className="hidden md:block absolute -left-36 top-5 w-28 text-right pr-6 font-display font-bold text-sm text-red-500/80 tracking-wide">
              {exp.period}
            </div>

            {/* Content Card container */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              whileHover={{ 
                x: 4, 
                borderColor: 'rgba(239, 68, 68, 0.25)', 
                boxShadow: '0 10px 30px rgba(239, 68, 68, 0.08)' 
              }}
              className="glassmorphism ml-8 md:ml-10 p-6 md:p-8 rounded-2xl border border-red-950/20 text-left transition-all duration-300 relative group overflow-hidden"
            >
              {/* Subtle top left bar accent */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-red-600 to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Date tag mobile view */}
              <div className="md:hidden flex items-center gap-1.5 font-display text-xs font-bold text-red-500 mb-2">
                <Calendar size={12} />
                {exp.period}
              </div>

              {/* Title & Metadata */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg md:text-xl text-white group-hover:text-red-400 transition-colors">
                    {exp.role}
                  </h3>
                  <span className="font-sans text-sm font-semibold text-zinc-400 flex items-center gap-1.5 mt-1">
                    <Briefcase size={13} className="text-zinc-600" />
                    {exp.company}
                  </span>
                </div>
              </div>

              <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-6 font-sans font-light">
                {exp.description}
              </p>

              {/* Achievement Bullet Points */}
              <ul className="space-y-3 font-sans">
                {exp.achievements.map((ach, aIdx) => (
                  <li key={aIdx} className="flex items-start gap-2 text-zinc-400 hover:text-zinc-300 transition-colors text-xs md:text-sm">
                    <ChevronRight size={14} className="text-red-500/80 mt-1 shrink-0" />
                    <span className="leading-relaxed font-light">{ach}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
