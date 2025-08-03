import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, AudioWaveform } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioVisualizer } from "./AudioVisualizer";

interface VoiceOrderButtonProps {
  onVoiceResult?: (result: string) => void;
  disabled?: boolean;
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'error';

export function VoiceOrderButton({ onVoiceResult, disabled = false }: VoiceOrderButtonProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStartListening = useCallback(() => {
    if (disabled) return;
    
    setIsExpanded(true);
    setVoiceState('listening');
    
    // TODO: Implementar captura de audio real en Sprint 2
    // Por ahora simulamos el proceso
    setTimeout(() => {
      setVoiceState('processing');
      setTimeout(() => {
        // Simular resultado
        onVoiceResult?.("crear pedido para María dos pollos para las dos");
        setVoiceState('idle');
        setIsExpanded(false);
      }, 2000);
    }, 3000);
  }, [disabled, onVoiceResult]);

  const handleStopListening = useCallback(() => {
    setVoiceState('processing');
    // El procesamiento continuará automáticamente
  }, []);

  const getButtonIcon = () => {
    switch (voiceState) {
      case 'listening':
        return <AudioWaveform className="w-6 h-6" />;
      case 'processing':
        return <Square className="w-6 h-6" />;
      default:
        return <Mic className="w-6 h-6" />;
    }
  };

  const getButtonText = () => {
    switch (voiceState) {
      case 'listening':
        return 'Escuchando... (toca para parar)';
      case 'processing':
        return 'Procesando...';
      case 'error':
        return 'Error - Reintentar';
      default:
        return 'Crear pedido por voz';
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <Button
              onClick={handleStartListening}
              disabled={disabled || voiceState !== 'idle'}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <motion.div
                animate={voiceState === 'listening' ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                {getButtonIcon()}
              </motion.div>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4"
            >
              <div className="text-center space-y-6">
                <div className="relative">
                  <motion.div
                    animate={
                      voiceState === 'listening'
                        ? { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }
                        : {}
                    }
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
                  >
                    <motion.div
                      animate={
                        voiceState === 'listening'
                          ? { rotate: [0, 180, 360] }
                          : {}
                      }
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      {getButtonIcon()}
                    </motion.div>
                  </motion.div>
                  
                  {voiceState === 'listening' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 rounded-full border-4 border-blue-300"
                      style={{
                        animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
                      }}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {getButtonText()}
                  </h3>
                  
                  {voiceState === 'listening' && (
                    <>
                      <p className="text-sm text-gray-500">
                        Di algo como: "Crear pedido para María dos pollos para las dos"
                      </p>
                      <AudioVisualizer 
                        isActive={voiceState === 'listening'} 
                        className="mt-4"
                      />
                    </>
                  )}

                  {voiceState === 'processing' && (
                    <div className="flex justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                      />
                    </div>
                  )}
                </div>

                {voiceState === 'listening' && (
                  <Button
                    onClick={handleStopListening}
                    variant="outline"
                    className="w-full"
                  >
                    Detener grabación
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}