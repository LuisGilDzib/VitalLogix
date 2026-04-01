# VitalLogix
Sistema de Gestión de Farmacia.
Java (Spring Boot) + PostgreSQL + React + Electron.

Elige tu idioma:

- [English](README.md)
- [Español](README.es.md)

## Estructura
- /backend
- /frontend
- /desktop
- /docs/en
- /docs/es

## Descripción General

VitalLogix es una plataforma de gestión de farmacia para inventarios, ventas, clientes, reportes y uso de escritorio.

## Estructura del Proyecto

- `backend/` API en Spring Boot y lógica de negocio
- `frontend/` Interfaz web en React
- `desktop/` Contenedor de escritorio con Electron
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

## Matriz de Acceso por Rol

- Invitado: puede consultar productos y categorías activas; no puede generar ventas ni administrar datos.
- Usuario: puede operar ventas; no puede administrar productos, reportes ni módulos administrativos.
- Admin: acceso completo a productos, reportes, clientes, historial y categorías (incluyendo aprobaciones).

## Capturas de Pantalla

Aquí puedes agregar capturas de pantalla del avance del proyecto.

### Estado Inicial

- [ ] Dashboard inicial
- [ ] Módulo de inventario
- [ ] Flujo de ventas
- [ ] Gestión de clientes
- [ ] Reportes

### Estado Final

- [ ] Dashboard final
- [ ] Módulo de inventario final
- [ ] Flujo de ventas final
- [ ] Gestión de clientes final
- [ ] Reportes finales

## Instalación

Aquí se pueden agregar los pasos para instalar y ejecutar el proyecto.

## Enlaces de Documentación

- Documentación en inglés: `README.md`
- Documentación en español: `README.es.md`
