import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Award, Download, FileCheck, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const education = [
  {
    degree: 'Master of Science in Computer Science',
    institution: 'State University of Technology',
    period: '2017 - 2019',
    description: 'Focused on Distributed Databases, Software Engineering Methodologies, and Machine Learning.'
  },
  {
    degree: 'Bachelor of Technology in Computer Science & Engineering',
    institution: 'Jawaharlal Nehru Technological University',
    period: '2013 - 2017',
    description: 'Foundation in Data Structures, Object-Oriented Programming, and Web Engineering.'
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
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    
    // Simulate slight loading latency
    setTimeout(() => {
      // Fire confetti celebration!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#991b1b', '#ffffff', '#000000']
      });

      // Programmatic mock resume file trigger
      const mockResumeContent = `
RAMESH BADUGU - RESUME
Java Full Stack Developer & AI Automation Engineer

CONTACT INFO
Email: ramesh.badugu@example.com
LinkedIn: linkedin.com/in/rameshbadugu
GitHub: github.com/rameshbadugu

SUMMARY
Java Full Stack Developer and AI Solutions Engineer with 5+ years of experience.
Specialized in building scalable distributed systems, Spring Boot microservices,
and automating enterprise workloads using LangGraph, n8n, and custom LLM integrations.

TECHNICAL SKILLS
- Backend: Java, Spring Boot, Spring Cloud, Hibernate, Microservices, Python, FastAPI
- AI: LangChain, LangGraph, LLM integration, Pinecone, ChromaDB, RAG, Web Scraping
- Database & DevOps: PostgreSQL, Redis, MongoDB, Docker, Kubernetes, AWS, Jenkins, Git
- Frontend: React, Vite, JavaScript, Tailwind CSS, HTML5, CSS3, GSAP, Framer Motion

EXPERIENCE
- Senior Java Full Stack & AI Solutions Engineer | 2024 - Present
- Java Full Stack Developer | 2021 - 2024
- Associate Software Developer | 2019 - 2021

EDUCATION
- M.S. in Computer Science | 2017 - 2019
- B.Tech in Computer Science & Engineering | 2013 - 2017
      `;
      
      const element = document.createElement("a");
      const file = new Blob([mockResumeContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = "Ramesh_Badugu_Resume.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setDownloading(false);
      setDownloaded(true);

      // Reset downloaded tag after a few seconds
      setTimeout(() => setDownloaded(false), 4000);
    }, 1200);
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

        <motion.button
          onClick={handleDownload}
          disabled={downloading}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className={`px-8 py-4 rounded-2xl text-sm font-semibold tracking-wider text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 shrink-0 cursor-pointer ${
            downloaded
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 border border-emerald-500/30'
              : 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 shadow-red-500/20 border border-red-500/40'
          }`}
        >
          {downloading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : downloaded ? (
            <>
              <CheckCircle size={18} />
              Downloaded!
            </>
          ) : (
            <>
              <Download size={18} />
              Download Resume
            </>
          )}
        </motion.button>
      </motion.div>
    </section>
  );
}
