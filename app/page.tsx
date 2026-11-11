'use client';

import { useEveAgent } from 'eve/react';
import { useEffect, useRef, useState } from 'react';
import { DEFAULT_MODEL, MODEL_HEADER, MODELS, modelLabel, type ModelId } from '@/lib/models';

export default function Chat() {
  const [input, setInput] = useState('');
  const [model, setModel] = useState<ModelId>(DEFAULT_MODEL);
  // Headers are resolved before every request, so a model switch applies to the next message.
  const modelRef = useRef(model);
  useEffect(() => {
    modelRef.current = model;
  }, [model]);
  const agent = useEveAgent({ headers: () => ({ [MODEL_HEADER]: modelRef.current }) });
  const bottomRef = useRef<HTMLDivElement>(null);
  const busy = agent.status !== 'idle';

  // Which model answered each turn, from the agent's own events.
  const modelByTurn = new Map<string, string>();
  for (const event of agent.events) {
    if (event.type === 'model.started' && event.scope?.turnId) modelByTurn.set(event.scope.turnId, event.data.modelId);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agent.messages, agent.status]);

  function submit() {
    const text = input.trim();
    if (!text || busy) return;
    void agent.send(text);
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
        {agent.messages.length === 0 && (
          <p className="empty">Ask anything. Switch models at any time — every request goes through Vercel AI Gateway.</p>
        )}

        {agent.messages.map((message) => {
          const answeredBy = message.metadata?.turnId ? modelByTurn.get(message.metadata.turnId) : undefined;
          return (
            <div key={message.id} className={`bubble ${message.role}`}>
              {message.role === 'assistant' && answeredBy && <span className="model-tag">{modelLabel(answeredBy)}</span>}
              {message.parts.map((part, i) => (part.type === 'text' ? <span key={part.id ?? i}>{part.text}</span> : null))}
            </div>
          );
        })}

        {busy && agent.messages.at(-1)?.role === 'user' && <div className="bubble assistant typing">Thinking…</div>}
        {agent.error && <div className="error">⚠ {agent.error.message}</div>}
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
          <button type="button" onClick={() => void agent.cancel()}>
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
