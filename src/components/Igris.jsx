import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ChevronRight, X, BrainCircuit, Webhook, Zap, ShieldCheck } from 'lucide-react';

export default function Igris() {
  const [showDetails, setShowDetails] = useState(false);

  const features = [
    { icon: <Bot size={18} className="text-red-500" />, text: "Built the idea and workflow for an AI assistant that can support email summaries, job tracking, resume support, Telegram updates, and task automation." },
    { icon: <BrainCircuit size={18} className="text-red-500" />, text: "Explored how AI tools like Claude, ChatGPT, MCP, APIs, and local AI models can work together in one workflow." },
    { icon: <Webhook size={18} className="text-red-500" />, text: "Learned how MCP can help connect AI systems with tools, files, APIs, and outside services." },
    { icon: <ShieldCheck size={18} className="text-red-500" />, text: "Added a human-approval approach so important actions can be reviewed before they are completed." },
    { icon: <Zap size={18} className="text-red-500" />, text: "Practiced breaking a large AI project into smaller parts, testing each part, finding issues, and improving the workflow step by step." },
    { icon: <Bot size={18} className="text-red-500" />, text: "Focused on making the project easy to understand for both technical and non-technical users." }
  ];

  const tech = ['Claude', 'ChatGPT', 'Gemini', 'MCP', 'APIs', 'Telegram Bots', 'Gmail Workflows', 'Local AI Models', 'Browser Automation', 'Human Approval', 'Workflow Automation'];

  return (
    <section id="igris" className="py-24 relative z-20 select-text">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glassmorphism border border-red-500/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-widest uppercase text-red-400">Featured Project</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight mb-4">
            Igris — <span className="text-red-500 glow-text-red">Personal AI Assistant Project</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto font-sans font-light">
            Connecting AI tools with services like Gmail, Telegram, browser automation, local AI models, APIs, and MCP in a simple and useful way.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="glassmorphism rounded-3xl p-8 md:p-12 border border-red-950/40 hover:border-red-500/30 transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_40px_rgba(239,68,68,0.2)] relative overflow-hidden"
        >
          {/* Subtle background glow for the card */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-red-600/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-red-900/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-red-950/40 to-black border border-red-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.15)] relative">
                <div className="absolute inset-0 rounded-full border border-red-500/10 animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-4 rounded-full border border-red-500/20 animate-[spin_15s_linear_infinite_reverse]" />
                <Bot size={80} className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
              </div>
            </div>

            <div className="w-full md:w-2/3">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 font-display">
                Igris
              </h3>
              <p className="text-zinc-300 text-base md:text-lg leading-relaxed mb-8 font-sans">
                Igris is a personal AI assistant project I am building to learn how AI agents and automation workflows can support real daily tasks. 
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {tech.slice(0, 6).map((t, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900/80 border border-zinc-800 text-zinc-300">
                    {t}
                  </span>
                ))}
                <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-950/30 border border-red-900/50 text-red-400">
                  +{tech.length - 6} more
                </span>
              </div>

              <button 
                onClick={() => setShowDetails(true)}
                className="inline-flex items-center px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-700 to-red-950 border border-red-500/30 hover:border-red-500/60 shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:shadow-[0_0_25px_rgba(220,38,38,0.4)] transition-all duration-300 group"
              >
                View Project Details
                <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md select-text"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl bg-[#0a0a0a] border border-red-500/20 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.1)] overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 md:p-8 flex-grow overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-950/50 to-black border border-red-500/20 flex items-center justify-center">
                      <Bot size={24} className="text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white font-display">
                      Igris — Project Details
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowDetails(false)}
                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-red-500 mb-3">Project Goal</h4>
                    <p className="text-zinc-300 leading-relaxed">
                      Igris is a personal AI assistant project I am building to learn how AI agents and automation workflows can support real daily tasks. The goal is to connect AI tools with services like Gmail, Telegram, browser automation, local AI models, APIs, and MCP in a simple and useful way.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-red-500 mb-4">Key Achievements & Learnings</h4>
                    <ul className="space-y-4">
                      {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-zinc-300 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50">
                          <div className="mt-0.5 p-1.5 rounded-lg bg-red-950/30 border border-red-900/50 shrink-0">
                            {feature.icon}
                          </div>
                          <span className="leading-relaxed">{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-red-500 mb-3">Concepts & Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {tech.map((t, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-zinc-900 border border-zinc-800 text-zinc-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 md:p-6 border-t border-zinc-900 bg-black/50">
                <button 
                  onClick={() => setShowDetails(false)}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
