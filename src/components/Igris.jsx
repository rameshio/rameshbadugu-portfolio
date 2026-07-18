import { useEffect, useRef, useState } from 'react';
import { Bot, ChevronRight, X, Webhook, Zap, ShieldCheck } from 'lucide-react';

const GitHubIcon = ({ size = 18, className = "" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function Igris() {
  const [showDetails, setShowDetails] = useState(false);
  const dialogRef = useRef(null);
  const detailsButtonRef = useRef(null);

  const features = [
    { icon: <Bot size={18} className="text-gray-700" />, text: "Built a Telegram-based personal AI agent orchestrator that manages Gmail summaries, job scouting, and approvals from a single control center." },
    { icon: <ShieldCheck size={18} className="text-gray-700" />, text: "Engineered a human-in-the-loop approval layer so sensitive or destructive actions like sending emails, applying to jobs, deleting, or archiving require explicit confirmation before running." },
    { icon: <Zap size={18} className="text-gray-700" />, text: "Developed the project in Node.js and TypeScript using Telegram Bot API, Gmail API, OAuth, Playwright browser automation, and a local Ollama gemma3:4b model running under PM2." },
    { icon: <Webhook size={18} className="text-gray-700" />, text: "Structured the project into skills, specs, policies, tests, and eval folders with documentation and a capstone report so its behavior is testable and easy to understand." }
  ];

  const tech = ['Node.js', 'TypeScript', 'Telegram Bot API', 'Gmail API', 'OAuth 2.0', 'Playwright', 'Ollama', 'gemma3', 'PM2', 'AI Agents', 'Human-in-the-Loop Workflows'];

  useEffect(() => {
    if (!showDetails) return undefined;

    const previousOverflow = document.body.style.overflow;
    const detailsButton = detailsButtonRef.current;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowDetails(false);
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])');
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
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      detailsButton?.focus();
    };
  }, [showDetails]);

  return (
    <section id="igris" className="py-24 relative z-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="glass-chip inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6">
            <span className="text-xs font-semibold tracking-widest uppercase text-gray-600">Capstone Project</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 tracking-tight mb-4">
            Igris AI Commander
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto font-sans">
            Kaggle / Google AI Agents Intensive — Vibe Coding Capstone, Concierge Agents track
          </p>
        </div>

        <div className="liquid-glass rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Bot size={80} className="text-blue-600" />
              </div>
            </div>

            <div className="w-full md:w-2/3">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-display">
                Personal AI Agent Orchestrator
              </h3>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8 font-sans">
                Igris AI Commander is a Telegram-based personal AI agent orchestrator that manages Gmail summaries, job scouting, and approvals from a single control center. It was built as a Kaggle / Google AI Agents Intensive capstone project with a focus on safe human-in-the-loop automation.
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {tech.slice(0, 6).map((t, idx) => (
                  <span key={idx} className="glass-chip px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700">
                    {t}
                  </span>
                ))}
                <span className="glass-chip px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500">
                  +{tech.length - 6} more
                </span>
              </div>

              <div className="flex flex-wrap gap-4">
                <a
                  href="https://github.com/rameshio/igris-ai-commander-capstone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-chip inline-flex items-center px-6 py-3 rounded-xl font-medium text-gray-700 hover:bg-white/80 transition-colors group"
                >
                  <GitHubIcon size={18} className="mr-2" />
                  GitHub Project
                </a>
                <button
                  ref={detailsButtonRef}
                  type="button"
                  onClick={() => setShowDetails(true)}
                  className="inline-flex items-center px-6 py-3 rounded-xl font-medium text-white bg-blue-700 hover:bg-blue-800 transition-colors group"
                >
                  View Details
                  <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDetails && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-gray-900/40 backdrop-blur-sm"
          onClick={() => setShowDetails(false)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="igris-dialog-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-6 md:p-8 flex-grow overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <Bot size={24} className="text-gray-700" />
                  </div>
                  <h3 id="igris-dialog-title" className="text-2xl font-bold text-gray-900 font-display">
                    Igris AI Commander
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetails(false)}
                  aria-label="Close Igris project details"
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Project Overview</h4>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    Igris AI Commander is a Telegram-based personal AI agent orchestrator that manages Gmail summaries, job scouting, and approvals from a single control center. It was built as a Kaggle / Google AI Agents Intensive capstone project with a focus on safe human-in-the-loop automation.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Key Achievements & Details</h4>
                  <ul className="space-y-4">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="mt-0.5 p-1.5 rounded-lg bg-white border border-gray-200 shrink-0">
                          {feature.icon}
                        </div>
                        <span className="leading-relaxed text-sm">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Concepts & Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {tech.map((t, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 border border-gray-200 text-gray-700">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="w-full py-2.5 rounded-lg font-medium text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
