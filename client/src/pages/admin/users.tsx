import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, Pencil, Power, CheckCircle, User, Users } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { InsertUser } from '@shared/schema';

// Esquema para el formulario de usuario
const userFormSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es obligatorio"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirme la contraseña"),
  role: z.enum(["haykakan", "festero"]).default("festero"),
  name: z.string().optional(),
  email: z.string().email("Email inválido").optional().nullable(),
  phone: z.string().optional().nullable(),
  comparsaName: z.string().optional().nullable(),
  details: z.string().optional().nullable(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// Esquema para la actualización de usuario (password opcional)
const userUpdateSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es obligatorio"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  confirmPassword: z.string().min(6, "Confirme la contraseña").optional(),
  role: z.enum(["haykakan", "festero"]).default("festero"),
  name: z.string().optional(),
  email: z.string().email("Email inválido").optional().nullable(),
  phone: z.string().optional().nullable(),
  comparsaName: z.string().optional().nullable(),
  details: z.string().optional().nullable(),
}).refine((data) => {
  // Si se proporciona contraseña, también se debe proporcionar confirmación
  if (data.password) {
    return data.confirmPassword && data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type User = {
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
};

export default function UsersPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAll, setShowAll] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Consulta para obtener usuarios
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['/api/auth/users', { showAll }],
    queryFn: async () => {
      const response = await apiRequest(`/api/auth/users?showAll=${showAll}`);
      return response as User[];
    }
  });

  // Mutación para crear usuario
  const createUserMutation = useMutation({
    mutationFn: async (userData: z.infer<typeof userFormSchema>) => {
      const response = await apiRequest('/api/auth/users', {
        method: 'POST',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al crear el usuario",
        variant: "destructive",
      });
    }
  });

  // Mutación para actualizar usuario
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }: { id: number, userData: any }) => {
      const response = await apiRequest(`/api/auth/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado exitosamente",
      });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el usuario",
        variant: "destructive",
      });
    }
  });
  
  // Mutación para activar/desactivar usuario
  const toggleActiveStatusMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest(`/api/auth/users/${userId}/toggle-active`, {
        method: 'PATCH'
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: data.message || "Estado actualizado",
        description: "El estado del usuario ha sido actualizado",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/users'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al cambiar el estado del usuario",
        variant: "destructive",
      });
    }
  });

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(isEditMode ? userUpdateSchema : userFormSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      role: 'festero',
      name: '',
      email: '',
      phone: '',
      comparsaName: '',
      details: '',
    }
  });

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setIsEditMode(true);
      setSelectedUser(user);
      form.reset({
        username: user.username,
        role: user.role,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        comparsaName: user.comparsaName || '',
        details: user.details || '',
        password: '',
        confirmPassword: '',
      });
    } else {
      setIsEditMode(false);
      setSelectedUser(null);
      form.reset({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'festero',
        name: '',
        email: '',
        phone: '',
        comparsaName: '',
        details: '',
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (data: any) => {
    if (isEditMode && selectedUser) {
      // Si no hay contraseña, eliminarla del objeto a enviar
      const updateData = { ...data };
      if (!updateData.password) {
        delete updateData.password;
        delete updateData.confirmPassword;
      }
      
      updateUserMutation.mutate({
        id: selectedUser.id,
        userData: updateData,
      });
    } else {
      createUserMutation.mutate(data);
    }
  };
  
  // Función para alternar el estado activo/inactivo de un usuario
  const handleToggleActive = (userId: number) => {
    toggleActiveStatusMutation.mutate(userId);
  };

  if (isLoading) return <div className="flex justify-center py-10"><p>Cargando usuarios...</p></div>;
  if (error) return <div className="flex justify-center py-10 text-red-500">Error al cargar usuarios</div>;

  return (
    <div className="container py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
            <p className="text-gray-500">Administra usuarios del sistema y participantes de fiestas</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="space-x-2">
            <PlusCircle className="h-4 w-4" />
            <span>Nuevo Usuario</span>
          </Button>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch 
              id="show-inactive" 
              checked={showAll}
              onCheckedChange={setShowAll}
            />
            <Label htmlFor="show-inactive">
              {showAll ? "Mostrando todos los usuarios (incluidos inactivos)" : "Mostrando solo usuarios activos"}
            </Label>
          </div>
          <div>
            <Badge className="ml-2" variant="outline">
              {users.length} usuario{users.length !== 1 ? 's' : ''} 
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {users.map((user) => (
          <Card key={user.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-bold">{user.name || user.username}</CardTitle>
                <Badge variant={user.role === 'haykakan' ? 'default' : 'secondary'}>
                  {user.role === 'haykakan' ? 'Administrador' : 'Festero'}
                </Badge>
              </div>
              <CardDescription>@{user.username}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {user.comparsaName && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Comparsa</p>
                  <p>{user.comparsaName}</p>
                </div>
              )}
              
              {(user.email || user.phone) && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Contacto</p>
                  {user.email && <p className="text-sm">{user.email}</p>}
                  {user.phone && <p className="text-sm">{user.phone}</p>}
                </div>
              )}
              
              {user.details && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Detalles</p>
                  <p className="text-sm text-gray-700">{user.details}</p>
                </div>
              )}
              
              <div className="pt-1 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleOpenDialog(user)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                
                <Button
                  variant={user.active ? "destructive" : "default"}
                  size="sm"
                  className="w-full"
                  onClick={() => handleToggleActive(user.id)}
                  disabled={toggleActiveStatusMutation.isPending}
                >
                  {user.active ? (
                    <>
                      <Power className="h-4 w-4 mr-2" />
                      Desactivar
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activar
                    </>
                  )}
                </Button>
                
                {!user.active && (
                  <Badge variant="outline" className="w-full flex justify-center mt-2 bg-red-50">
                    Usuario inactivo
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Diálogo para crear/editar usuario */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Modifica los datos del usuario seleccionado'
                : 'Completa el formulario para crear un nuevo usuario en el sistema'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="usuario"
                          {...field}
                          disabled={isEditMode} // No permitir cambiar username en modo edición
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                            <SelectValue placeholder="Selecciona un rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="haykakan">Administrador</SelectItem>
                          <SelectItem value="festero">Festero</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre y apellidos" {...field} value={field.value || ''} />
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
                      <FormLabel>{isEditMode ? 'Nueva Contraseña (opcional)' : 'Contraseña'}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={isEditMode ? "Dejar en blanco para mantener" : "Contraseña"}
                          {...field}
                        />
                      </FormControl>
                      {isEditMode && (
                        <FormDescription>
                          Dejar en blanco para mantener la contraseña actual
                        </FormDescription>
                      )}
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
                          placeholder="Confirmar contraseña"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@ejemplo.com"
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
                          placeholder="Teléfono de contacto"
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
                        placeholder="Información adicional"
                        className="resize-none"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createUserMutation.isPending || updateUserMutation.isPending}
                >
                  {createUserMutation.isPending || updateUserMutation.isPending
                    ? 'Guardando...'
                    : isEditMode
                    ? 'Actualizar'
                    : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}