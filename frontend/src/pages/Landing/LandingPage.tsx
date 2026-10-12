import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Heart,
  ShieldCheck,
  FileText,
  Sparkles,
  Bot,
  Pill,
  CalendarCheck,
  Mic,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Clock,
  HelpCircle,
  Stethoscope,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-[#05090D] text-[#F4F7FA] selection:bg-[#00D084] selection:text-[#05090D] overflow-x-hidden">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#080E13]/85 backdrop-blur-md border-b border-[#203039] px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00D084] via-[#21E6C1] to-emerald-400 flex items-center justify-center text-[#05090D] shadow-lg shadow-[#00D084]/25">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-black text-[#F4F7FA] tracking-tight">
                MEDINOVA<span className="text-[#00D084]">-AI</span>
              </span>
              <p className="text-[10px] text-[#9BAAB6] tracking-wider uppercase font-semibold">
                AI-Powered Personal Health Copilot
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#9BAAB6]">
            <a href="#features" className="hover:text-[#00D084] transition">Features</a>
            <a href="#how-it-works" className="hover:text-[#00D084] transition">How It Works</a>
            <a href="#clinical-safety" className="hover:text-[#00D084] transition">Clinical Safety</a>
            <a href="#faqs" className="hover:text-[#00D084] transition">FAQs</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogin}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#F4F7FA] hover:text-[#00D084] hover:bg-[#111F28] transition border border-transparent hover:border-[#203039]"
            >
              Log In
            </button>
            <button
              onClick={onGetStarted}
              className="btn-emerald text-xs !py-2 !px-4"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section: Split Screen */}
      <section className="relative px-6 lg:px-12 pt-12 pb-20 max-w-7xl mx-auto">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00D084]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#21E6C1]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111F28] border border-[#203039] text-[#00D084] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#00D084] animate-pulse" />
              <span>Smarter Healthcare. Clearer Understanding.</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#F4F7FA] tracking-tight leading-[1.1]">
              Smarter Healthcare.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D084] via-[#21E6C1] to-emerald-400">
                Better Decisions.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#9BAAB6] font-medium leading-relaxed max-w-xl">
              MEDINOVA-AI transforms complex lab reports and handwritten prescriptions into plain-language medical understanding, automated medication schedules, and clinical guidance grounded in your own health records.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onGetStarted}
                className="btn-emerald text-sm !px-6 !py-3.5 group shadow-lg shadow-[#00D084]/20"
              >
                <span>Launch Health Copilot</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
              <button
                onClick={onGetStarted}
                className="btn-secondary-dark text-sm !px-6 !py-3.5"
              >
                <span>Try Demo Account</span>
              </button>
            </div>

            {/* 4 Compact Feature Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-[#203039]/70">
              <div className="p-3 rounded-xl bg-[#0D171F] border border-[#203039] flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-[#00D084] flex-shrink-0" />
                <span className="text-xs font-semibold text-[#F4F7FA]">Instant Report OCR</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0D171F] border border-[#203039] flex items-center gap-2.5">
                <Bot className="w-4 h-4 text-[#21E6C1] flex-shrink-0" />
                <span className="text-xs font-semibold text-[#F4F7FA]">Grounded Medical RAG</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0D171F] border border-[#203039] flex items-center gap-2.5">
                <Pill className="w-4 h-4 text-[#00D084] flex-shrink-0" />
                <span className="text-xs font-semibold text-[#F4F7FA]">Prescription to Schedule</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0D171F] border border-[#203039] flex items-center gap-2.5">
                <Mic className="w-4 h-4 text-[#21E6C1] flex-shrink-0" />
                <span className="text-xs font-semibold text-[#F4F7FA]">5 Language Voice AI</span>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Futuristic Healthcare Preview */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl p-6 bg-[#0D171F] border border-[#203039] shadow-2xl space-y-4">
              {/* Header inside preview */}
              <div className="flex items-center justify-between pb-3 border-b border-[#203039]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FF5C68]" />
                  <span className="w-3 h-3 rounded-full bg-[#FFB547]" />
                  <span className="w-3 h-3 rounded-full bg-[#00D084]" />
                  <span className="text-xs text-[#9BAAB6] font-mono ml-2">medinova-clinical-copilot.sys</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111F28] border border-[#00D084]/40 text-[#00D084] text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D084] animate-pulse" />
                  <span>Vitals Synchronized</span>
                </div>
              </div>

              {/* Glowing Anatomical Heart & Vitals Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Heart Illustration Card */}
                <div className="p-4 rounded-2xl bg-[#111F28] border border-[#203039] flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#00D084]/5 to-transparent pointer-events-none" />
                  <div className="relative my-2">
                    <div className="w-20 h-20 rounded-full bg-[#00D084]/15 border border-[#00D084]/40 flex items-center justify-center text-[#00D084] animate-heartbeat shadow-lg shadow-[#00D084]/20">
                      <Heart className="w-10 h-10 fill-[#00D084]/30 stroke-[2.2]" />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#F4F7FA]">Cardiac & Metabolic Health</span>
                  <span className="text-[10px] text-[#00D084] font-semibold mt-0.5">Rhythm: 72 BPM • Sinus Regular</span>
                </div>

                {/* AI Analysis Summary Card */}
                <div className="p-4 rounded-2xl bg-[#111F28] border border-[#203039] flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#F4F7FA] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#00D084]" />
                        AI Lab Findings
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFB547]/20 text-[#FFB547] font-bold">
                        Mild Glycemic
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9BAAB6] leading-relaxed pt-1">
                      Fasting Sugar: <strong className="text-[#FFB547]">128 mg/dL</strong> (Ref 70-99).
                      HbA1c: <strong className="text-[#FFB547]">6.8%</strong>. Kidneys & eGFR are completely normal.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#203039] flex items-center justify-between text-[10px] text-[#9BAAB6]">
                    <span>Source: Apollo Metabolic</span>
                    <span className="text-[#00D084] font-bold">98% Match</span>
                  </div>
                </div>
              </div>

              {/* Medication Schedule & Adherence Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Medication Schedule Card */}
                <div className="p-4 rounded-2xl bg-[#111F28] border border-[#203039] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F4F7FA] flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-[#00D084]" />
                      Today's Next Dose
                    </span>
                    <span className="text-[10px] text-[#21E6C1] font-bold">Due 09:00 AM</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0D171F] border border-[#203039] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#F4F7FA] block">Metformin 500mg</span>
                      <span className="text-[10px] text-[#9BAAB6]">1 tab • After breakfast</span>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-[#00D084]/20 text-[#00D084] text-[10px] font-bold">
                      Confirmed
                    </span>
                  </div>
                </div>

                {/* Adherence Chart Card */}
                <div className="p-4 rounded-2xl bg-[#111F28] border border-[#203039] flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F4F7FA] flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#00D084]" />
                      Adherence Score
                    </span>
                    <span className="text-sm font-black text-[#00D084]">94.2%</span>
                  </div>
                  <div className="space-y-1.5 my-2">
                    <div className="w-full bg-[#0D171F] h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-[#00D084] to-[#21E6C1] h-full rounded-full w-[94%]" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#9BAAB6]">
                      <span>Taken: 16 doses</span>
                      <span>Formula: (taken/eligible)*100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Appointment Card */}
              <div className="p-3.5 rounded-2xl bg-[#111F28] border border-[#203039] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#00D084]/20 border border-[#00D084]/40 flex items-center justify-center text-[#00D084]">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#F4F7FA] block">
                      Consultation with Dr. Ramesh Varma, MD
                    </span>
                    <span className="text-[10px] text-[#9BAAB6]">
                      Cardiology & Metabolic Review • Oct 18, 11:00 AM (Video Call)
                    </span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-lg bg-[#00D084]/15 text-[#00D084] font-bold border border-[#00D084]/30">
                  Confirmed
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 lg:px-12 border-t border-[#203039] bg-[#0A1118]/50">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#00D084] tracking-widest uppercase">
              Full-Stack Medical Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#F4F7FA]">
              Engineered for Clinical Precision
            </h2>
            <p className="text-sm text-[#9BAAB6]">
              Every module is designed to eliminate ambiguity, organize medication regimens, and keep patients informed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card-interactive p-6 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#00D084]/15 border border-[#00D084]/30 flex items-center justify-center text-[#00D084]">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F4F7FA]">Intelligent Document & Lab OCR</h3>
              <p className="text-xs text-[#9BAAB6] leading-relaxed">
                Extracts lab values, units, reference ranges, and abnormal indicators from PDF and images without losing clinical context.
              </p>
            </div>

            <div className="glass-card-interactive p-6 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#21E6C1]/15 border border-[#21E6C1]/30 flex items-center justify-center text-[#21E6C1]">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F4F7FA]">Grounded Medical RAG Copilot</h3>
              <p className="text-xs text-[#9BAAB6] leading-relaxed">
                Answers personal health questions using your uploaded documents and confirmed prescriptions, providing verified citations down to document and page.
              </p>
            </div>

            <div className="glass-card-interactive p-6 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#00D084]/15 border border-[#00D084]/30 flex items-center justify-center text-[#00D084]">
                <Pill className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F4F7FA]">Human-in-the-Loop Prescriptions</h3>
              <p className="text-xs text-[#9BAAB6] leading-relaxed">
                Extracts medicine names, strengths, food instructions, and timings for your review before converting them into active medication alarms.
              </p>
            </div>

            <div className="glass-card-interactive p-6 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#21E6C1]/15 border border-[#21E6C1]/30 flex items-center justify-center text-[#21E6C1]">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F4F7FA]">Multilingual Voice Consultation</h3>
              <p className="text-xs text-[#9BAAB6] leading-relaxed">
                Speaks and understands English, Telugu, Hindi, Tamil, and Kannada with built-in safeguards against unconfirmed prescription changes.
              </p>
            </div>

            <div className="glass-card-interactive p-6 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#00D084]/15 border border-[#00D084]/30 flex items-center justify-center text-[#00D084]">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F4F7FA]">Rigorous Adherence Analytics</h3>
              <p className="text-xs text-[#9BAAB6] leading-relaxed">
                Calculates actual adherence percentages from persistent dose events (taken, skipped, missed) with full auditability.
              </p>
            </div>

            <div className="glass-card-interactive p-6 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#21E6C1]/15 border border-[#21E6C1]/30 flex items-center justify-center text-[#21E6C1]">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F4F7FA]">Conflict-Free Doctor Booking</h3>
              <p className="text-xs text-[#9BAAB6] leading-relaxed">
                Find specialists by department, view credentials and ratings, and book consultation slots with database-level conflict detection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Clinical Safety & Privacy */}
      <section id="clinical-safety" className="py-20 px-6 lg:px-12 border-t border-[#203039]">
        <div className="max-w-5xl mx-auto rounded-3xl p-8 lg:p-12 bg-[#0D171F] border border-[#00D084]/30 shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[#00D084]" />
            <div>
              <h3 className="text-xl font-bold text-[#F4F7FA]">Strict Clinical Safety & Tenant Isolation</h3>
              <p className="text-xs text-[#9BAAB6]">Zero data leakage across users. Evidence-grounded responses only.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#9BAAB6]">
            <div className="p-4 rounded-xl bg-[#111F28] border border-[#203039] space-y-1.5">
              <span className="font-bold text-[#F4F7FA] block">Strict Tenant Isolation</span>
              Every vector chunk and document query is restricted by user ownership. User A can never retrieve User B's records.
            </div>
            <div className="p-4 rounded-xl bg-[#111F28] border border-[#203039] space-y-1.5">
              <span className="font-bold text-[#F4F7FA] block">Prescription Confirmation Guard</span>
              AI will never silently alter doses or invent schedules. Every extracted medicine requires explicit user confirmation.
            </div>
            <div className="p-4 rounded-xl bg-[#111F28] border border-[#203039] space-y-1.5">
              <span className="font-bold text-[#F4F7FA] block">Grounded Medical Citations</span>
              Responses state when records have insufficient data rather than fabricating laboratory results or diagnoses.
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="py-20 px-6 lg:px-12 border-t border-[#203039] bg-[#0A1118]/50">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[#F4F7FA]">Frequently Asked Questions</h2>
            <p className="text-xs text-[#9BAAB6]">Important clinical and technical questions regarding MEDINOVA-AI.</p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#0D171F] border border-[#203039] space-y-2">
              <h4 className="text-sm font-bold text-[#F4F7FA]">How does the RAG pipeline ground AI responses?</h4>
              <p className="text-xs text-[#9BAAB6] leading-relaxed">
                When you upload a medical report or prescription, it is processed via OCR, normalized, chunked, and embedded into pgvector. When you ask a question, MEDINOVA-AI retrieves only chunks from your own account and synthesizes an answer referencing exact documents and page numbers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D171F] border border-[#203039] space-y-2">
              <h4 className="text-sm font-bold text-[#F4F7FA]">Can MEDINOVA-AI replace my primary doctor?</h4>
              <p className="text-xs text-[#9BAAB6] leading-relaxed">
                No. MEDINOVA-AI is a personal health copilot designed to help you organize documents, understand medical terms in plain language, and adhere to prescribed regimens. It explicitly generates consultation questions for you to discuss with your licensed physician.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D171F] border border-[#203039] space-y-2">
              <h4 className="text-sm font-bold text-[#F4F7FA]">Which Indian regional languages are supported for voice?</h4>
              <p className="text-xs text-[#9BAAB6] leading-relaxed">
                MEDINOVA-AI provides multilingual speech recognition and synthesized responses in English, Telugu (తెలుగు), Hindi (हिन्दी), Tamil (தமிழ்), and Kannada (ಕನ್ನಡ).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 lg:px-12 border-t border-[#203039] text-center text-xs text-[#9BAAB6]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00D084]" />
            <span className="font-bold text-[#F4F7FA]">MEDINOVA-AI</span>
            <span>— Smarter Healthcare. Clearer Understanding.</span>
          </div>
          <span>Clinical Healthcare Platform • HIPAA & Tenant Isolated Architecture</span>
        </div>
      </footer>
    </div>
  );
};
