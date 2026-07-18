import { useState } from 'react';
import { Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [formState, setFormState] = useState({ from_name: '', from_email: '', subject: '', message: '', website: '' });
  const [status, setStatus] = useState('idle'); // idle, sending, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.from_name || !formState.from_email || !formState.subject || !formState.message) {
      setStatus('validation_error');
      setErrorMessage('Please complete every required field.');
      return;
    }

    setStatus('sending');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Message delivery failed.');

      setStatus('success');
      setFormState({ from_name: '', from_email: '', subject: '', message: '', website: '' });
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message);
    }
  };

  return (
    <section id="contact" className="relative py-24 px-6 md:px-12 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col items-center mb-16 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
          Get In Touch
        </span>
        <h2 className="font-display font-bold text-3xl md:text-4xl text-gray-900 tracking-tight">
          Contact Me
        </h2>
        <div className="w-12 h-1 bg-gray-900 rounded-full mt-6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
        {/* Left Column: Contact details */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <h3 className="font-display font-bold text-2xl text-gray-900 mb-4">
              Let&apos;s build something useful
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed font-sans mb-8">
              Whether you want to discuss frontend development, AI workflows, or a collaboration opportunity, reach out. Let&apos;s start the conversation.
            </p>
          </div>

          {/* Details list */}
          <div className="space-y-4">
            <div className="liquid-glass flex items-start gap-4 p-4 rounded-xl">
              <div className="p-3 rounded-lg bg-gray-100 text-gray-700 mt-1">
                <Mail size={18} />
              </div>
              <div className="space-y-3 w-full">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Email Me</span>
                  <a href="mailto:rameshbadugums@gmail.com" className="text-sm text-gray-900 hover:text-gray-600 transition-colors font-mono block mt-0.5 break-all">
                    rameshbadugums@gmail.com
                  </a>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Phone</span>
                  <a href="tel:+19083095257" className="text-sm text-gray-900 hover:text-gray-600 transition-colors font-mono block mt-0.5">
                    +1 908 309 5257
                  </a>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">LinkedIn</span>
                  <a href="https://linkedin.com/in/rameshbadugu" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-900 hover:text-gray-600 transition-colors font-mono block mt-0.5">
                    linkedin.com/in/rameshbadugu
                  </a>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">GitHub</span>
                  <a href="https://github.com/rameshio" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-900 hover:text-gray-600 transition-colors font-mono block mt-0.5">
                    github.com/rameshio
                  </a>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Website</span>
                  <a href="https://rameshbaduguai.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-900 hover:text-gray-600 transition-colors font-mono block mt-0.5">
                    rameshbaduguai.com
                  </a>
                </div>
              </div>
            </div>

            <div className="liquid-glass flex items-center gap-4 p-4 rounded-xl">
              <div className="p-3 rounded-lg bg-gray-100 text-gray-700">
                <MapPin size={18} />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">Location</span>
                <span className="text-sm text-gray-900 block mt-0.5">
                  United States (Remote Available)
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-7 w-full">
          <form onSubmit={handleSubmit} className="liquid-glass p-8 md:p-10 rounded-3xl space-y-6 relative">
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={formState.website}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name Input */}
              <div className="flex flex-col text-left">
                <label htmlFor="from_name" className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-2">
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
                  className="glass-input px-4 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Email Input */}
              <div className="flex flex-col text-left">
                <label htmlFor="from_email" className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-2">
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
                  className="glass-input px-4 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Subject Input */}
            <div className="flex flex-col text-left">
              <label htmlFor="subject" className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-2">
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
                className="glass-input px-4 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Message Input */}
            <div className="flex flex-col text-left">
              <label htmlFor="message" className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-2">
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
                className="glass-input px-4 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors resize-y"
              />
            </div>

            {/* Submit Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Warnings/Success Notification Area */}
              <div className="min-h-6" role="status" aria-live="polite" aria-atomic="true">
                {status === 'success' && (
                  <span className="text-green-600 font-medium text-xs flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Message sent successfully. I will get back to you soon.
                  </span>
                )}
                {status === 'validation_error' && (
                  <span className="text-red-600 font-medium text-xs">
                    {errorMessage}
                  </span>
                )}
                {status === 'error' && (
                  <span className="text-red-600 font-medium text-xs leading-normal block">
                    {errorMessage || 'Message failed to send.'} Please email me directly at{' '}
                    <a href="mailto:rameshbadugums@gmail.com" className="underline hover:text-red-500 font-mono">
                      rameshbadugums@gmail.com
                    </a>.
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'sending'}
                className={`px-8 py-3 rounded-xl text-xs font-semibold uppercase tracking-widest flex items-center gap-2 transition-colors ${
                  status === 'sending'
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-700 hover:bg-blue-800 text-white shadow-sm'
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
                    <Send size={14} /> Dispatch Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
