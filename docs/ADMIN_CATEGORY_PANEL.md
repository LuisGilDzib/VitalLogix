# Panel de Administración de Categorías

## ✅ Estado: IMPLEMENTADO Y VALIDADO EN ENTORNO LOCAL

Resumen funcional:
- ✅ Solo admins pueden crear categorías personalizadas
- ✅ Solo admins pueden aprobar/rechazar categorías nuevas
- ✅ Solo admins pueden editar o desactivar categorías
- ✅ Sistema de auditoría completo (quién creó, quién aprobó, cuándo)

---

## 🏗️ Arquitectura Implementada

### Backend (6 archivos Java)

1. **Entity: Category.java**
   - Campos: id, name, description, status, type, timestamps, audit info
   - Estados: ACTIVE, INACTIVE, PENDING_APPROVAL
   - Tipos: PREDEFINED, CUSTOM
   - Auditoría: createdBy, approvedBy, aprobatedAt

2. **Repository: CategoryRepository.java**
   - Métodos especializados para buscar por estado/tipo
   - Queries para categorías pendientes
   - Búsqueda case-insensitive

3. **Service: CategoryService.java**
   - `getActiveCategories()` - categorías disponibles
   - `createCustomCategory(name, userId)` - crea con PENDING_APPROVAL
   - `approveCategory(id, admin)` - aprueba y activa
   - `rejectCategory(id)` - elimina categoría pendiente
   - `updateCategory(id, name, desc)` - edita cualquier categoría
   - `deactivateCategory(id)` - desactiva sin eliminar

4. **Controller: CategoryController.java**
   - 12 endpoints REST
   - GET: /active, /predefined, /custom, /pending, /{id}, /
   - POST: /custom, /predefined
   - PUT: /{id}, /{id}/approve, /{id}/deactivate
   - DELETE: /{id}/reject

5. **DTOs**
   - `CategoryRequest.java` - para crear/actualizar
   - `CategoryResponse.java` - para listar/detallar

### Frontend (2 archivos React + ajustes)

1. **Component: CategoryManagementPanel.jsx**
   - Panel con dos tabs: "Todas" y "Pendientes"
   - Listar, editar, aprobar, rechazar categorías
   - Información de auditoría en cada categoría
   - Sincronización en tiempo real con backend

2. **Integration: App.jsx changes**
   - Import de CategoryManagementPanel y createCustomCategory
   - Nuevo botón en navbar: "📂 Categorías" (solo admin)
   - Nueva ruta de vista: `view === 'categories'`

3. **API Service: api.js**
   - 8 nuevas funciones para categorías
   - Integración con endpoints del backend

---

## 📊 Flujo Completo

### Crear Producto con Categoría Custom

```
1. Admin → "Nuevo Producto"
   ↓
2. Selecciona dropdown categoría
   ├─ Opción A: Selecciona "Analgésicos" (predefinida)
   └─ Opción B: Selecciona "--- Otra (especificar) ---"
   ↓
3. Si seleccionó "Otra":
   - Campo de texto aparece
   - Escribe "Electrolitos"
   ↓
4. Click "Guardar"
   ↓
5. Backend:
   - Crea Product con category="Electrolitos"
   - Crea Category con status=PENDING_APPROVAL
   ↓
6. Nueva categoría está en "Pendientes de Aprobación"
   ↓
7. Admin → Tab "📂 Categorías"
   ↓
8. Revisa tab "Pendientes", ve "Electrolitos"
   ↓
9. Elige: ✅ Aprobar o ❌ Rechazar
   ↓
10. Si Aprobar:
    - Status cambia a ACTIVE
    - Aparece en dropdown para futuros productos
    - Otros admins pueden ver que lo aprobó y cuándo
```

---

## 🔐 Permisos (Admin Only)

| Acción | Permiso |
|--------|---------|
| Crear categoría custom | Admin |
| Crear categoría predefinida | Admin |
| Ver todas las categorías | Admin |
| Ver categorías pendientes | Admin |
| Aprobar categoría | Admin |
| Rechazar categoría | Admin |
| Editar categoría | Admin |
| Desactivar categoría | Admin |
| Listar categorías activas (dropdown) | Cualquiera |

---

## 📁 Archivos Relevantes

**Backend**:
```
backend/src/main/java/com/vitallogix/backend/model/Category.java
backend/src/main/java/com/vitallogix/backend/repository/CategoryRepository.java
backend/src/main/java/com/vitallogix/backend/service/CategoryService.java
backend/src/main/java/com/vitallogix/backend/controller/CategoryController.java
backend/src/main/java/com/vitallogix/backend/dto/CategoryRequest.java
backend/src/main/java/com/vitallogix/backend/dto/CategoryResponse.java
```

**Frontend**:
```
frontend/src/components/CategoryManagementPanel.jsx
frontend/src/services/api.js
frontend/src/App.jsx
```

**Documentación**:
```
docs/CATEGORY_MANAGEMENT_SYSTEM.md
docs/ADMIN_CATEGORY_PANEL.md
```

---

## 🧪 Cómo Probar

### 1. Crear Categoría Custom
```
1. Iniciar sesión como ADMIN
2. Ir a "🛒 Ventas" (inventario)
3. Click "➕ Nuevo Producto"
4. Llenar: Nombre, Descripción, Stock, Precio, Expiración
5. Categoría:
   - Seleccionar "--- Otra (especificar) ---"
   - Campo de texto: escribir "Electrolitos"
6. Click "Guardar"
```

### 2. Revisar en Panel
```
1. Click en tab "📂 Categorías"
2. Click en tab "Pendientes"
3. Ver "Electrolitos" con status "PENDING_APPROVAL"
4. Botones: "✅ Aprobar" y "❌ Rechazar"
```

### 3. Aprobar Categoría
```
1. Click "✅ Aprobar"
2. Mensaje: "Categoría aprobada correctamente"
3. Volver a "Todas"
4. Ver "Electrolitos" con status "ACTIVE"
```

### 4. Usar Categoría en Futuro
```
1. Crear nuevo producto
2. Dropdown de categorías → "Electrolitos" aparece en lista
3. Puede seleccionar directamente sin necesidad de "Otra"
```

---

## 📦 Base de Datos

Migration SQL para crear tabla (si usas Flyway/Liquibase):

```sql
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_created_by (created_by)
);
```

