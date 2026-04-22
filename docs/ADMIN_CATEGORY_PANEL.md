# Panel de Administración de Categorías

## Estado de la Funcionalidad

Este panel permite a los administradores tener un control total sobre las categorías del sistema. Con esta funcionalidad, solo los administradores pueden crear, aprobar, rechazar, editar o desactivar categorías. Además, incluye un sistema de auditoría que registra qué usuario creó o aprobó una categoría y en qué momento lo hizo.

---

## Arquitectura Implementada

### Backend

Para soportar esta funcionalidad se implementaron y modificaron varios archivos en el backend:

1. Entidad Category
Mantiene la información de la categoría y los datos de auditoría. Controla si una categoría es activa, inactiva o si está pendiente de aprobación, así como si es predefinida del sistema o creada a medida.

2. CategoryRepository
Incluye consultas especializadas para filtrar las categorías según su estado o tipo, y maneja búsquedas ignorando mayúsculas y minúsculas.

3. CategoryService
Contiene la lógica central. Provee métodos para obtener categorías activas, crear nuevas en estado pendiente, aprobarlas para que se activen, rechazarlas para eliminarlas, o editarlas y desactivarlas sin borrarlas de la base de datos.

4. CategoryController
Expone los endpoints necesarios para que el frontend se comunique con el backend, cubriendo las operaciones de lectura, creación, actualización, aprobación y rechazo de categorías.

5. Objetos de Transferencia (DTOs)
Se utilizan objetos específicos para recibir datos al crear o actualizar categorías y para enviar respuestas estructuradas cuando se listan o detallan.

### Frontend

En la interfaz de usuario, se trabajó principalmente en los siguientes componentes:

1. Componente CategoryManagementPanel
Es la interfaz donde los administradores gestionan todo. Tiene dos pestañas que separan las categorías activas o inactivas de aquellas que están esperando revisión. Permite hacer todas las operaciones de administración y muestra los datos de auditoría en tiempo real.

2. Integración en la aplicación
Se agregó el acceso al panel mediante un nuevo botón en la barra de navegación principal, que es exclusivo para administradores, y se configuró la ruta correspondiente para mostrar el componente.

3. Servicio de API
Se agregaron las funciones necesarias para conectarse con los nuevos endpoints del backend relacionados a las categorías.

---

## Flujo Completo

### Crear un Producto con una Nueva Categoría

Cuando un administrador está registrando un nuevo producto y no encuentra la categoría adecuada, puede seleccionar la opción para especificar otra. Al hacerlo, aparece un campo de texto donde puede escribir, por ejemplo, "Electrolitos".

Al guardar el producto, el backend crea tanto el producto con esa categoría como el registro de la nueva categoría en estado pendiente de aprobación.

Esta nueva categoría aparecerá inmediatamente en la pestaña de pendientes dentro del panel de administración de categorías. Cualquier administrador puede entrar, revisar la lista y decidir si la aprueba o la rechaza. Si decide aprobarla, su estado cambia a activa, quedando disponible en el menú desplegable para que cualquier usuario pueda utilizarla al crear futuros productos, y se registra quién fue el administrador que dio la aprobación.

---

## Permisos

El sistema es bastante restrictivo para mantener el orden. Solamente los administradores tienen el poder de crear categorías predefinidas o personalizadas, ver las listas completas (incluyendo las pendientes), y realizar cualquier acción de modificación, como aprobar, rechazar, editar o desactivar.

El único permiso que está abierto para cualquier usuario es el de ver la lista de categorías activas, ya que esto es necesario para poder llenar los menús desplegables al navegar por la aplicación.

---

## Archivos Relevantes

Backend:
- backend/src/main/java/com/vitallogix/backend/model/Category.java
- backend/src/main/java/com/vitallogix/backend/repository/CategoryRepository.java
- backend/src/main/java/com/vitallogix/backend/service/CategoryService.java
- backend/src/main/java/com/vitallogix/backend/controller/CategoryController.java
- backend/src/main/java/com/vitallogix/backend/dto/CategoryRequest.java
- backend/src/main/java/com/vitallogix/backend/dto/CategoryResponse.java

Frontend:
- frontend/src/components/CategoryManagementPanel.jsx
- frontend/src/services/api.js
- frontend/src/App.jsx

Documentación:
- docs/CATEGORY_MANAGEMENT_SYSTEM.md
- docs/ADMIN_CATEGORY_PANEL.md

---

## Cómo Probar la Funcionalidad

1. Crear una categoría nueva:
Inicia sesión como administrador y ve a la sección de ventas o inventario. Haz clic en "Nuevo Producto" y completa los datos. En el campo de categoría, selecciona la opción para especificar otra y escribe un nombre nuevo, como "Electrolitos". Guarda el producto.

2. Revisar el panel de administración:
Dirígete a la sección de categorías y abre la pestaña de pendientes. Deberías ver "Electrolitos" en la lista esperando revisión.

3. Aprobar la categoría:
Haz clic en el botón para aprobar "Electrolitos". El sistema te confirmará la acción y podrás ver que la categoría pasó a la pestaña general con estado activo.

4. Verificar que esté disponible:
Intenta crear otro producto nuevo. Al abrir el menú desplegable de categorías, "Electrolitos" ya debería aparecer como una opción normal que puedes seleccionar sin tener que escribirla de nuevo.

---

## Base de Datos

Si necesitas crear la tabla manualmente o utilizar una migración, la estructura SQL incluye campos para el identificador, el nombre único, la descripción, el estado y tipo de categoría, además de las fechas de creación y actualización, y los registros de auditoría sobre quién la creó y quién la aprobó, junto con índices para optimizar las búsquedas por estado y tipo.
