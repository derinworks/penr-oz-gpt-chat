import { useState } from 'react'
import { chat } from './api'
import { MessageList, type Message } from './components/MessageList'
import { ChatInput } from './components/ChatInput'
import './App.css'

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelId, setModelId] = useState('gpt-example');
  const [blockSize, setBlockSize] = useState(1024);
  const [maxTokens, setMaxTokens] = useState(50);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const chatResponse = await chat({
        message: userMessage,
        model_id: modelId,
        block_size: blockSize,
        max_new_tokens: maxTokens,
        temperature: 1.0,
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: chatResponse.response }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>GPT Chat</h1>
        <div className="chat-settings">
          <label>
            Model ID:
            <input
              type="text"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
            />
          </label>
          <label>
            Block size:
            <input
              type="number"
              value={blockSize}
              min={1}
              max={2048}
              onChange={(e) => {
                const n = Math.trunc(Number(e.target.value));
                setBlockSize(Number.isFinite(n) ? Math.max(1, Math.min(2048, n)) : 1)
              }}
            />
          </label>
          <label>
            Max tokens:
            <input
              type="number"
              value={maxTokens}
              min={1}
              max={2048}
              onChange={(e) => {
                const n = Math.trunc(Number(e.target.value));
                setMaxTokens(Number.isFinite(n) ? Math.max(1, Math.min(2048, n)) : 1);
              }}
            />
          </label>
        </div>
      </header>

      <MessageList messages={messages} loading={loading} error={error} />

      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        disabled={loading}
      />
    </div>
  );
}

export default App
