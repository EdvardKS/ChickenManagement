import { motion } from "framer-motion";
import { AudioVisualizerProps } from "./types";

export function AudioVisualizer({ isActive, audioData, className = "" }: AudioVisualizerProps) {
  // Para el Sprint 1, creamos una visualización simulada
  // En el Sprint 2 esto será reemplazado con datos reales del micrófono
  
  const bars = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div className={`flex items-center justify-center space-x-1 h-16 ${className}`}>
      {bars.map((bar) => (
        <motion.div
          key={bar}
          className="bg-gradient-to-t from-blue-400 to-purple-500 rounded-full"
          style={{
            width: '3px',
            minHeight: '4px',
          }}
          animate={
            isActive
              ? {
                  height: [
                    Math.random() * 40 + 10,
                    Math.random() * 60 + 15,
                    Math.random() * 40 + 10,
                  ],
                  opacity: [0.6, 1, 0.6],
                }
              : {
                  height: 4,
                  opacity: 0.3,
                }
          }
          transition={{
            duration: 0.8 + Math.random() * 0.4,
            repeat: isActive ? Infinity : 0,
            ease: "easeInOut",
            delay: bar * 0.05,
          }}
        />
      ))}
    </div>
  );
}