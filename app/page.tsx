'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';
import { DEFAULT_MODEL, MODELS, modelLabel, type ChatMessage, type ModelId } from '@/lib/models';

export default function Chat() {
  const [input, setInput] = useState('');
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL);
  const { messages, sendMessage, status, stop, error } = useChat<ChatMessage>();
  const bottomRef = useRef<HTMLDivElement>(null);
  const busy = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  function submit() {
    const text = input.trim();
    if (!text || busy) return;
    sendMessage({ text }, { body: { model } });
    setInput('');
  }

  return (
    <main className="chat">
      <header>
        <h1>AI Gateway Chat</h1>
        <select value={model} onChange={(e) => setModel(e.target.value as ModelId)} aria-label="Model">
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </header>

      <section className="messages">
        {messages.length === 0 && (
          <p className="empty">Ask anything. Switch models at any time — every request goes through Vercel AI Gateway.</p>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`bubble ${message.role}`}>
            {message.role === 'assistant' && message.metadata?.model && (
              <span className="model-tag">{modelLabel(message.metadata.model)}</span>
            )}
            {message.parts.map((part, i) => (part.type === 'text' ? <span key={i}>{part.text}</span> : null))}
          </div>
        ))}

        {status === 'submitted' && <div className="bubble assistant typing">Thinking…</div>}
        {error && <div className="error">⚠ {error.message}</div>}
        <div ref={bottomRef} />
      </section>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Type a message…"
          rows={1}
          autoFocus
        />
        {busy ? (
          <button type="button" onClick={() => stop()}>
            Stop
          </button>
        ) : (
          <button type="submit" disabled={!input.trim()}>
            Send
          </button>
        )}
      </form>
    </main>
  );
}
