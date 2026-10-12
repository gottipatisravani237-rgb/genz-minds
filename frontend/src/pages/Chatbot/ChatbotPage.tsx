import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Trash2,
  Sparkles,
  Bot,
  User as UserIcon,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { MediNovaAIOrb } from '../../components/common/MediNovaAIOrb';
import { MedicalDisclaimer } from '../../components/common/MedicalDisclaimer';

export const ChatbotPage: React.FC = () => {
  const {
    chatMessages,
    sendMessage,
    clearChat,
    isAiThinking,
    profile,
  } = useHealth();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    'What medicines do I take today?',
    'What should I take at 8 PM?',
    'What medicine is next?',
    'Did I take my medicine?',
    'Show my adherence',
    'Explain my medicines',
    'Explain my prescription',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiThinking]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isAiThinking) return;
    sendMessage(text);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/50 text-teal-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real-time Clinical Companion</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            MediNova AI Assistant
          </h1>
          <p className="text-base text-slate-600 font-medium mt-1">
            Connected directly to your active prescriptions, schedules, and allergy history
          </p>
        </div>

        <button
          onClick={clearChat}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Main Glass Chat Panel */}
      <div className="glass-panel bg-white/90 rounded-3xl border border-white/80 shadow-2xl flex flex-col h-[650px] overflow-hidden">
        {/* Quick Question Bar */}
        <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0">
            <HelpCircle className="w-3.5 h-3.5 text-teal-500" />
            Quick Prompt:
          </span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3 py-1.5 rounded-full bg-white text-xs text-slate-700 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 shadow-2xs whitespace-nowrap transition font-medium"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatMessages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-white shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-md shadow-teal-600/20 rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 shadow-xs rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-line prose prose-sm text-inherit max-w-none">
                  {msg.content}
                </div>
                <div
                  className={`text-[10px] mt-2 font-medium ${
                    msg.sender === 'user' ? 'text-teal-100 text-right' : 'text-slate-400'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isAiThinking && (
            <div className="flex items-center gap-3 text-teal-700 bg-teal-50/80 p-3 rounded-2xl border border-teal-200/50 w-fit">
              <MediNovaAIOrb size="sm" isThinking={true} />
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
                <span>MediNova AI is thinking…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question or choose a prompt above..."
            className="flex-1 px-4 py-3 rounded-xl glass-input text-sm text-slate-800 placeholder-slate-400"
            disabled={isAiThinking}
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || isAiThinking}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-bold text-sm shadow-md shadow-teal-500/25 hover:opacity-95 disabled:opacity-40 transition flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </div>

      <MedicalDisclaimer />
    </div>
  );
};
