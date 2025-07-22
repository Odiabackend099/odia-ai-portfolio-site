import { motion } from 'framer-motion';
import { Settings, Zap, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface ChatHeaderProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  conversationStatus: string;
}

export const ChatHeader = ({ apiKey, onApiKeyChange, conversationStatus }: ChatHeaderProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-success';
      case 'connecting': return 'bg-warning';
      case 'disconnected': return 'bg-muted-foreground';
      default: return 'bg-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <Mic className="w-3 h-3" />;
      case 'connecting': return <Zap className="w-3 h-3 animate-pulse" />;
      default: return <Mic className="w-3 h-3 opacity-50" />;
    }
  };

  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="ai-glass border-b border-border/50 p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(conversationStatus)} flex items-center justify-center`}>
              {getStatusIcon(conversationStatus)}
            </div>
          </div>
          
          <div>
            <h1 className="text-lg font-semibold text-foreground">AI Voice Assistant</h1>
            <p className="text-sm text-muted-foreground">Professional AI Interface</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {conversationStatus === 'connected' ? 'Live' : 'Ready'}
          </Badge>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                <Settings className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 ai-glass">
              <div className="space-y-4">
                <h3 className="font-semibold">Configuration</h3>
                <div className="space-y-2">
                  <Label htmlFor="api-key">ElevenLabs API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => onApiKeyChange(e.target.value)}
                    placeholder="Enter your API key..."
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your API key is stored locally and used for voice conversations.
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </motion.div>
  );
};