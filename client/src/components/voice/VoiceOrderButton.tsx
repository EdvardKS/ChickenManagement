import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, AudioWaveform, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioVisualizer } from "./AudioVisualizer";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { VoiceRecognitionResult } from "./types";

interface VoiceOrderButtonProps {
  onVoiceResult?: (result: string) => void;
  disabled?: boolean;
}

export function VoiceOrderButton({ onVoiceResult, disabled = false }: VoiceOrderButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successData, setSuccessData] = useState<any>(null);
  const [transcriptionData, setTranscriptionData] = useState<any>(null);

  // Hook de reconocimiento de voz
  const { state, audioData, interimTranscript, startListening, stopListening, isSupported } = useVoiceRecognition({
    onResult: useCallback((result: VoiceRecognitionResult) => {
      console.log('Voice recognition result:', result);
      
      if (result.orderCreated && result.order) {
        // Show success message with order details
        setSuccessData({
          transcript: result.transcript,
          order: result.order,
          extractedData: result.extractedData
        });
        setTimeout(() => {
          setIsExpanded(false);
          setSuccessData(null);
        }, 5000);
      } else if (result.transcript) {
        // Show transcription even if no order was created
        setTranscriptionData({
          transcript: result.transcript,
          extractedData: result.extractedData,
          message: result.message
        });
        setTimeout(() => {
          setTranscriptionData(null);
          setIsExpanded(false);
        }, 3000);
      }
      
      onVoiceResult?.(result.transcript);
      setErrorMessage('');
    }, [onVoiceResult]),
    
    onError: useCallback((error: string) => {
      console.error('Voice recognition error:', error);
      setErrorMessage(error);
      setIsExpanded(false);
    }, []),
    
    maxDuration: 30000, // 30 segundos máximo
  });

  const handleStartListening = useCallback(async () => {
    if (disabled || !isSupported) return;
    
    setIsExpanded(true);
    setErrorMessage('');
    await startListening();
  }, [disabled, isSupported, startListening]);

  const handleStopListening = useCallback(() => {
    stopListening();
  }, [stopListening]);

  const getButtonIcon = () => {
    if (!isSupported) return <AlertCircle className="w-6 h-6" />;
    
    switch (state) {
      case 'listening':
        return <AudioWaveform className="w-6 h-6" />;
      case 'processing':
        return <Square className="w-6 h-6" />;
      case 'error':
        return <AlertCircle className="w-6 h-6" />;
      default:
        return <Mic className="w-6 h-6" />;
    }
  };

  const getButtonText = () => {
    if (!isSupported) return 'Micrófono no disponible';
    
    switch (state) {
      case 'listening':
        return 'Escuchando... (toca para parar)';
      case 'processing':
        return 'Procesando...';
      case 'error':
        return errorMessage || 'Error - Reintentar';
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
              disabled={disabled || !isSupported || state !== 'idle'}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <motion.div
                animate={state === 'listening' ? { scale: [1, 1.2, 1] } : {}}
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
                      state === 'listening'
                        ? { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }
                        : {}
                    }
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
                  >
                    <motion.div
                      animate={
                        state === 'listening'
                          ? { rotate: [0, 180, 360] }
                          : {}
                      }
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      {getButtonIcon()}
                    </motion.div>
                  </motion.div>
                  
                  {state === 'listening' && (
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
                  
                  {state === 'listening' && (
                    <>
                      <p className="text-sm text-gray-500">
                        Di algo como: "Crear pedido para María dos pollos para las dos"
                      </p>
                      <AudioVisualizer 
                        isActive={state === 'listening'} 
                        audioData={audioData}
                        className="mt-4"
                      />
                      {interimTranscript && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Escuchando:</span> "{interimTranscript}"
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {state === 'processing' && (
                    <div className="flex justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                      />
                    </div>
                  )}

                  {successData && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-50 border border-green-200 rounded-lg p-4 text-left"
                    >
                      <div className="text-green-800">
                        <h4 className="font-semibold mb-2">¡Pedido creado exitosamente!</h4>
                        <div className="space-y-1 text-sm">
                          <p><strong>Cliente:</strong> {successData.extractedData?.customerName}</p>
                          <p><strong>Cantidad:</strong> {successData.extractedData?.quantity} pollos</p>
                          <p><strong>Hora recogida:</strong> {successData.extractedData?.pickupTime}</p>
                          <p><strong>ID Pedido:</strong> #{successData.order?.id}</p>
                        </div>
                        <p className="text-xs mt-2 text-green-600">
                          "{successData.transcript}"
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {transcriptionData && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left"
                    >
                      <div className="text-blue-800">
                        <h4 className="font-semibold mb-2">Texto transcrito:</h4>
                        <p className="text-sm mb-2">"{transcriptionData.transcript}"</p>
                        {transcriptionData.extractedData && (
                          <div className="text-xs text-blue-600">
                            <p>Datos extraídos: {JSON.stringify(transcriptionData.extractedData)}</p>
                          </div>
                        )}
                        {transcriptionData.message && (
                          <p className="text-xs text-blue-600 mt-1">{transcriptionData.message}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                {state === 'listening' && (
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