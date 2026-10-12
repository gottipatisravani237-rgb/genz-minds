import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  X,
  Trash2,
  Sparkles,
  Bot,
  User as UserIcon,
  HelpCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { MediNovaAIOrb } from '../common/MediNovaAIOrb';

export const MediNovaChatbotDrawer: React.FC = () => {
  const {
    chatMessages,
    isChatOpen,
    setIsChatOpen,
    sendMessage,
    clearChat,
    isAiThinking,
  } = useHealth();

  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [chatMessages, isChatOpen, isAiThinking]);

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
    <>
      {/* Floating AI Orb in bottom-right */}
      {!isChatOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsChatOpen(true)}
            className="cursor-pointer group relative flex items-center gap-3 bg-white/80 backdrop-blur-xl p-2.5 pr-4 rounded-full shadow-2xl border border-white/60 hover:shadow-teal-500/20 transition-all"
          >
            <MediNovaAIOrb size="sm" isThinking={false} />
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                Ask MediNova AI
                <Sparkles className="w-3 h-3 text-teal-500 animate-pulse" />
              </span>
              <span className="text-[10px] text-teal-600 font-medium">Click to chat</span>
            </div>
            {/* Ambient halo */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500/20 via-teal-400/20 to-cyan-400/20 blur-md -z-10 group-hover:opacity-100 opacity-60 transition" />
          </motion.div>
        </div>
      )}

      {/* Floating Glass Chat Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 glass-panel bg-white/95 rounded-3xl shadow-2xl border border-white/80 flex flex-col overflow-hidden transition-all duration-300 ${
              isExpanded
                ? 'w-[94vw] md:w-[650px] h-[86vh]'
                : 'w-[94vw] md:w-[440px] h-[600px] max-h-[88vh]'
            }`}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-emerald-500/10 border-b border-teal-100/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MediNovaAIOrb size="sm" isThinking={isAiThinking} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">MediNova AI</h3>
                    <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold uppercase tracking-wider">
                      Live Health Engine
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Your intelligent health companion</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition hidden md:block"
                  title={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={clearChat}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Clear conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  title="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Questions Chips Bar */}
            <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 overflow-x-auto flex gap-1.5 no-scrollbar">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
                <HelpCircle className="w-3 h-3 text-teal-500" />
                Quick:
              </span>
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="px-2.5 py-1 rounded-full bg-white text-xs text-slate-700 hover:text-teal-700 hover:bg-teal-50 border border-slate-200/80 shadow-2xs whitespace-nowrap transition"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Bot className="w-12 h-12 text-teal-400/60 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No messages yet</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Ask me about your today’s doses, adherence statistics, or active medications!
                  </p>
                </div>
              ) : (
                chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'assistant' && (
                      <div className="shrink-0 mt-1">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-xs">
                          <Bot className="w-4 h-4" />
                        </div>
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-tr-xs shadow-md shadow-teal-600/20'
                          : 'bg-white/90 text-slate-800 rounded-tl-xs border border-slate-200/70 shadow-xs'
                      }`}
                    >
                      <div className="prose prose-xs text-inherit max-w-none whitespace-pre-line">
                        {renderMessageContent(msg.content)}
                      </div>
                      <div
                        className={`text-[10px] mt-1.5 font-medium ${
                          msg.sender === 'user' ? 'text-teal-100 text-right' : 'text-slate-400'
                        }`}
                      >
                        {formatMsgTime(msg.timestamp)}
                      </div>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="shrink-0 mt-1">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                          <UserIcon className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Thinking Indicator */}
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
            <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your medicine, time, or schedule..."
                className="flex-1 px-4 py-2.5 rounded-xl glass-input text-sm text-slate-800 placeholder-slate-400"
                disabled={isAiThinking}
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || isAiThinking}
                className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-md shadow-teal-500/25 hover:opacity-95 disabled:opacity-40 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

function formatMsgTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function renderMessageContent(content: string) {
  // Simple markdown renderer for bold, headers, list items
  const lines = content.split('\n');
  return lines.map((line, idx) => {
    let formatted = line;
    // Replace bold **text**
    const parts = [];
    let remaining = line;
    let match;
    const regex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(remaining.substring(0, match.index - lastIndex));
      }
      parts.push(<strong key={`${idx}-${match.index}`} className="font-bold text-slate-900">{match[1]}</strong>);
      remaining = remaining.substring(match.index - lastIndex + match[0].length);
      lastIndex = match.index + match[0].length;
    }
    if (remaining.length > 0) {
      parts.push(remaining);
    }

    if (line.startsWith('### ')) {
      return (
        <h4 key={idx} className="text-sm font-bold text-slate-900 mt-2 mb-1">
          {line.replace('### ', '')}
        </h4>
      );
    }
    if (line.startsWith('#### ')) {
      return (
        <h5 key={idx} className="text-xs font-bold text-teal-800 mt-1.5 mb-0.5">
          {line.replace('#### ', '')}
        </h5>
      );
    }
    if (line.startsWith('> ')) {
      return (
        <blockquote key={idx} className="border-l-2 border-amber-400 pl-2 text-[11px] text-slate-500 my-1 bg-amber-50/50 py-1 rounded-r">
          {line.replace('> ', '')}
        </blockquote>
      );
    }
    if (line.startsWith('* ') || line.startsWith('• ') || line.startsWith('- ')) {
      return (
        <div key={idx} className="flex items-start gap-1.5 my-0.5">
          <span className="text-teal-500 mt-0.5 font-bold">•</span>
          <span>{parts.length > 0 ? parts : formatted}</span>
        </div>
      );
    }

    return (
      <p key={idx} className="my-0.5">
        {parts.length > 0 ? parts : formatted}
      </p>
    );
  });
}
