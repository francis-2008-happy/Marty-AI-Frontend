import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { SendHorizontal } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-30 md:static md:bottom-auto md:left-auto md:right-auto md:bg-background md:p-0 md:border-t-0 p-0">
      <div className="max-w-4xl mx-auto relative bg-background border-2 border-slate-300 dark:border-border rounded-xl shadow-lg ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all">
        <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Send a message..."}
            rows={1}
            disabled={disabled}
            className="flex-1 bg-transparent resize-none border-0 focus:ring-0 focus:outline-none py-3 px-2 max-h-32 min-h-[44px]"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || disabled}
            className="mb-1 rounded-lg shrink-0"
          >
            <SendHorizontal className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
