import { useRef, useEffect } from 'react';
import type { Message } from '../../types';
import { cn } from '../../utils';
import { Bot, User } from 'lucide-react';

interface ChatWindowProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
        <div className="bg-muted/30 p-6 rounded-full mb-6">
          <Bot className="w-12 h-12 text-primary/50" />
        </div>
        <h3 className="text-xl font-semibold mb-2">How can I help you?</h3>
        <p className="max-w-md text-center">
          Ask questions about your uploaded documents. Select a document from the sidebar to start a focused conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
      {messages.map((msg, idx) => (
        <div 
          key={idx} 
          className={cn(
            "flex gap-4 max-w-4xl mx-auto",
            msg.role === 'user' ? "justify-end" : "justify-start"
          )}
        >
          {/* Avatar for assistant */}
          {msg.role === 'assistant' && (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-5 h-5 text-primary" />
            </div>
          )}

          <div
            className={cn(
              "rounded-2xl px-5 py-3 max-w-[80%] text-sm leading-relaxed shadow-sm",
              msg.role === 'user' 
                ? "bg-blue-600 text-white rounded-tr-sm" 
                : "bg-card border text-card-foreground rounded-tl-sm"
            )}
          >
            {msg.content}
          </div>

          {/* Avatar for user (optional, can be hidden if preferred style) */}
          {msg.role === 'user' && (
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-1">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      ))}
      
      {isLoading && (
        <div className="flex gap-4 max-w-4xl mx-auto animate-pulse">
           <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="bg-card border rounded-2xl rounded-tl-sm px-5 py-4 space-y-2 w-32">
              <div className="h-2 bg-muted rounded w-3/4"></div>
              <div className="h-2 bg-muted rounded w-1/2"></div>
            </div>
        </div>
      )}
      
      <div ref={bottomRef} className="h-1" />
    </div>
  );
}
