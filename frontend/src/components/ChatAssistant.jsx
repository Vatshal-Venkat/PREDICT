import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Loader2 } from 'lucide-react';

export default function ChatAssistant({ onSendMessage, isChatting }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your RAG-enabled AI Maintenance Copilot. Ask me anything about equipment status, fault diagnostics, active work orders, or search OEM manuals for exact repair procedures and torque specifications.'
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
    "Which machine has the highest fault risk?",
    "Show OEM torque specs for SKF 6205 bearing replacement",
    "How do I fix hydraulic cavitation?",
    "What is the overall fleet status?"
  ];

  return (
    <div className="card chat-container" style={{ background: '#080d1a', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <div className="flex-between" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
        <div className="flex-gap-2">
          <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <Bot size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
              AI Maintenance Copilot (RAG OEM Engine)
              <Sparkles size={15} style={{ color: '#38bdf8' }} />
            </h3>
            <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0 }}>Natural language query engine over live fleet state & OEM technical manuals</p>
          </div>
        </div>
      </div>

      <div className="chat-feed">
        {messages.map((m, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '0.6rem', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'assistant' && (
              <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#050811', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={15} />
              </div>
            )}

            <div className={`chat-msg ${m.role === 'user' ? 'chat-msg-user' : 'chat-msg-bot'}`}>
              {m.content}
            </div>

            {m.role === 'user' && (
              <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={15} />
              </div>
            )}
          </div>
        ))}

        {isChatting && (
          <div className="flex-gap-2" style={{ color: '#38bdf8', fontSize: '0.75rem', padding: '0.4rem' }}>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            <span>AI Copilot retrieving OEM manuals & analyzing fleet state...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setInput(q)}
              style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '14px', background: '#050811', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s ease' }}
            >
              "{q}"
            </button>
          ))}
        </div>

        <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about fleet health, risk, RUL, or OEM manuals..."
            className="form-input"
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={!input.trim() || isChatting} className="btn-primary">
            <Send size={14} /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
