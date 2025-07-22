import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceOrb } from './VoiceOrb';
import { AudioVisualizer } from './AudioVisualizer';
import { useToast } from '@/components/ui/use-toast';

interface VoiceConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: any;
  apiKey: string;
  signedUrl?: string | null;
}

export const VoiceConversationModal = ({ 
  isOpen, 
  onClose, 
  conversation, 
  apiKey,
  signedUrl 
}: VoiceConversationModalProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (isOpen && signedUrl) {
      connectToVoiceService();
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isOpen, signedUrl]);

  const connectToVoiceService = async () => {
    if (!signedUrl) return;

    try {
      // Connect to our WebSocket proxy edge function
      const wsUrl = `wss://ckrdbdeloywizowejwwu.supabase.co/functions/v1/elevenlabs-conversation?signed_url=${encodeURIComponent(signedUrl)}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('Connected to voice service');
        setStatus('listening');
        setIsListening(true);
        wsRef.current = ws;
        setWsConnection(ws);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Voice service message:', data);
          
          if (data.type === 'connection_status') {
            if (data.status === 'connected') {
              setStatus('listening');
              setIsListening(true);
            } else if (data.status === 'disconnected') {
              setStatus('idle');
              setIsListening(false);
            }
          } else if (data.type === 'audio_level') {
            setAudioLevel(data.level);
          } else if (data.type === 'conversation_status') {
            if (data.status === 'speaking') {
              setStatus('speaking');
            } else if (data.status === 'listening') {
              setStatus('listening');
            }
          } else if (data.type === 'error') {
            console.error('Voice service error:', data.message);
            toast({
              title: "Voice Error",
              description: data.message,
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('Error parsing voice service message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('Voice service disconnected:', event.code, event.reason);
        setStatus('idle');
        setIsListening(false);
        setWsConnection(null);
        wsRef.current = null;
      };

      ws.onerror = (error) => {
        console.error('Voice service error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to voice service",
          variant: "destructive"
        });
      };

    } catch (error) {
      console.error('Error connecting to voice service:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to establish voice connection",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (isOpen && conversation.status === 'connected') {
      setStatus('listening');
      setIsListening(true);
    } else if (!isOpen) {
      setStatus('idle');
      setIsListening(false);
    }
  }, [isOpen, conversation.status]);

  useEffect(() => {
    // Monitor conversation status
    if (conversation.isSpeaking) {
      setStatus('speaking');
    } else if (conversation.status === 'connected' && isOpen) {
      setStatus('listening');
    }
  }, [conversation.isSpeaking, conversation.status, isOpen]);

  const handleClose = async () => {
    try {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      await conversation.endSession();
      onClose();
      setStatus('idle');
      setIsListening(false);
    } catch (error) {
      console.error('Error ending conversation:', error);
      onClose();
    }
  };

  const toggleMute = async () => {
    try {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      await conversation.setVolume({ volume: newMutedState ? 0 : 0.8 });
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Processing...';
      case 'speaking':
        return 'AI Speaking';
      default:
        return 'Ready to talk';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'listening':
        return 'text-accent';
      case 'processing':
        return 'text-warning';
      case 'speaking':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-lg flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-accent/5" />
        
        {/* Close button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-6 right-6"
        >
          <Button
            onClick={handleClose}
            variant="ghost"
            size="icon"
            className="rounded-full bg-muted/30 hover:bg-muted/50 backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </Button>
        </motion.div>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center space-y-8 relative z-10"
        >
          {/* Voice Orb */}
          <VoiceOrb 
            status={status}
            audioLevel={audioLevel}
            isListening={isListening}
            isSpeaking={conversation.isSpeaking || status === 'speaking'}
          />

          {/* Audio Visualizer */}
          <AudioVisualizer 
            audioLevel={audioLevel}
            isActive={status === 'listening' || status === 'speaking'}
          />

          {/* Status */}
          <motion.div
            key={status}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-2"
          >
            <p className={`text-lg font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </p>
            <p className="text-sm text-muted-foreground">
              Speak naturally - I'm listening hands-free
            </p>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-4"
          >
            <Button
              onClick={toggleMute}
              variant="outline"
              size="icon"
              className="rounded-full bg-muted/20 border-border/50 hover:bg-muted/40"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>

            <Button
              onClick={handleClose}
              variant="outline"
              className="rounded-full bg-muted/20 border-border/50 hover:bg-muted/40"
            >
              End Conversation
            </Button>
          </motion.div>

          {/* Connection indicator */}
          {!wsConnection && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-4"
            >
              <div className="bg-warning/20 border border-warning/50 rounded-lg px-3 py-2">
                <p className="text-sm text-warning">
                  Connecting to voice service...
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
