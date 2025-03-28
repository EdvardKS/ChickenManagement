import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/ui/loader';
import { apiRequest } from '@/lib/queryClient';
import { LoginCredentials } from '@shared/schema';

const LoginSchema = z.object({
  username: z.string().min(1, { message: 'El usuario es requerido' }),
  password: z.string().min(1, { message: 'La contraseña es requerida' }),
});

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const form = useForm<LoginCredentials>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      console.log('🔒 LOGIN - Enviando credenciales al servidor:', credentials.username);
      
      try {
        // Asegurarse de incluir credentials para enviar cookies
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
          credentials: 'include' // Importante para las cookies
        });
        
        if (!response.ok) {
          console.error(`🔒 LOGIN - Error HTTP: ${response.status} ${response.statusText}`);
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        console.log('🔒 LOGIN - Respuesta del servidor recibida');
        console.log('🔒 LOGIN - Cookies disponibles:', document.cookie ? 'Sí' : 'No');
        
        // Devolver los datos para onSuccess
        return await response.json();
      } catch (error) {
        console.error('🔒 LOGIN - Error en fetch:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('✅ LOGIN - Inicio de sesión exitoso para:', data.user.username);
      
      toast({
        title: 'Inicio de sesión exitoso',
        description: `Bienvenido, ${data.user.username}`,
      });
      
      // Pequeña espera para asegurar que la cookie se guarde correctamente
      setTimeout(() => {
        console.log('🔄 LOGIN - Redirigiendo al usuario según rol:', data.user.role);
        
        // Redirigir según el rol del usuario usando navegación forzada
        if (data.user.role === 'haykakan') {
          window.location.href = '/admin/orders'; // Ruta por defecto para administradores
        } else if (data.user.role === 'festero') {
          window.location.href = '/fiestas'; // Ruta exclusiva para festeros
        } else {
          window.location.href = '/admin'; // Ruta genérica como fallback
        }
      }, 500);
    },
    onError: (error: any) => {
      console.error('❌ LOGIN - Error en la autenticación:', error);
      
      if (error.status === 401) {
        setLoginError('Usuario o contraseña incorrectos');
      } else {
        setLoginError('Error al iniciar sesión. Intente nuevamente');
      }
    },
  });
  
  const onSubmit = (data: LoginCredentials) => {
    setLoginError(null);
    loginMutation.mutate(data);
  };
  
  return (
    <div 
      className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/img/corporativa/maxtor/Castillo-de-Villena1.jpg")' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">Fiestas de Moros y Cristianos</h1>
          <p className="text-white text-lg drop-shadow-md">Sistema de Gestión de Pedidos</p>
        </div>
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-primary/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Acceso al Sistema</CardTitle>
            <CardDescription className="text-center">
              Accede al panel de administración para Fiestas de Moros y Cristianos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese su usuario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Ingrese su contraseña" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {loginError && (
                  <div className="text-red-500 text-sm text-center">{loginError}</div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#8B4513] text-white hover:bg-[#6d3610]" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? <Loader size="sm" /> : 'Iniciar Sesión'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="text-center text-sm text-gray-500">
            <div className="w-full space-y-2">
              <p>
                Este sistema está diseñado para los usuarios registrados que participan en las Fiestas de Moros y Cristianos.
              </p>
              <p>
                Los administradores pueden gestionar pedidos y reservas para las comparsas durante las fiestas,
                permitiendo una mejor organización de los encargos de comida y servicios para los festeros.
              </p>
              <p>
                Los usuarios con rol "festero" podrán acceder a funcionalidades específicas para sus comparsas.
                Para obtener acceso, contacte con el administrador de Asador La Morenica.
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}