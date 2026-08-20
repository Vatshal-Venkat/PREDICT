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
    <div className="card chat-container">
      <div className="flex-gap-2" style={{ borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
        <div className="icon-box" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <Bot size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            Operational AI Maintenance Chatbot
            <Sparkles size={16} style={{ color: '#818cf8' }} />
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Natural language operational query engine over live fleet multi-agent state</p>
        </div>
      </div>

      <div className="chat-feed">
        {messages.map((m, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '0.5rem', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'assistant' && (
              <div className="icon-box" style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1e1b4b', color: '#818cf8', flexShrink: 0 }}>
                <Bot size={14} />
              </div>
            )}

            <div className={`chat-msg ${m.role === 'user' ? 'chat-msg-user' : 'chat-msg-bot'}`}>
              {m.content}
            </div>

            {m.role === 'user' && (
              <div className="icon-box" style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1e3a8a', color: '#60a5fa', flexShrink: 0 }}>
                <User size={14} />
              </div>
            )}
          </div>
        ))}

        {isChatting && (
          <div className="flex-gap-2" style={{ color: '#818cf8', fontSize: '0.75rem', padding: '0.4rem' }}>
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            <span>AI Agent thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #1e293b', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
          {sampleQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setInput(q)}
              style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '16px', background: '#0f172a', border: '1px solid #1e293b', color: 'var(--text-muted)', cursor: 'pointer' }}
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
            placeholder="Ask a question about fleet health, RUL, or work orders..."
            className="form-input"
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={!input.trim() || isChatting} className="btn-primary" style={{ background: '#4f46e5' }}>
            <Send size={14} /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
