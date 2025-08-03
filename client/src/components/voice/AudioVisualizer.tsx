import { motion } from "framer-motion";
import { AudioVisualizerProps } from "./types";

export function AudioVisualizer({ isActive, audioData, className = "" }: AudioVisualizerProps) {
  const bars = Array.from({ length: 20 }, (_, i) => i);

  // Función para calcular la altura de cada barra basada en datos de audio
  const getBarHeight = (index: number): number => {
    if (!audioData || !isActive) return 4;
    
    // Dividir los datos de audio en segmentos para cada barra
    const segmentSize = Math.floor(audioData.length / bars.length);
    const startIndex = index * segmentSize;
    const endIndex = Math.min(startIndex + segmentSize, audioData.length);
    
    // Calcular el promedio de amplitud para este segmento
    let sum = 0;
    for (let i = startIndex; i < endIndex; i++) {
      sum += audioData[i];
    }
    const average = sum / (endIndex - startIndex);
    
    // Normalizar el valor (0-255) a altura de píxel (4-64)
    const normalizedHeight = (average / 255) * 60 + 4;
    return Math.max(4, Math.min(64, normalizedHeight));
  };

  return (
    <div className={`flex items-center justify-center space-x-1 h-16 ${className}`}>
      {bars.map((bar, index) => {
        const height = getBarHeight(index);
        
        return (
          <motion.div
            key={bar}
            className="bg-gradient-to-t from-blue-400 to-purple-500 rounded-full"
            style={{
              width: '3px',
              minHeight: '4px',
            }}
            animate={
              isActive && audioData
                ? {
                    height: height,
                    opacity: Math.max(0.3, height / 64),
                  }
                : isActive
                ? {
                    // Fallback a animación simulada si no hay datos de audio
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
              duration: audioData ? 0.1 : 0.8 + Math.random() * 0.4,
              repeat: isActive && !audioData ? Infinity : 0,
              ease: audioData ? "linear" : "easeInOut",
              delay: audioData ? 0 : bar * 0.05,
            }}
          />
        );
      })}
    </div>
  );
}