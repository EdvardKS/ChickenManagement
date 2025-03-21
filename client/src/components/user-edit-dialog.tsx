import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader } from '@/components/ui/loader';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface User {
  id: number;
  username: string;
  role: 'haykakan' | 'festero';
  name: string | null;
  email: string | null;
  phone: string | null;
  comparsaName: string | null;
  details: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserEditDialogProps {
  user?: User;
  isOpen: boolean;
  isCreating?: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const userFormSchema = z.object({
  username: z.string().min(3, {
    message: 'El nombre de usuario debe tener al menos 3 caracteres',
  }),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  role: z.enum(['haykakan', 'festero']),
  name: z.string().optional().nullable(),
  email: z.string().email({
    message: 'Ingrese un correo electrónico válido',
  }).optional().nullable(),
  phone: z.string().optional().nullable(),
  comparsaName: z.string().optional().nullable(),
  details: z.string().optional().nullable(),
  active: z.boolean().default(true),
}).refine(data => {
  // Si se proporciona una contraseña, debe coincidir con la confirmación
  if (data.password && data.password.length > 0) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type UserFormValues = z.infer<typeof userFormSchema>;

export function UserEditDialog({ 
  user, 
  isOpen, 
  isCreating = false, 
  onOpenChange, 
  onSuccess 
}: UserEditDialogProps) {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  // Inicializar formulario con los datos del usuario si existe
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user 
      ? {
          username: user.username,
          password: '',
          confirmPassword: '',
          role: user.role,
          name: user.name,
          email: user.email,
          phone: user.phone,
          comparsaName: user.comparsaName,
          details: user.details,
          active: user.active,
        }
      : {
          username: '',
          password: '',
          confirmPassword: '',
          role: 'festero', // Por defecto para nuevos usuarios
          name: '',
          email: '',
          phone: '',
          comparsaName: '',
          details: '',
          active: true,
        },
  });

  // Mutación para crear/actualizar usuario
  const userMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      if (isCreating) {
        return await apiRequest('/api/auth/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else if (user) {
        return await apiRequest(`/api/auth/users/${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      toast({
        title: isCreating ? 'Usuario creado' : 'Usuario actualizado',
        description: isCreating 
          ? 'El usuario ha sido creado exitosamente' 
          : 'La información del usuario ha sido actualizada',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/users'] });
      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      console.error('Error:', error);
      setError(error.message || 'Ha ocurrido un error. Inténtelo de nuevo más tarde.');
    },
  });

  function onSubmit(data: UserFormValues) {
    setError(null);
    // Eliminar campos innecesarios
    if (!data.password) {
      delete data.password;
      delete data.confirmPassword;
    }
    userMutation.mutate(data);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
          </DialogTitle>
          <DialogDescription>
            {isCreating 
              ? 'Complete el formulario para crear un nuevo usuario festero' 
              : 'Actualice la información del usuario según sea necesario'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de Usuario</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingrese un nombre de usuario"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña {!isCreating && '(opcional)'}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={isCreating ? "Contraseña" : "Dejar en blanco para mantener"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirme la contraseña"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="festero">Festero</SelectItem>
                      <SelectItem value="haykakan">Administrador (Haykakan)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre y apellidos"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="correo@ejemplo.com"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Número de teléfono"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="comparsaName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de Comparsa</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre de la comparsa"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalles Adicionales</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalles adicionales o notas"
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-[#8B4513] text-white hover:bg-[#6d3610]"
                disabled={userMutation.isPending}
              >
                {userMutation.isPending ? (
                  <>
                    <Loader size="sm" /> 
                    <span className="ml-2">Guardando...</span>
                  </>
                ) : (
                  isCreating ? 'Crear Usuario' : 'Guardar Cambios'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}