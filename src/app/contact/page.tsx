'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Mail, MessageSquare, ArrowLeft, Send, Shield, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gunmetal text-white selection:bg-halo-cyan selection:text-black">
      <div className="h-[2px] w-full bg-gradient-to-r from-halo-cyan via-vice-pink to-vice-orange" />
      <Navbar />

      <main className="flex-1 max-w-[1080px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        <div className="relative clip-chamfer p-[1.5px] bg-gradient-to-br from-halo-cyan/40 via-white/10 to-vice-pink/30 shadow-halo">
          <div className="relative clip-chamfer bg-gradient-to-br from-gunmetal-800 via-gunmetal-900 to-[#05070F] p-6 sm:p-10 space-y-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="inline-flex items-center gap-1 text-xs font-mono text-halo-cyan hover:underline">
                <ArrowLeft className="h-3.5 w-3.5" /> Home
              </Link>
              <span className="text-white/20">•</span>
              <span className="px-2 py-0.5 bg-halo-cyan/10 border border-halo-cyan/30 text-halo-cyan clip-chamfer-sm font-mono text-[9px] font-bold uppercase">
                Developer Support
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl tracking-wide uppercase text-white leading-none">
              Contact & Support
            </h1>
            <p className="font-tech text-base text-white/70 max-w-2xl leading-relaxed">
              We value user feedback, bug reports, and tool suggestions. Get in touch with our team directly.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Direct Support Card */}
          <div className="clip-chamfer bg-gunmetal-800/60 border border-white/10 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-10 w-10 clip-chamfer-sm bg-halo-cyan/10 border border-halo-cyan/30 flex items-center justify-center text-halo-cyan">
                <Mail className="h-5 w-5" />
              </div>
              <h2 className="font-display text-2xl text-white uppercase">Direct Email</h2>
              <p className="font-mono text-xs text-white/60 leading-relaxed">
                For security inquiries, developer outreach, or tool feedback, send an email to:
              </p>
              <div className="p-3 bg-black/40 border border-halo-cyan/30 rounded font-mono text-sm text-halo-cyan font-bold">
                support@toolip.app
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-xs font-mono text-white/40 flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" /> Response time: Usually within 24 hours
            </div>
          </div>

          {/* Contact Form */}
          <div className="clip-chamfer bg-gunmetal-800/60 border border-white/10 p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-xl text-white uppercase flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-halo-cyan" /> Send Message
            </h2>

            {submitted ? (
              <div className="p-4 clip-chamfer bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="h-4 w-4" /> Message Submitted!
                </div>
                <p>Thank you for your feedback. Our team will review your message shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-white/60">Your Name:</label>
                  <input
                    required
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded text-white focus:outline-none focus:border-halo-cyan"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-white/60">Your Email:</label>
                  <input
                    required
                    type="email"
                    placeholder="john@example.com"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded text-white focus:outline-none focus:border-halo-cyan"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-white/60">Message / Tool Suggestion:</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Type your feedback or new tool request..."
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded text-white focus:outline-none focus:border-halo-cyan resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-halo-cyan text-gunmetal-900 font-bold clip-chamfer-sm flex items-center justify-center gap-2 hover:bg-halo-cyan/90 transition-colors uppercase tracking-wider"
                >
                  <Send className="h-4 w-4" /> Send Feedback
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
