
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { VoiceControls } from './VoiceControls';
import { ChatHeader } from './ChatHeader';
import { useConversation } from '@11labs/react';

export interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

interface ChatInterfaceProps {
  className?: string;
}

export const ChatInterface = ({ className }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'AI Assistant ready. You can type or use voice to communicate with ElevenLabs AI agent.',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Voice conversation connected');
      addMessage('system', 'Voice conversation connected. You can now speak naturally.', true);
    },
    onDisconnect: () => {
      console.log('Voice conversation disconnected');
      addMessage('system', 'Voice conversation ended.', true);
    },
    onMessage: (message) => {
      console.log('Voice message received:', message);
      if (message.message) {
        // Determine if this is a user transcription or AI response
        const isUserMessage = message.type === 'user_transcript' || message.source === 'user';
        addMessage(isUserMessage ? 'user' : 'assistant', message.message, true);
      }
    },
    onError: (error) => {
      console.error('Voice conversation error:', error);
      addMessage('system', `Voice error: ${error.message}`, true);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type: 'user' | 'assistant' | 'system', content: string, isVoice = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      isVoice
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    addMessage('user', message);
    setIsLoading(true);

    try {
      // For text messages, we'll use a simple echo response
      // In a real implementation, you might want to send this to another AI service
      // or integrate with the voice conversation context
      setTimeout(() => {
        addMessage('assistant', 'Message received. For best experience, please use the voice conversation feature above.');
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('system', 'Error sending message. Please try again.');
      setIsLoading(false);
    }
  };

  const handleVoiceMessage = (message: string) => {
    // Voice messages are already handled by the conversation onMessage callback
    // This is kept for compatibility but may not be needed
    console.log('Voice message handled:', message);
  };

  return (
    <div className={`flex flex-col h-full max-h-screen bg-gradient-subtle ${className}`}>
      <ChatHeader 
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        conversationStatus={conversation.status}
      />
      
      <div className="flex-1 flex flex-col min-h-0 relative">
        <MessageList 
          messages={messages}
          isLoading={isLoading}
          className="flex-1"
        />
        
        <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm sticky bottom-0">
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div className="block sm:block">
              <VoiceControls 
                conversation={conversation}
                apiKey={apiKey}
                onVoiceMessage={handleVoiceMessage}
              />
            </div>
            <ChatInput 
              onSendMessage={handleSendMessage}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
      
      <div ref={messagesEndRef} />
    </div>
  );
};
