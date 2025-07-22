import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Message } from './ChatInterface';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  className?: string;
}

export const MessageList = ({ messages, isLoading, className }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <ScrollArea className={`px-4 py-2 ${className}`}>
      <div ref={scrollRef} className="space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.1,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              <MessageBubble message={message} />
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
};