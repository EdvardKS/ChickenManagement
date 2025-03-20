import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import AdminLayout from "../../components/layout/admin-layout";
import { type Product } from "../../types/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useToast } from "@/hooks/use-toast";

export default function FeaturedMenus() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estado para ordenar los menús destacados
  const [featuredMenus, setFeaturedMenus] = useState<Product[]>([]);
  const [isReordering, setIsReordering] = useState(false);
  
  // Consulta para obtener todos los menús (categoría ID 1)
  const { data: menus, isLoading } = useQuery({
    queryKey: ['/api/menus/all'],
    queryFn: async () => {
      const response = await apiRequest<Product[]>('/api/menus/all');
      return response;
    }
  });
  
  // Efecto para actualizar los menús destacados cuando cambian los datos
  React.useEffect(() => {
    if (menus) {
      // Filtrar menús destacados y ordenarlos
      const featured = menus
        .filter((menu) => menu.featured)
        .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));
      
      setFeaturedMenus(featured);
    }
  }, [menus]);
  
  // Mutación para actualizar el estado destacado de un menú
  const updateFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured, order }: { id: number, featured: boolean, order?: number }) => {
      const response = await apiRequest(
        `/api/menus/${id}/featured`, 
        'PATCH', 
        { featured, order }
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menus/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/menus/featured'] });
      toast({
        title: "Menú actualizado",
        description: "El estado del menú ha sido actualizado correctamente",
      });
    },
    onError: (error) => {
      console.error("Error al actualizar menú destacado:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el menú destacado. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });
  
  // Maneja el cambio de estado destacado
  const handleFeaturedChange = (product: Product, featured: boolean) => {
    updateFeaturedMutation.mutate({
      id: product.id,
      featured,
      order: featured ? (featuredMenus.length > 0 ? featuredMenus.length : 0) : undefined
    });
  };
  
  // Maneja el reordenamiento de menús destacados
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(featuredMenus);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Actualizar el orden en la UI temporalmente
    setFeaturedMenus(items);
    
    // Guardar el nuevo orden en el servidor
    items.forEach((item, index) => {
      updateFeaturedMutation.mutate({
        id: item.id,
        featured: true,
        order: index
      });
    });
  };
  
  const startReordering = () => {
    setIsReordering(true);
  };
  
  const finishReordering = () => {
    setIsReordering(false);
  };
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader size="lg" />
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Gestión de Menús Destacados</h1>
        
        {/* Sección de menús destacados */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Menús Destacados</CardTitle>
            <CardDescription>
              Estos menús aparecerán destacados en la página principal. Puedes reordenarlos arrastrando y soltando.
            </CardDescription>
            <div className="flex gap-4">
              {!isReordering ? (
                <Button onClick={startReordering} disabled={featuredMenus.length < 2}>
                  Reordenar
                </Button>
              ) : (
                <Button onClick={finishReordering}>
                  Finalizar reordenamiento
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {featuredMenus.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay menús destacados. Marca algún menú como destacado en la sección inferior.
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="featured-menus" isDropDisabled={!isReordering}>
                  {(provided) => (
                    <div 
                      className="space-y-4"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {featuredMenus.map((menu, index) => (
                        <Draggable 
                          key={menu.id.toString()} 
                          draggableId={menu.id.toString()} 
                          index={index}
                          isDragDisabled={!isReordering}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 border rounded-md flex items-center justify-between ${
                                isReordering ? "cursor-grab bg-accent/30" : ""
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                {isReordering && (
                                  <span className="text-sm font-semibold bg-primary/10 rounded px-2 py-1">
                                    {index + 1}
                                  </span>
                                )}
                                <div>
                                  <h3 className="font-medium">{menu.name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {menu.price}€
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleFeaturedChange(menu, false)}
                                >
                                  Quitar de destacados
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </CardContent>
        </Card>
        
        {/* Sección de todos los menús */}
        <Card>
          <CardHeader>
            <CardTitle>Todos los Menús</CardTitle>
            <CardDescription>
              Selecciona qué menús quieres destacar en la página principal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menus?.map((menu) => (
                <Card key={menu.id} className={menu.featured ? "border-primary" : ""}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{menu.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-muted-foreground">{menu.description || "Sin descripción"}</p>
                    <p className="font-semibold mt-2">{menu.price}€</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Label htmlFor={`featured-${menu.id}`} className="cursor-pointer">
                      {menu.featured ? "Destacado" : "Destacar en página principal"}
                    </Label>
                    <Switch
                      id={`featured-${menu.id}`}
                      checked={menu.featured || false}
                      onCheckedChange={(checked) => handleFeaturedChange(menu, checked)}
                    />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}