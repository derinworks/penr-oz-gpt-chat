import { useEffect, useRef } from 'react';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

export function MessageList({ messages, loading, error }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <main className="chat-messages">
      {messages.length === 0 && !loading && (
        <div className="chat-empty">Send a message to start generating text.</div>
      )}
      {messages.map((msg, i) => (
        <div key={i} className={`chat-message chat-message--${msg.role}`}>
          <span className="chat-message-role">{msg.role === 'user' ? 'You' : 'GPT'}</span>
          <p className="chat-message-content">{msg.content}</p>
        </div>
      ))}
      {loading && (
        <div className="chat-message chat-message--assistant chat-message--pending">
          <span className="chat-message-role">GPT</span>
          <p className="chat-message-content chat-loading">Generating...</p>
        </div>
      )}
      {error && <div className="chat-error">{error}</div>}
      <div ref={messagesEndRef} />
    </main>
  );
}
