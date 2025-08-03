import { useState, useCallback, useRef, useEffect } from "react";
import { VoiceState, VoiceRecognitionResult } from "@/components/voice/types";

interface UseVoiceRecognitionProps {
  onResult?: (result: VoiceRecognitionResult) => void;
  onError?: (error: string) => void;
  maxDuration?: number; // en millisegundos
}

export function useVoiceRecognition({ 
  onResult, 
  onError, 
  maxDuration = 30000 
}: UseVoiceRecognitionProps) {
  const [state, setState] = useState<VoiceState>('idle');
  const [audioData, setAudioData] = useState<Uint8Array>();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Función para obtener datos de audio en tiempo real
  const updateAudioData = useCallback(() => {
    if (analyserRef.current && state === 'listening') {
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);
      setAudioData(dataArray);
      animationFrameRef.current = requestAnimationFrame(updateAudioData);
    }
  }, [state]);

  // Función para iniciar la grabación
  const startListening = useCallback(async () => {
    try {
      setState('listening');

      // Solicitar permisos del micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;

      // Configurar Web Audio API para visualización
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Configurar MediaRecorder para grabación
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setState('processing');
        
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
        
        // Intentar usar Web Speech API primero
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          try {
            const result = await processSpeechWithWebAPI(audioBlob);
            onResult?.(result);
          } catch (speechError) {
            console.warn('Web Speech API falló, enviando al servidor:', speechError);
            await processSpeechWithServer(audioBlob);
          }
        } else {
          // Enviar al servidor para procesamiento
          await processSpeechWithServer(audioBlob);
        }
        
        setState('idle');
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      // Iniciar visualización de audio
      updateAudioData();

      // Timeout para detener automáticamente
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, maxDuration);

    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      setState('error');
      onError?.('No se pudo acceder al micrófono. Por favor, verifica los permisos.');
    }
  }, [onResult, onError, maxDuration, updateAudioData]);

  // Función para detener la grabación
  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    // Limpiar recursos
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    analyserRef.current = null;
    setAudioData(undefined);
  }, []);

  // Procesar con Web Speech API (navegador)
  const processSpeechWithWebAPI = async (audioBlob: Blob): Promise<VoiceRecognitionResult> => {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        reject(new Error('Web Speech API no disponible'));
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const result = event.results[0];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;

        resolve({
          transcript,
          confidence,
        });
      };

      recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      // Para Web Speech API, necesitamos crear un stream nuevo
      // Por ahora usamos el procesamiento del servidor como fallback
      reject(new Error('Fallback to server processing'));
    });
  };

  // Procesar con servidor (OpenAI Whisper)
  const processSpeechWithServer = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result: VoiceRecognitionResult = await response.json();
      onResult?.(result);
    } catch (error) {
      console.error('Error procesando audio en servidor:', error);
      onError?.('Error procesando el audio. Inténtalo de nuevo.');
    }
  };

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    state,
    audioData,
    startListening,
    stopListening,
    isSupported: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
  };
}

// Extender la interfaz Window para TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}