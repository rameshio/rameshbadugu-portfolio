import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Bot,
  Download,
  ExternalLink,
  MessageSquare,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { isSafeHref } from '../utils/safeHref';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi! I'm Ramesh's portfolio assistant. Ask me about his frontend work at Vanguard and Infosys, Igris AI Commander, AI/LangChain stack, education, or how to reach him.",
  actions: [
    { label: 'View Experience', href: '#experience' },
    { label: 'Download Resume', href: '/resume/Ramesh_Badugu_Resume.pdf', download: true },
  ],
};

const QUICK_PROMPTS = [
  'Summarize his experience',
  'Tell me about Igris AI Commander',
  'What is his tech stack?',
  'Education & certifications',
  'How can I contact Ramesh?',
];

let nextMessageId = 1;
const createMessageId = (prefix) => `${prefix}-${nextMessageId++}`;

const MODE_LABELS = {
  rag: 'LangChain RAG',
  gemini: 'Gemini AI',
  openai: 'AI Powered',
  builtin: 'Portfolio Guide',
};

export default function PortfolioAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [assistantMode, setAssistantMode] = useState('builtin');
  const [errorText, setErrorText] = useState('');

  const shouldReduceMotion = useReducedMotion();
  const launcherRef = useRef(null);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    let active = true;
    fetch('/api/health')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.assistantMode) {
          setAssistantMode(data.assistantMode);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      if (wasOpenRef.current) {
        launcherRef.current?.focus();
      }
      wasOpenRef.current = false;
      return undefined;
    }

    wasOpenRef.current = true;
    const focusTimer = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    });
  }, [messages, isSending, isOpen, shouldReduceMotion]);

  const sendMessage = async (rawText) => {
    const trimmed = String(rawText ?? '').trim();
    if (!trimmed || isSending) return;

    const userMessage = {
      id: createMessageId('user'),
      role: 'user',
      content: trimmed,
    };

    const historyPayload = messages
      .filter((msg) => msg.id !== 'welcome')
      .slice(-8)
      .map((msg) => ({ role: msg.role, content: msg.content }));

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setErrorText('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Unable to get a response right now.');
      }

      if (result.mode) {
        setAssistantMode(result.mode);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId('assistant'),
          role: 'assistant',
          content: result.reply,
          actions: Array.isArray(result.actions) ? result.actions.filter((a) => isSafeHref(a?.href)) : [],
          sources: Array.isArray(result.sources) ? result.sources : [],
        },
      ]);
    } catch (error) {
      setErrorText(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
    setErrorText('');
    inputRef.current?.focus();
  };

  const handleActionClick = (action) => {
    if (!action.external && !action.download && window.innerWidth < 640) {
      setIsOpen(false);
    }
  };

  const modeLabel = MODE_LABELS[assistantMode] || MODE_LABELS.builtin;

  return (
    <>
      {/* Floating Assistant Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.section
            id="portfolio-assistant-panel"
            role="dialog"
            aria-label="Ramesh Badugu Portfolio Assistant"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: shouldReduceMotion ? 0.1 : 0.2, ease: 'easeOut' }}
            className="fixed bottom-20 right-4 sm:right-6 z-[85] w-[calc(100vw-2rem)] sm:w-[400px] max-h-[min(560px,calc(100dvh-6.5rem))] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/70 text-blue-700 flex items-center justify-center shrink-0">
                  <Bot size={20} />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display font-bold text-sm text-gray-900 truncate">
                    Portfolio Assistant
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                    <span className="text-[11px] font-medium text-gray-500 truncate">
                      {modeLabel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleReset}
                  className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  aria-label="Reset conversation"
                  title="Reset conversation"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  aria-label="Close assistant"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                        isUser
                          ? 'bg-blue-700 text-white rounded-br-sm shadow-sm'
                          : 'bg-slate-50 border border-slate-200 text-slate-900 rounded-bl-sm shadow-xs'
                      }`}
                    >
                      {msg.content}
                    </div>

                    {!isUser && msg.actions?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 max-w-[92%]">
                        {msg.actions.map((action) => (
                          <a
                            key={`${msg.id}-${action.label}`}
                            href={action.href}
                            download={action.download ? 'Ramesh_Badugu_Resume.pdf' : undefined}
                            target={action.external ? '_blank' : undefined}
                            rel={action.external ? 'noopener noreferrer' : undefined}
                            onClick={() => handleActionClick(action)}
                            className="bg-white border border-slate-200 shadow-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                          >
                            {action.download && <Download size={12} />}
                            <span>{action.label}</span>
                            {action.external && <ExternalLink size={12} />}
                          </a>
                        ))}
                      </div>
                    )}

                    {!isUser && msg.sources?.length > 0 && assistantMode === 'rag' && (
                      <div className="flex flex-wrap gap-1 mt-1.5 max-w-[92%]">
                        {msg.sources.map((src) => (
                          <span
                            key={`${msg.id}-${src}`}
                            className="text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded"
                          >
                            {src}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Quick Prompts on fresh conversation */}
              {messages.length === 1 && !isSending && (
                <div className="pt-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-2">
                    Suggested questions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => sendMessage(prompt)}
                        className="bg-white border border-slate-200 shadow-xs px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition-colors text-left"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isSending && (
                <div className="flex items-start" aria-live="polite">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-xs flex items-center gap-1.5">
                    <span className="sr-only">Assistant is typing</span>
                    <span className={`w-1.5 h-1.5 rounded-full bg-blue-600 ${shouldReduceMotion ? '' : 'animate-pulse'}`} />
                    <span className={`w-1.5 h-1.5 rounded-full bg-blue-500 ${shouldReduceMotion ? '' : 'animate-pulse'}`} />
                    <span className={`w-1.5 h-1.5 rounded-full bg-blue-400 ${shouldReduceMotion ? '' : 'animate-pulse'}`} />
                  </div>
                </div>
              )}

              {errorText && (
                <div
                  role="alert"
                  className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2"
                >
                  {errorText}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={1500}
                placeholder="Ask about skills, Igris, experience..."
                aria-label="Ask Ramesh's portfolio assistant"
                className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors shrink-0"
                aria-label="Send question"
              >
                <Send size={17} />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls="portfolio-assistant-panel"
        aria-label={isOpen ? 'Close portfolio assistant' : 'Open portfolio assistant'}
        className="fixed bottom-5 right-4 sm:right-6 z-[85] min-h-[48px] px-4 py-2.5 rounded-full bg-blue-700 hover:bg-blue-800 text-white shadow-xl flex items-center gap-2 text-sm font-semibold tracking-wide transition-colors"
      >
        {isOpen ? (
          <>
            <X size={18} />
            <span>Close</span>
          </>
        ) : (
          <>
            <Sparkles size={17} />
            <span>Ask AI</span>
            <MessageSquare size={16} className="opacity-90 hidden sm:inline" />
          </>
        )}
      </button>
    </>
  );
}
