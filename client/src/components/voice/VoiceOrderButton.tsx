import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, AudioWaveform, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioVisualizer } from "./AudioVisualizer";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { VoiceRecognitionResult } from "./types";

interface VoiceOrderButtonProps {
  onVoiceResult?: (result: string) => void;
  onOrderCreated?: (order: any) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function VoiceOrderButton({ onVoiceResult, onOrderCreated, disabled = false, className, children }: VoiceOrderButtonProps) {
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
        
        // Notify parent component about the new order for optimistic updates
        onOrderCreated?.(result.order);
        
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
    }, [onVoiceResult, onOrderCreated]),
    
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
      {/* Botón principal integrado en barra inferior */}
      <Button
        onClick={state === 'listening' ? handleStopListening : handleStartListening}
        disabled={disabled || !isSupported}
        variant="ghost"
        size="sm"
        className={`${className || "flex flex-col items-center justify-center h-12 w-16 p-1 hover:bg-white/5 transition-colors duration-200 disabled:opacity-50"}`}
      >
        {children || (
          <>
            <motion.div
              animate={state === 'listening' ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Mic className={`  ${state === 'listening' ? 'text-red-400' : 'text-[#FFFFFF]'}`} />
              
            </motion.div>
          </>
        )}
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4"
            >
              <div className="text-center space-y-6">
                <div className="relative">
                  <motion.div
                    animate={
                      state === 'listening'
                        ? { scale: [1, 1.1, 1] }
                        : {}
                    }
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-16 h-16 mx-auto bg-[#00B4FF] rounded-full flex items-center justify-center"
                  >
                    <Mic className="w-8 h-8 text-white" />
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