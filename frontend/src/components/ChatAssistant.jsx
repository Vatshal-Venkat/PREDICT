import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Loader2 } from 'lucide-react';

export default function ChatAssistant({ onSendMessage, isChatting }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Maintenance Assistant powered by our Multi-Agent supervisory architecture. Ask me anything about fleet equipment status, fault diagnostics, or active work orders.'
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isChatting) return;

    const userQuery = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userQuery }]);

    const res = await onSendMessage(userQuery);
    if (res && res.response) {
      setMessages((prev) => [...prev, { role: 'assistant', content: res.response }]);
    } else {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Unable to process query at this time.' }]);
    }
  };

  const sampleQueries = [
    "What is the status of CNC-MILL-01?",
    "Show me all machines with critical health level.",
    "Which machine has the highest fault risk?",
    "Summarize total financial savings from work orders."
  ];

  return (
    <div className="glass-card p-5 h-[620px] flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
          <Bot size={20} />
        </div>
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            Operational AI Maintenance Chatbot
            <Sparkles size={16} className="text-indigo-400 animate-pulse" />
          </h3>
          <p className="text-xs text-slate-400">Natural language operational query engine over live fleet multi-agent state</p>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-indigo-900/60 border border-indigo-700/50 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                <Bot size={14} />
              </div>
            )}

            <div
              className={`max-w-[80%] p-3 rounded-xl whitespace-pre-wrap leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none font-medium'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
              }`}
            >
              {m.content}
            </div>

            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-blue-900/60 border border-blue-700/50 flex items-center justify-center text-blue-300 shrink-0 mt-0.5">
                <User size={14} />
              </div>
            )}
          </div>
        ))}

        {isChatting && (
          <div className="flex items-center gap-2 text-indigo-400 text-xs p-2">
            <Loader2 size={16} className="animate-spin" />
            <span>AI Agent thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Recommended Quick Suggestions */}
      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
        {sampleQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInput(q);
            }}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
          >
            "{q}"
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about fleet health, RUL, or work orders..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || isChatting}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition flex items-center gap-1.5 disabled:opacity-50"
        >
          <Send size={14} />
          Send
        </button>
      </form>
    </div>
  );
}
