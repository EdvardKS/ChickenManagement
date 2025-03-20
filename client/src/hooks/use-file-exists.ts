import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

interface FileExistsResponse {
  exists: boolean;
  error?: string;
}

/**
 * Hook para verificar si un archivo existe en el servidor
 * @param path Ruta del archivo a verificar (relativa a client/public)
 * @returns Un objeto con el estado de la consulta
 */
export function useFileExists(path: string | null | undefined) {
  const [exists, setExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Si no hay ruta, no hacemos nada
    if (!path) {
      setExists(false);
      setLoading(false);
      return;
    }

    const checkFileExists = async () => {
      try {
        setLoading(true);
        const response = await apiRequest<FileExistsResponse>(`/api/file-exists?path=${encodeURIComponent(path)}`);
        setExists(response.exists);
        setError(null);
      } catch (err) {
        setExists(false);
        setError(err instanceof Error ? err : new Error("Error desconocido"));
      } finally {
        setLoading(false);
      }
    };

    checkFileExists();
  }, [path]);

  return { exists, loading, error };
}