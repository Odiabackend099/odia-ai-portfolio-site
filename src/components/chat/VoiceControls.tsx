
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { VoiceConversationModal } from './VoiceConversationModal';
import { supabase } from '@/integrations/supabase/client';

interface VoiceControlsProps {
  conversation: any;
  apiKey: string;
  onVoiceMessage?: (message: string) => void;
}

export const VoiceControls = ({ conversation, apiKey, onVoiceMessage }: VoiceControlsProps) => {
  const [volume, setVolume] = useState([0.8]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleStartConversation = async () => {
    try {
      setIsConnecting(true);
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Get signed URL from our edge function
      const { data, error } = await supabase.functions.invoke('voice-session', {
        body: { action: 'get_signed_url' }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.signed_url) {
        throw new Error('Failed to get signed URL');
      }

      setSignedUrl(data.signed_url);
      
      // Start the conversation using the real signed URL
      const conversationId = await conversation.startSession({ 
        url: data.signed_url 
      });
      
      setIsVoiceModalOpen(true);
      
      toast({
        title: "Voice Connected",
        description: "Voice conversation is now active with ElevenLabs AI agent.",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to start voice conversation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleEndConversation = async () => {
    try {
      await conversation.endSession();
      setIsVoiceModalOpen(false);
      setSignedUrl(null);
      toast({
        title: "Conversation Ended",
        description: "Voice conversation has been stopped.",
      });
    } catch (error) {
      console.error('Error ending conversation:', error);
      setIsVoiceModalOpen(false);
      setSignedUrl(null);
    }
  };

  const handleVolumeChange = async (newVolume: number[]) => {
    setVolume(newVolume);
    try {
      await conversation.setVolume({ volume: newVolume[0] });
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    handleVolumeChange(isMuted ? volume : [0]);
  };

  const isConnected = conversation.status === 'connected';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="ai-glass rounded-xl p-4 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-sm">Voice Controls</h3>
            <Badge 
              variant={isConnected ? "default" : "secondary"} 
              className="text-xs"
            >
              {isConnected ? 'Live' : isConnecting ? 'Connecting...' : 'Ready'}
            </Badge>
          </div>
          
          {conversation.isSpeaking && (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex items-center space-x-1 text-accent"
            >
              <Volume2 className="w-4 h-4" />
              <span className="text-xs">AI Speaking</span>
            </motion.div>
          )}
        </div>

        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2">
            {!isConnected && !isVoiceModalOpen ? (
              <Button
                onClick={handleStartConversation}
                disabled={isConnecting}
                variant="professional"
                size="sm"
                className="bg-gradient-to-r from-accent to-accent/80 text-white hover:shadow-ai-glow"
              >
                <Phone className="w-4 h-4 mr-2" />
                {isConnecting ? 'Connecting...' : 'Start Voice'}
              </Button>
            ) : (
              <Button
                onClick={handleEndConversation}
                variant="outline"
                size="sm"
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                <PhoneOff className="w-4 h-4 mr-2" />
                End Call
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            
            <div className="flex items-center space-x-2 min-w-[100px]">
              <Volume2 className="w-3 h-3 text-muted-foreground" />
              <Slider
                value={volume}
                onValueChange={handleVolumeChange}
                max={1}
                min={0}
                step={0.1}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <VoiceConversationModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        conversation={conversation}
        apiKey={apiKey}
        signedUrl={signedUrl}
      />
    </>
  );
};
