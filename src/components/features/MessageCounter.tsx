import React from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useMessages } from '@/hooks/useMessages';

interface MessageCounterProps {
  featureId: string;
  className?: string;
}

export default function MessageCounter({ featureId, className }: MessageCounterProps) {
  const { messages } = useMessages(featureId);
  
  const counts = React.useMemo(() => {
    const read = messages.filter(m => m.status === 'read').length;
    const unread = messages.length - read;
    return { total: messages.length, read, unread };
  }, [messages]);

  if (counts.total === 0) return null;

  return (
    <div className={cn("flex items-center gap-1.5 text-sm", className)}>
      <MessageCircle className="w-4 h-4" />
      <div className="flex items-center gap-1">
        <span className="font-medium">{counts.total}</span>
        {counts.unread > 0 && (
          <span className="text-xs">
            (<span className="text-blue-500 dark:text-blue-400">{counts.unread}</span>)
          </span>
        )}
      </div>
    </div>
  );
}