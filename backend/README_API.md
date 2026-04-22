# Guía de la API de VitalLogix

Esta es una guía rápida para entender cómo interactuar con los diferentes módulos de la API del backend de VitalLogix. Todos los endpoints reciben y devuelven información en formato JSON.

## Inventario y Productos

La gestión de productos está diseñada para permitir desde la simple lectura hasta el control detallado del stock.
- Puedes obtener la lista completa de productos o los detalles de uno en específico haciendo peticiones a `/api/products`.
- Para buscar productos por nombre, código o categoría, puedes usar la búsqueda avanzada en `/api/products/search`.
- Los administradores pueden crear, editar o eliminar productos en la misma ruta. Además, existe una ruta específica (`/api/products/{id}/stock`) para ajustar rápidamente la cantidad disponible de un producto sin tener que modificar todo su perfil.

## Categorías

Para organizar el inventario, la API ofrece un sistema de gestión de categorías.
- Cualquiera puede listar las categorías que están activas consultando `/api/categories/active`, lo cual es útil para llenar listas o menús en la interfaz de usuario.
- Los administradores pueden consultar todas las categorías, incluyendo las que están esperando revisión en `/api/categories/pending`.
- Además, los administradores tienen la capacidad de crear nuevas categorías, editarlas, desactivarlas o aprobar y rechazar aquellas que hayan sido creadas desde el formulario de productos.

## Clientes y Fidelización

El sistema maneja un directorio de clientes y un programa de lealtad conocido como Cliente Amigo.
- Puedes consultar la lista de clientes o crear perfiles nuevos a través de `/api/customers`. Para ver qué ha comprado un cliente específico, el sistema provee una ruta dedicada para obtener su historial de compras completo.
- En cuanto al programa de lealtad, puedes validar códigos en `/api/customers/validate-clienteamigo`, y utilizar las rutas en `/api/fidelity` para otorgarle o quitarle a un cliente sus beneficios de lealtad.

## Ventas y Recibos

El flujo principal de ventas permite registrar compras anónimas o asociarlas a un cliente existente.
- Al registrar una venta nueva en `/api/sales`, solo necesitas enviar la lista de los productos y la cantidad. Si incluyes el identificador de un cliente y este resulta tener beneficios de Cliente Amigo, el sistema se encargará de calcular y aplicar los descuentos automáticamente.
- Puedes listar todas las ventas realizadas, o bien, pedir el recibo detallado de una venta particular en `/api/receipts/{saleId}`, el cual incluirá el desglose de los artículos, información del cliente y el monto final ya con descuentos aplicados.

## Reportes

Para ayudar en la toma de decisiones, el backend puede generar reportes sobre el estado actual del negocio.
- Se pueden obtener todas las ventas generadas dentro de un rango de fechas utilizando `/api/reports/sales`.
- También se puede consultar el estatus general del inventario en `/api/reports/inventory`.

---

Nota de seguridad: Recuerda que todas las acciones que modifican datos (como la creación o eliminación de productos y clientes) y las consultas de reportes, están pensadas para ser ejecutadas por administradores. Las interfaces de usuario que se conecten a esta API deben asegurarse de proteger estos accesos.
