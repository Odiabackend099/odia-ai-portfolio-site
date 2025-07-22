
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AudioVisualizerProps {
  audioLevel: number;
  isActive: boolean;
}

export const AudioVisualizer = ({ audioLevel, isActive }: AudioVisualizerProps) => {
  const [bars, setBars] = useState<number[]>(new Array(40).fill(0));

  useEffect(() => {
    if (!isActive) {
      setBars(new Array(40).fill(0));
      return;
    }

    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.random() * 0.8 + 0.2));
    }, 50);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="flex items-center justify-center space-x-1 h-16">
      {bars.map((height, index) => (
        <motion.div
          key={index}
          animate={{
            height: `${height * 100}%`,
            opacity: isActive ? 0.7 : 0.3,
          }}
          transition={{
            duration: 0.1,
            ease: "easeOut",
          }}
          className="w-1 bg-gradient-to-t from-accent/60 to-accent rounded-full min-h-[4px]"
        />
      ))}
    </div>
  );
};
