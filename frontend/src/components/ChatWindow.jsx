import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble.jsx';
import Aura from './Aura.jsx';
import TypingDots from './TypingDots.jsx';

function ChatWindow({ messages, thinking = false, onRetryMessage, auraVariant = 'default' }) {
  const endRef = useRef(null);
  const listRef = useRef(null);
  const shouldStickRef = useRef(true);
  const prevCountRef = useRef(messages.length);

  // Track user scroll to decide when to auto-stick to bottom
  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const threshold = 48; // px from bottom considered "near bottom"
    const atBottom = el.scrollHeight - (el.scrollTop + el.clientHeight) <= threshold;
    shouldStickRef.current = atBottom;
  };

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const increased = messages.length > prevCountRef.current;
    prevCountRef.current = messages.length;
    if (shouldStickRef.current) {
      // Smooth scroll only when a new message is appended; otherwise snap to keep up with streaming
      endRef.current?.scrollIntoView({ behavior: increased ? 'smooth' : 'auto' });
    }
  }, [messages]);

  return (
    <section className="chat" aria-live="polite" aria-label="Chat messages" ref={listRef} onScroll={onScroll}>
      {messages.map((m) => (
        <MessageBubble
          key={m.id}
          sender={m.sender}
          kind={m.kind}
          time={m.time}
          auraVariant={auraVariant}
          onRetry={m.kind === 'error' ? () => onRetryMessage?.(m.retryPayload) : undefined}
        >
          {m.text}
        </MessageBubble>
      ))}
      {thinking && (
        <div className="msg sally" aria-live="off">
          <div className="avatar-col" aria-hidden="true">
            <Aura size={44} variant={auraVariant} />
          </div>
          <div className="bubble sally">
            <TypingDots />
          </div>
          <div className="avatar-col spacer" aria-hidden="true" />
        </div>
      )}
      <div ref={endRef} />
    </section>
  );
}

export default ChatWindow;
