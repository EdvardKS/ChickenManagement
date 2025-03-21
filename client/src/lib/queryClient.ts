import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Intentar obtener el cuerpo como JSON primero
    let error: any;
    let errorBody: any;
    
    try {
      // Intentar leer cuerpo como JSON
      const clonedRes = res.clone();  // Clonar para no consumir el body
      errorBody = await clonedRes.json();
      
      // Crear un error con los detalles disponibles
      error = new Error(errorBody.error || errorBody.message || `${res.status}: ${res.statusText}`);
      
      // Agregar información adicional al objeto de error
      error.status = res.status;
      error.statusText = res.statusText;
      error.url = res.url;
      
      // Agregar todos los detalles recibidos del servidor
      if (errorBody.details) error.details = errorBody.details;
      if (errorBody.code) error.code = errorBody.code;
      if (errorBody.stack && process.env.NODE_ENV !== 'production') error.serverStack = errorBody.stack;
      
      // Incluir el cuerpo completo para referencia
      error.response = errorBody;
      
      console.error(`API Error [${res.status}]:`, errorBody);
    } catch (e) {
      // Si falla al leer como JSON, intentar leer como texto
      try {
        const text = await res.text() || res.statusText;
        error = new Error(`${res.status}: ${text}`);
        error.status = res.status;
        error.statusText = res.statusText;
        error.url = res.url;
        console.error(`API Error [${res.status}]:`, text);
      } catch (textError) {
        // Si todo falla, crear un error genérico
        error = new Error(`${res.status}: ${res.statusText}`);
        error.status = res.status;
        error.statusText = res.statusText;
        error.url = res.url;
        console.error(`API Error [${res.status}] (no body)`, res.statusText);
      }
    }
    
    throw error;
  }
}

export async function apiRequest(
  url: string,
  options?: RequestInit,
): Promise<any> {
  const res = await fetch(url, {
    credentials: "include",
    ...options
  });

  await throwIfResNotOk(res);
  
  try {
    return await res.json();
  } catch (e) {
    // Si no se puede parsear como JSON, devuelve la respuesta directa
    return res;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
