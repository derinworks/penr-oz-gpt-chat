interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled: boolean;
}

export function ChatInput({ value, onChange, onSubmit, disabled }: ChatInputProps) {
  return (
    <form className="chat-input-form" onSubmit={onSubmit}>
      <input
        type="text"
        className="chat-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type a message..."
        disabled={disabled}
      />
      <button type="submit" className="chat-send" disabled={disabled || !value.trim()}>
        Send
      </button>
    </form>
  );
}
