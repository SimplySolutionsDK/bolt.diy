import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '@/stores/authStore';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/utils/cn';
import type { Message } from '@/types';

interface MessageBoardProps {
  featureId: string;
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  loading?: boolean;
  messageContainerRef?: (node?: Element | null) => void;
}

function MessageBubble({ message, isCurrentUser }: { message: Message; isCurrentUser: boolean }) {
  const { user } = useUser(message.createdBy);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 max-w-[80%]",
        isCurrentUser ? "ml-auto" : "mr-auto"
      )}
    >
      {!isCurrentUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-sm font-medium">
            {user?.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      
      <div className={cn(
        "rounded-lg p-3 break-words",
        isCurrentUser 
          ? "bg-blue-500 text-white ml-auto" 
          : "bg-gray-100 dark:bg-gray-800"
      )}>
        <div className="flex flex-col">
          {!isCurrentUser && (
            <span className="text-xs font-medium mb-1">
              {user?.name}
            </span>
          )}
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <div className={cn(
            "flex items-center gap-1 text-xs mt-1",
            isCurrentUser ? "text-white/70" : "text-gray-500"
          )}>
            <span>{format(message.createdAt, 'HH:mm')}</span>
            {isCurrentUser && (
              message.status === 'read' 
                ? <CheckCheck className="w-3 h-3" />
                : <Check className="w-3 h-3" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function MessageBoard({ 
  featureId,
  messages,
  onSendMessage,
  loading,
  messageContainerRef 
}: MessageBoardProps) {
  const [message, setMessage] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(message.trim());
      setMessage('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[375px] bg-white dark:bg-gray-800 rounded-lg shadow">
      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isCurrentUser={msg.createdBy === user?.id}
            />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <form 
        onSubmit={handleSubmit}
        className="border-t border-gray-200 dark:border-gray-700 p-4"
      >
        <div className="flex items-center gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Type a message..."
            className={cn(
              "flex-1 resize-none rounded-lg border p-2 min-h-[3rem] max-h-32",
              "placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500",
              "dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100",
              "transition-all duration-200"
            )}
            style={{
              height: Math.min(Math.max(message.split('\n').length, 2) * 24, 128)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={!message.trim() || isSending}
            className={cn(
              "p-2 rounded-full",
              "text-white bg-blue-500 hover:bg-blue-600",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors duration-200"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {500 - message.length} characters remaining
        </div>
      </form>
    </div>
  );
}