import { motion } from 'framer-motion';
import { User, Bot, Info, Mic } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Message } from './ChatInterface';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';
  
  const getIcon = () => {
    if (isSystem) return <Info className="w-4 h-4" />;
    if (isUser) return <User className="w-4 h-4" />;
    return <Bot className="w-4 h-4" />;
  };

  const getAvatarBg = () => {
    if (isSystem) return 'bg-muted';
    if (isUser) return 'bg-gradient-primary';
    return 'bg-accent';
  };

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center"
      >
        <div className="flex items-center space-x-2 px-3 py-2 rounded-full bg-muted/50 border border-border/50">
          <Info className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{message.content}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`flex gap-2 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <Avatar className="w-7 h-7 sm:w-8 sm:h-8 shrink-0">
          <AvatarFallback className={getAvatarBg()}>
            {getIcon()}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[80%] sm:max-w-[70%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          {message.isVoice && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              <Mic className="w-2.5 h-2.5 mr-1" />
              Voice
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`
            rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 ai-transition
            ${isUser 
              ? 'bg-gradient-primary text-primary-foreground shadow-ai-md' 
              : 'ai-glass border border-border/50 text-foreground hover:shadow-ai-md'
            }
          `}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </motion.div>
      </div>

      {isUser && (
        <Avatar className="w-7 h-7 sm:w-8 sm:h-8 shrink-0">
          <AvatarFallback className={getAvatarBg()}>
            {getIcon()}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};