import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const TypingIndicator = () => {
  return (
    <div className="flex gap-3 justify-start">
      <Avatar className="w-8 h-8">
        <AvatarFallback className="bg-accent">
          <Bot className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
      
      <div className="max-w-[70%] space-y-1">
        <span className="text-xs font-medium text-muted-foreground">
          AI Assistant
        </span>
        
        <div className="ai-glass border border-border/50 rounded-2xl px-4 py-3">
          <div className="flex items-center space-x-1">
            <span className="text-sm text-muted-foreground">Thinking</span>
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 bg-accent rounded-full"
                  animate={{
                    y: [0, -4, 0],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};