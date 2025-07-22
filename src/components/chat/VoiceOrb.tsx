
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface VoiceOrbProps {
  status: 'idle' | 'listening' | 'processing' | 'speaking';
  audioLevel: number;
  isListening: boolean;
  isSpeaking: boolean;
}

export const VoiceOrb = ({ status, audioLevel, isListening, isSpeaking }: VoiceOrbProps) => {
  const [pulseIntensity, setPulseIntensity] = useState(0);

  useEffect(() => {
    // Simulate audio level changes for demo
    if (isListening || isSpeaking) {
      const interval = setInterval(() => {
        setPulseIntensity(Math.random() * 0.8 + 0.2);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setPulseIntensity(0);
    }
  }, [isListening, isSpeaking]);

  const getOrbColor = () => {
    switch (status) {
      case 'listening':
        return 'from-accent to-accent/70';
      case 'processing':
        return 'from-warning to-warning/70';
      case 'speaking':
        return 'from-primary to-primary/70';
      default:
        return 'from-muted-foreground/30 to-muted-foreground/20';
    }
  };

  const getOrbShadow = () => {
    switch (status) {
      case 'listening':
        return 'shadow-[0_0_60px_hsl(var(--accent)/0.5)]';
      case 'processing':
        return 'shadow-[0_0_60px_hsl(var(--warning)/0.5)]';
      case 'speaking':
        return 'shadow-[0_0_60px_hsl(var(--primary)/0.5)]';
      default:
        return 'shadow-[0_0_30px_hsl(var(--muted-foreground)/0.2)]';
    }
  };

  const baseSize = 200;
  const dynamicScale = 1 + (pulseIntensity * 0.3);

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings */}
      {(isListening || isSpeaking) && (
        <>
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`absolute w-80 h-80 rounded-full bg-gradient-to-r ${getOrbColor()} opacity-20 blur-xl`}
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.2, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
            className={`absolute w-64 h-64 rounded-full bg-gradient-to-r ${getOrbColor()} opacity-30 blur-lg`}
          />
        </>
      )}

      {/* Main orb */}
      <motion.div
        animate={{
          scale: status === 'idle' ? [1, 1.05, 1] : dynamicScale,
        }}
        transition={{
          duration: status === 'idle' ? 3 : 0.1,
          repeat: status === 'idle' ? Infinity : 0,
          ease: "easeInOut",
        }}
        className={`relative w-48 h-48 rounded-full bg-gradient-to-br ${getOrbColor()} ${getOrbShadow()}`}
        style={{
          width: baseSize,
          height: baseSize,
        }}
      >
        {/* Inner glow */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
        
        {/* Center dot */}
        <motion.div
          animate={{
            opacity: status === 'speaking' ? [0.7, 1, 0.7] : 0.8,
            scale: status === 'speaking' ? [0.8, 1.2, 0.8] : 1,
          }}
          transition={{
            duration: 0.6,
            repeat: status === 'speaking' ? Infinity : 0,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/90"
        />

        {/* Audio wave rings for speaking */}
        {isSpeaking && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 2, 1],
                  opacity: [0.6, 0, 0.6],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 0.3,
                }}
                className="absolute inset-0 rounded-full border-2 border-white/30"
              />
            ))}
          </>
        )}

        {/* Listening indicator particles */}
        {isListening && !isSpeaking && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  rotate: 360,
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
                className="absolute w-2 h-2 bg-white/60 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) translateY(-${baseSize/2 + 20}px) rotate(${i * 60}deg)`,
                  transformOrigin: `0 ${baseSize/2 + 20}px`,
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </div>
  );
};
