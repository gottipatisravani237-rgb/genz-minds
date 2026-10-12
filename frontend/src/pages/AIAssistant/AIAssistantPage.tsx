import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  User,
  Send,
  Sparkles,
  FileText,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  Loader2,
  Bookmark,
  ExternalLink,
} from 'lucide-react';
import { healthApi, ChatMessage } from '../../services/healthApi';

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content:
        "Hello! I am MEDINOVA-AI, your personal health copilot. " +
        "I can answer questions grounded in your uploaded laboratory reports and confirmed prescriptions. " +
        "How can I help you today?",
      citations: [],
      is_grounded: false,
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [useRag, setUseRag] = useState(true);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      content: text,
      citations: [],
      is_grounded: false,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await healthApi.chat(text, undefined, useRag);
      setMessages((prev) => [...prev, response]);
    } catch (e: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content: `Error contacting clinical copilot: ${e.message || 'Please verify the backend server is running.'}`,
        citations: [],
        is_grounded: false,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const promptSuggestions = [
    "What is my fasting blood sugar and HbA1c from my latest test?",
    "What are the food instructions and dosages for my medicines?",
    "Are any of my lipid or cholesterol values outside reference ranges?",
    "What questions should I ask my cardiologist at my next visit?",
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-5rem)] flex flex-col space-y-4">
      {/* Top Bar with Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#203039]">
        <div>
          <h1 className="text-xl font-black text-[#F4F7FA] tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#00D084]" />
            AI Health Assistant
          </h1>
          <p className="text-[11px] text-[#9BAAB6]">
            Grounded personal health answers with strict HIPAA tenant isolation.
          </p>
        </div>

        {/* RAG Toggle */}
        <div className="flex items-center gap-2 bg-[#111F28] p-1 rounded-xl border border-[#203039] self-start sm:self-auto">
          <button
            onClick={() => setUseRag(true)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              useRag ? 'bg-[#00D084] text-[#05090D] shadow-sm' : 'text-[#9BAAB6] hover:text-[#F4F7FA]'
            }`}
          >
            Search My Records (RAG)
          </button>
          <button
            onClick={() => setUseRag(false)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              !useRag ? 'bg-[#111F28] text-[#21E6C1] border border-[#21E6C1]/40' : 'text-[#9BAAB6] hover:text-[#F4F7FA]'
            }`}
          >
            General Medical
          </button>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-[#00D084]/15 border border-[#00D084]/30 flex items-center justify-center text-[#00D084] flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                  isUser
                    ? 'bg-[#00D084] text-[#05090D] font-medium ml-12 rounded-tr-none'
                    : 'glass-panel-dark text-[#F4F7FA] mr-12 rounded-tl-none border border-[#203039]'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Citations Box */}
                {!isUser && m.citations && m.citations.length > 0 && (
                  <div className="pt-3 border-t border-[#203039] space-y-1.5">
                    <span className="text-[10px] font-bold text-[#00D084] uppercase tracking-wider flex items-center gap-1">
                      <Bookmark className="w-3 h-3" />
                      Retrieved Source Evidence ({m.citations.length})
                    </span>
                    <div className="space-y-1.5">
                      {m.citations.map((c, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-2.5 rounded-xl bg-[#080E13] border border-[#203039] text-[11px] text-[#9BAAB6]"
                        >
                          <div className="flex items-center justify-between text-[#00D084] font-semibold text-[10px]">
                            <span>{c.document_name} • Page {c.page_number}</span>
                            <span>Score: {Math.round(c.relevance_score * 100)}%</span>
                          </div>
                          <p className="mt-1 line-clamp-2 italic text-[#F4F7FA]/80">"{c.excerpt}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom action row */}
                {!isUser && (
                  <div className="flex items-center justify-between pt-1 text-[10px] text-[#9BAAB6]">
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="hover:text-[#00D084] transition flex items-center gap-1"
                      title="Copy response"
                    >
                      {copiedId === m.id ? <Check className="w-3 h-3 text-[#00D084]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-[#111F28] border border-[#203039] flex items-center justify-center text-[#F4F7FA] flex-shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#00D084]/15 border border-[#00D084]/30 flex items-center justify-center text-[#00D084]">
              <Bot className="w-4 h-4" />
            </div>
            <div className="glass-panel-dark px-4 py-3 rounded-2xl flex items-center gap-2 text-xs text-[#00D084]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Retrieving verified medical records & formulating answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Pills */}
      {messages.length <= 3 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {promptSuggestions.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-[11px] px-3 py-1.5 rounded-xl bg-[#111F28] text-[#9BAAB6] hover:text-[#F4F7FA] hover:border-[#00D084]/40 border border-[#203039] transition text-left"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="relative">
        <textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask a question about your lab results, prescriptions, or health..."
          className="w-full glass-input-dark rounded-2xl pl-4 pr-12 py-3 text-xs resize-none outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="absolute right-3 top-3 p-2 rounded-xl bg-[#00D084] hover:bg-[#00ba76] disabled:opacity-40 text-[#05090D] transition shadow-md shadow-[#00D084]/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
