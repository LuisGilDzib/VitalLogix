# VitalLogix Backend API

## Endpoints principales

### Inventario de Productos
- `GET /api/products` — Listar productos (paginado)
- `GET /api/products/{id}` — Detalle de producto
- `POST /api/products` — Crear producto
- `PUT /api/products/{id}` — Editar producto
- `DELETE /api/products/{id}` — Eliminar producto
- `DELETE /api/products/expired` — Eliminar productos vencidos
- `GET /api/products/search?name=&id=&category=` — Buscar por nombre, código o categoría

### Clientes
- `GET /api/customers` — Listar clientes
- `GET /api/customers/{id}` — Detalle de cliente
- `POST /api/customers` — Crear cliente
- `PUT /api/customers/{id}` — Editar cliente
- `DELETE /api/customers/{id}` — Eliminar cliente
- `GET /api/customers/{id}/sales` — Historial de compras del cliente

### Ventas
- `POST /api/sales` — Registrar venta (requiere lista de productos y opcionalmente customerId)
- `GET /api/sales` — Listar ventas

### Recibos
- `GET /api/receipts/{saleId}` — Obtener recibo de venta (incluye detalle, cliente y descuento)

### Fidelización
- `POST /api/fidelity/assign/{id}` — Asignar cliente amigo
- `POST /api/fidelity/remove/{id}` — Quitar cliente amigo

### Reportes
- `GET /api/reports/sales?from=YYYY-MM-DD&to=YYYY-MM-DD` — Reporte de ventas por rango
- `GET /api/reports/inventory` — Reporte de inventario actualizado

## Estructura de datos (DTOs)

### ProductRequest
```json
{
  "name": "string",
  "description": "string",
  "category": "string",
  "price": 0,
  "stock": 0,
  "expirationDate": "2026-12-31T00:00:00"
}
```

### ProductResponse
```json
{
  "id": 1,
  "name": "string",
  "description": "string",
  "category": "string",
  "price": 0,
  "stock": 0,
  "createdAt": "2026-03-31T00:00:00",
  "expirationDate": "2026-12-31T00:00:00"
}
```

### CustomerRequest
```json
{
  "name": "string",
  "address": "string",
  "phone": "string",
  "friend": false
}
```

### SaleRequest
```json
{
  "items": [
    { "productId": 1, "quantity": 2 }
  ],
  "customerId": 1
}
```

### ReceiptResponse
Incluye: saleId, saleDate, customer info, items, totalAmount, discount, finalAmount.

### ReportResponse
Incluye: lista de ventas agrupadas por fecha y reporte de inventario.

---

## Notas
- Todos los endpoints devuelven JSON.
- Los endpoints de administración (crear, editar, eliminar productos/clientes) deben ser protegidos en frontend para solo ser accesibles por el administrador.
- El endpoint de ventas permite ventas anónimas (sin cliente) o asociadas a un cliente.
- El descuento de cliente amigo se aplica automáticamente en el recibo.

---
