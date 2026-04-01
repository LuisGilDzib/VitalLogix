# VitalLogix

Sistema de gestión de farmacia construido con Java, PostgreSQL y React.

## Navegación

- [English](README.md)
- [Español](README.es.md)
- [Índice de documentación](docs/README.md)

## Enlaces Rápidos

- [Backend](backend/)
- [Frontend](frontend/)
- Módulo desktop (planeado)
- [Documentación](docs/)

## Descripción General

VitalLogix cubre inventario, ventas, clientes, reportes y gestión de categorías en un flujo web.

## 📖 ¿Quieres entender cómo funciona este proyecto?

Si eres estudiante, junior o simplemente tienes curiosidad sobre la arquitectura de **VitalLogix**,
preparamos una guía simplificada y sin tecnicismos innecesarios:

👉 **[Haz clic aquí para leer: COMO-FUNCIONA.md](COMO-FUNCIONA.md)**

En este archivo explicamos de forma clara cómo se comunica PostgreSQL con el servidor en Java
y cómo esa información llega al frontend en React.

Tambien lo usamos como bitacora visual para documentar la evolucion del proyecto con capturas de interfaz.

## Mapa del Repositorio

- [backend/](backend/) API Spring Boot, modelo de dominio y servicios
- [frontend/](frontend/) Interfaz React para inventario, ventas y administración
- [desktop/](desktop/) módulo desktop reservado (actualmente no implementado)
- [docs/](docs/) Centro de documentación del proyecto
- [backend/src/main/java/com/vitallogix/backend/controller/CategoryController.java](backend/src/main/java/com/vitallogix/backend/controller/CategoryController.java) endpoints de administración de categorías
- [frontend/src/components/CategoryManagementPanel.jsx](frontend/src/components/CategoryManagementPanel.jsx) panel de categorías para admin
- [frontend/src/App.jsx](frontend/src/App.jsx) shell principal y vistas por rol

## Estructura del Proyecto

- `backend/` API en Spring Boot y lógica de negocio
- `frontend/` Interfaz web en React
- `desktop/` Módulo desktop planeado (placeholder)
- `docs/en/` Documentación en inglés
- `docs/es/` Documentación en español

## Requerimientos Funcionales

### 1. Gestión de Inventarios

- El sistema debe permitir la incorporación de nuevos productos al inventario.
- Debe permitir la actualización de existencias de productos.
- Debe registrar la fecha de vencimiento de los productos.
- Debe permitir la eliminación de productos obsoletos o vencidos.

### 2. Registro de Ventas

- El sistema debe permitir la venta de productos al cliente.
- Debe calcular automáticamente el precio total de la compra.
- Debe registrar la información del cliente (nombre, dirección, número de contacto) para ventas con receta.
- Debe generar un recibo para cada venta.

### 3. Búsqueda y Consulta de Productos

- Debe permitir la búsqueda rápida de productos por nombre, código o categoría.
- Debe proporcionar información detallada de cada producto, incluyendo precio, existencias y fecha de vencimiento.

### 4. Gestión de Clientes

- Debe permitir la creación y mantenimiento de registros de clientes.
- Debe proporcionar información sobre las compras anteriores de los clientes.
- Debe permitir la asignación de descuentos o programas de fidelización a clientes habituales.
- El cliente debe contar con un número de `clienteamigo` que le permita acceder a un programa de descuentos.

### 5. Generación de Reportes

- Debe ser capaz de generar informes de ventas diarias, semanales, mensuales y anuales.
- Debe proporcionar informes de inventario actualizados.

### 6. Gestión de Categorías

- El sistema incluye un módulo de categorías con tipos predefinidos y personalizados.
- Las categorías personalizadas pueden enviarse para aprobación o rechazo.
- Las categorías activas se usan en formularios de producto y filtros de inventario.

## Requerimientos No Funcionales

### 1. Interfaz de Usuario Intuitiva

- La interfaz debe ser simple, clara y fácil de usar.
- La navegación debe permitir identificar rápidamente acciones de inventario, ventas, clientes y reportes.

## Evidencias SOLID (mínimo 3 principios)

### SRP: Single Responsibility Principle

- `App.jsx` delega la gestión de clientes en un panel especializado para reducir responsabilidades del componente raíz.
- `CustomerManagementPanel.jsx` concentra carga de clientes e historial de compras en un solo módulo de UI.
- Evidencia: [frontend/src/App.jsx](frontend/src/App.jsx), [frontend/src/components/CustomerManagementPanel.jsx](frontend/src/components/CustomerManagementPanel.jsx)

### DIP: Dependency Inversion Principle

- `ReportController` depende de la abstracción `ReportServicePort` en lugar de depender de una implementación concreta.
- `ReportService` implementa esa interfaz y encapsula la lógica de reportes.
- Evidencia: [backend/src/main/java/com/vitallogix/backend/controller/ReportController.java](backend/src/main/java/com/vitallogix/backend/controller/ReportController.java), [backend/src/main/java/com/vitallogix/backend/service/ReportServicePort.java](backend/src/main/java/com/vitallogix/backend/service/ReportServicePort.java), [backend/src/main/java/com/vitallogix/backend/service/ReportService.java](backend/src/main/java/com/vitallogix/backend/service/ReportService.java)

### OCP: Open/Closed Principle

- El cálculo del bonus de recomendación por stock fue movido a reglas (`StockBonusRule`) para extender comportamiento sin modificar la lógica principal.
- Evidencia: [backend/src/main/java/com/vitallogix/backend/service/ComboSuggestionService.java](backend/src/main/java/com/vitallogix/backend/service/ComboSuggestionService.java)

## Matriz de Acceso por Rol

- Invitado: puede consultar productos y categorías activas; no puede generar ventas ni administrar datos.
- Usuario: puede operar ventas; no puede administrar productos, reportes ni módulos administrativos.
- Admin: acceso completo a productos, reportes, clientes, historial y categorías (incluyendo aprobaciones).

## Primeros Pasos

1. Levantar base de datos y backend:
	- `docker compose up -d --build vitallogix-app`
2. Levantar frontend:
	- `npm --prefix frontend run dev`
3. Abrir la aplicación e iniciar sesión con una cuenta de admin o usuario.

## Puntos de Entrada Importantes

- [SecurityConfig.java](backend/src/main/java/com/vitallogix/backend/config/SecurityConfig.java)
- [CategoryService.java](backend/src/main/java/com/vitallogix/backend/service/CategoryService.java)
- [CategoryManagementPanel.jsx](frontend/src/components/CategoryManagementPanel.jsx)
- [api.js](frontend/src/services/api.js)

## Documentación

- [Índice de documentación](docs/README.md)
- [Página principal de docs en inglés](docs/en/README.md)
- [Página principal de docs en español](docs/es/README.md)
- [Notas del sistema de categorías](docs/CATEGORY_MANAGEMENT_SYSTEM.md)
- [Notas del panel de administración de categorías](docs/ADMIN_CATEGORY_PANEL.md)
