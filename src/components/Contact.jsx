import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, MessageSquare, ShieldCheck, CheckCircle2 } from 'lucide-react';
import emailjs from '@emailjs/browser';

export default function Contact() {
  const [formState, setFormState] = useState({ from_name: '', from_email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle, sending, success, error
  const formRef = useRef();

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.from_name || !formState.from_email || !formState.subject || !formState.message) {
      setStatus('validation_error');
      return;
    }
    
    setStatus('sending');

    // EmailJS keys from environment variables
    const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceID || !templateID || !publicKey) {
      console.error("EmailJS error: Environment variables are missing");
      setStatus('error');
      return;
    }

    emailjs.sendForm(serviceID, templateID, formRef.current, {
      publicKey: publicKey
    })
      .then(() => {
        setStatus('success');
        setFormState({ from_name: '', from_email: '', subject: '', message: '' });
      })
      .catch((error) => {
        console.error("EmailJS error:", error);
        setStatus('error');
      });
  };

  return (
    <section id="contact" className="relative py-24 px-6 md:px-12 max-w-6xl mx-auto z-10">
      {/* Title */}
      <div className="flex flex-col items-center mb-16 text-center">
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-2 glow-text-red"
        >
          Get In Touch
        </motion.span>
        <h2 className="font-display font-black text-3xl md:text-5xl text-white tracking-tight">
          Contact <span className="gradient-text-red">Me</span>
        </h2>
        <div className="w-16 h-1 bg-red-600 rounded-full mt-4 shadow-[0_0_10px_#ef4444]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
        {/* Left Column: Contact details & security fingerprint */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <h3 className="font-display font-extrabold text-2xl text-white mb-4">
              Let's build something epic
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed font-sans font-light mb-8">
              Whether you need to scale database services, migrate architecture to Spring Boot microservices, or automate complex business procedures with AI Agents, reach out. Let's start the conversation.
            </p>
          </div>

          {/* Details list */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl glassmorphism border border-red-950/20">
              <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/15 text-red-500 mt-1">
                <Mail size={18} />
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider font-sans">Email Me</span>
                  <a href="mailto:rameshbadugums@gmail.com" className="text-sm text-zinc-200 hover:text-red-400 transition-colors font-mono block mt-0.5">
                    rameshbadugums@gmail.com
                  </a>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider font-sans">Phone</span>
                  <a href="tel:+19083095257" className="text-sm text-zinc-200 hover:text-red-400 transition-colors font-mono block mt-0.5">
                    +1 908-309-5257
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl glassmorphism border border-red-950/20">
              <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/15 text-red-500">
                <MapPin size={18} />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider font-sans">Location</span>
                <span className="text-sm text-zinc-200 block mt-0.5">
                  United States (Remote Available)
                </span>
              </div>
            </div>
          </div>

          {/* Decorative Terminal PGP Block */}
          <div className="p-5 rounded-2xl glassmorphism border border-red-950/20 font-mono text-[10px] text-zinc-500 leading-normal space-y-2">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <ShieldCheck size={12} className="text-red-500" />
              <span>PGP FINGERPRINT</span>
            </div>
            <div className="break-all text-zinc-600 bg-black/30 p-2.5 rounded border border-zinc-950">
              EEA4 71BF CA2D 8421 DB90 FFE9 29AB E010 398D 66BA
            </div>
            <div className="text-[9px] text-red-500/60 font-semibold uppercase tracking-widest text-right">
              ENCRYPTED CHANNEL
            </div>
          </div>
        </div>

        {/* Right Column: Glassmorphism Form */}
        <div className="lg:col-span-7 w-full">
          <form ref={formRef} onSubmit={handleSubmit} className="glassmorphism p-8 md:p-10 rounded-3xl border border-red-950/35 space-y-6 relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name Input */}
              <div className="flex flex-col text-left">
                <label htmlFor="from_name" className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-2 font-sans">
                  Your Name
                </label>
                <input
                  type="text"
                  id="from_name"
                  name="from_name"
                  required
                  value={formState.from_name}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Badugu"
                  className="px-4 py-3 rounded-xl bg-black/40 text-sm text-white placeholder-zinc-600 border border-red-950/30 focus:border-red-500/50 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)] focus:outline-none transition-all duration-300 font-sans"
                />
              </div>

              {/* Email Input */}
              <div className="flex flex-col text-left">
                <label htmlFor="from_email" className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-2 font-sans">
                  Your Email
                </label>
                <input
                  type="email"
                  id="from_email"
                  name="from_email"
                  required
                  value={formState.from_email}
                  onChange={handleChange}
                  placeholder="e.g. yourname@domain.com"
                  className="px-4 py-3 rounded-xl bg-black/40 text-sm text-white placeholder-zinc-600 border border-red-950/30 focus:border-red-500/50 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)] focus:outline-none transition-all duration-300 font-sans"
                />
              </div>
            </div>

            {/* Subject Input */}
            <div className="flex flex-col text-left">
              <label htmlFor="subject" className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-2 font-sans">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formState.subject}
                onChange={handleChange}
                placeholder="e.g. Project Collaboration Opportunity"
                className="px-4 py-3 rounded-xl bg-black/40 text-sm text-white placeholder-zinc-600 border border-red-950/30 focus:border-red-500/50 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)] focus:outline-none transition-all duration-300 font-sans"
              />
            </div>

            {/* Message Input */}
            <div className="flex flex-col text-left">
              <label htmlFor="message" className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-2 font-sans">
                Your Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={formState.message}
                onChange={handleChange}
                placeholder="Briefly describe your request..."
                className="px-4 py-3 rounded-xl bg-black/40 text-sm text-white placeholder-zinc-600 border border-red-950/30 focus:border-red-500/50 focus:shadow-[0_0_15px_rgba(239,68,68,0.15)] focus:outline-none transition-all duration-300 resize-none font-sans"
              />
            </div>

            {/* Submit Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Warnings/Success Notification Area */}
              <div className="h-6">
                {status === 'success' && (
                  <span className="text-emerald-500 font-semibold text-xs flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Message sent successfully. I will get back to you soon.
                  </span>
                )}
                {status === 'validation_error' && (
                  <span className="text-red-500 font-semibold text-xs">
                    Please fill out all input fields.
                  </span>
                )}
                {status === 'error' && (
                  <span className="text-red-500 font-semibold text-xs leading-normal block">
                    Message failed to send. Please email me directly at{' '}
                    <a href="mailto:rameshbadugums@gmail.com" className="underline hover:text-red-400 font-mono">
                      rameshbadugums@gmail.com
                    </a>.
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={status === 'sending'}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`px-8 py-3.5 rounded-2xl text-xs font-semibold uppercase tracking-widest text-white shadow-xl flex items-center gap-2 cursor-pointer transition-all duration-300 ${
                  status === 'sending'
                    ? 'bg-zinc-800 border-zinc-700 shadow-none'
                    : 'bg-gradient-to-r from-red-700 to-red-900 border border-red-500/40 hover:border-red-400 shadow-red-500/10'
                }`}
              >
                {status === 'sending' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={12} /> Dispatch Message
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
