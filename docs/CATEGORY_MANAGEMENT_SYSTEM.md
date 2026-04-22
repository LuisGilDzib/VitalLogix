# Sistema de Gestión de Categorías

## Descripción General

El sistema de categorías está pensado para que los administradores puedan gestionar las categorías de productos desde un solo lugar. Tenemos dos tipos de categorías:
- Predefinidas: Son las categorías base del sistema y no se pueden eliminar.
- Personalizadas: Son las categorías que crean los administradores directamente desde el formulario de productos y requieren una aprobación posterior.

## Flujo de Categorías

### Categorías Predefinidas
Cuando una categoría es predefinida y está activa, aparece automáticamente disponible en el menú desplegable al crear o editar productos.

Estas son las categorías predefinidas con las que cuenta el sistema:
- Analgésicos
- Antibióticos
- Antiinflamatorios
- Antigripales
- Antialérgicos
- Vitaminas
- Suplementos
- Controlados
- Higiene
- Cuidado personal

### Categorías Personalizadas
El flujo para una nueva categoría es el siguiente:
1. Un administrador selecciona "Otra (especificar)" al crear un producto.
2. Escribe el nuevo nombre de la categoría (por ejemplo, "Electrolitos").
3. Al guardar el producto, se crea la nueva categoría con estado pendiente de aprobación.
4. El administrador va al panel de categorías, en la pestaña de pendientes.
5. Si aprueba la categoría, esta se vuelve activa y ya aparece en el menú desplegable para todos.
6. Si la rechaza, simplemente se elimina del sistema.

## Arquitectura

### Backend

Entidad Category (com.vitallogix.backend.model.Category)
Contiene la información fundamental de la categoría, como su identificador único, nombre, descripción y estado (activa, inactiva o pendiente de aprobación). También guarda el tipo (predefinida o personalizada) y datos de auditoría para saber quién la creó, quién la aprobó y en qué fechas.

Repositorio y Servicio
- CategoryRepository: Se encarga de las consultas a la base de datos.
- CategoryService: Maneja toda la lógica de negocio. Permite obtener las categorías activas o pendientes, crear nuevas categorías personalizadas, aprobarlas, rechazarlas, actualizarlas o desactivarlas. Cuando se desactiva una categoría, esta no se elimina, simplemente deja de estar disponible para nuevos productos.

Controlador (CategoryController)
Expone los endpoints en `/api/categories` para que el frontend pueda interactuar con el sistema. Permite listar las categorías según su estado o tipo, así como crear, actualizar, aprobar, rechazar o desactivar categorías mediante peticiones HTTP.

### Frontend

Servicio de API (src/services/api.js)
Contiene las funciones para hacer las llamadas de lectura y escritura al backend, mapeando directamente a los endpoints del controlador de categorías.

Componente CategoryManagementPanel (src/components/CategoryManagementPanel.jsx)
Es el panel principal de administración. Está dividido en dos pestañas: una para ver todas las categorías y otra para revisar las pendientes de aprobación. Desde aquí se puede editar la información, aprobar o rechazar nuevas categorías y desactivar las existentes. También muestra información útil sobre el estado y tipo de cada categoría.

Integración en la aplicación
El panel se encuentra en la barra de navegación bajo la sección de "Categorías", pero solo es visible para los administradores.

## Flujo de Persistencia

Creación de un producto con categoría nueva:
1. El administrador selecciona "Otra (especificar)" en el formulario de producto y escribe el nuevo nombre.
2. Al enviar el formulario, el sistema detecta que es una categoría nueva y la incluye en la petición.
3. El backend recibe el producto, lo guarda y automáticamente registra la nueva categoría en estado pendiente si no existía previamente.

Transición de estados:
- Las categorías predefinidas nacen como activas, se pueden editar y siguen activas, o se pueden desactivar pasando a estado inactivo.
- Las categorías personalizadas nacen como pendientes de aprobación. Si se aprueban, pasan a estar activas. Si se rechazan, se eliminan definitivamente de la base de datos.

## Seguridad y Permisos

Para mantener el control del sistema, varias acciones están restringidas:
- Crear categorías personalizadas: Solo administradores (durante la creación de un producto).
- Crear categorías predefinidas: Solo administradores (suele hacerse por configuración inicial en el backend).
- Aprobar, rechazar, editar o desactivar categorías: Solo administradores.
- Listar todas las categorías o las pendientes: Solo administradores.
- Listar las categorías activas: Disponible para cualquier usuario, ya que es necesario para llenar los menús desplegables.

## Casos de Uso

Caso 1: Un administrador necesita una categoría que no existe
Crea un producto nuevo y en el campo de categoría selecciona especificar otra. Escribe "Electrolitos" y guarda el producto. La categoría se guarda como pendiente. Luego, va a la sección de categorías, revisa la pestaña de pendientes y aprueba "Electrolitos". A partir de ese momento, la categoría está disponible para futuros productos.

Caso 2: Rechazar una categoría
Si un administrador ve una categoría en la pestaña de pendientes que no tiene sentido o está mal escrita, puede rechazarla. La categoría se elimina de la base de datos, aunque el producto original que se creó con ese texto mantiene la cadena de texto original.

Caso 3: Desactivar una categoría obsoleta
Si ya no se van a vender productos de la categoría "Vitaminas", un administrador puede ir al panel, buscarla y hacer clic en desactivar. La categoría pasa a estado inactivo, por lo que ya no aparecerá como opción para productos nuevos, pero los productos que ya la tenían asignada no pierden su información histórica.

Última actualización: Abril 2026
