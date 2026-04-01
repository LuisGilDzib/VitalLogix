# Sistema de Gestión de Categorías

## 📋 Descripción General

El sistema de categorías permite a los administradores gestionar las categorías de productos de forma centralizada. Las categorías pueden ser:
- **Predefinidas**: Categorías base del sistema (no pueden ser eliminadas)
- **Custom**: Categorías creadas por admins desde el formulario de productos (requieren aprobación)

## 🔄 Flujo de Categorías

### Categorías Predefinidas
```
PREDEFINED + ACTIVE → Disponibles inmediatamente en el dropdown de productos
```

Las siguiente categorías predefinidas están disponibles:
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

### Categorías Custom
```
Admin selecciona "Otra (especificar)" 
        ↓
Escribe nuevo nombre (ej: Electrolitos)
        ↓
Producto se guarda
        ↓
Nueva categoría = CUSTOM + PENDING_APPROVAL
        ↓
Admin revisa en panel "Pendientes"
        ↓
Aprobar → CUSTOM + ACTIVE (disponible en dropdown)
Rechazar → Se elimina
```

## 🛠️ Arquitectura

### Backend

#### Entity: Category
**Ubicación**: `com.vitallogix.backend.model.Category`

**Campos**:
- `id` (Long): ID único
- `name` (String, unique): Nombre de la categoría
- `description` (String, nullable): Descripción
- `status` (enum): ACTIVE | INACTIVE | PENDING_APPROVAL
- `type` (enum): PREDEFINED | CUSTOM
- `createdAt` (LocalDateTime): Fecha de creación
- `updatedAt` (LocalDateTime): Última actualización
- `createdBy` (String): Usuario que creó
- `approvedBy` (String, nullable): Admin que aprobó
- `approvedAt` (LocalDateTime, nullable): Fecha de aprobación

#### Repository & Service
- **CategoryRepository** (`com.vitallogix.backend.repository`): Queries a base de datos
- **CategoryService** (`com.vitallogix.backend.service`): Lógica de negocio
  - `getActiveCategories()`: Categorías activas
  - `getPendingApprovals()`: Pendientes de aprobación
  - `createCustomCategory(name, createdBy)`: Crea categoría custom
  - `approveCategory(id, approvedBy)`: Aprueba categoría
  - `rejectCategory(id)`: Rechaza (elimina) categoría
  - `updateCategory(id, name, description)`: Actualiza
  - `deactivateCategory(id)`: Desactiva (no la elimina)

#### Controller: CategoryController
**Ubicación**: `com.vitallogix.backend.controller`
**Base URL**: `/api/categories`

**Endpoints**:

| Endpoint | Método | Descripción | Requiere Admin |
|----------|--------|-------------|---|
| `/categories/active` | GET | Listar activas | No |
| `/categories/predefined` | GET | Listar predefinidas | No |
| `/categories/custom` | GET | Listar custom | No |
| `/categories/pending` | GET | Listar pendientes | Sí |
| `/categories` | GET | Todas (incluso inactivas) | Sí |
| `/categories/{id}` | GET | Por ID | No |
| `/categories/custom` | POST | Crear custom | Sí |
| `/categories/predefined` | POST | Crear predefinida | Sí (solo backend) |
| `/categories/{id}` | PUT | Actualizar | Sí |
| `/categories/{id}/approve` | PUT | Aprobar | Sí |
| `/categories/{id}/reject` | DELETE | Rechazar | Sí |
| `/categories/{id}/deactivate` | PUT | Desactivar | Sí |

### Frontend

#### API Service
**Ubicación**: `src/services/api.js`

```javascript
// Lectura
getActiveCategories()           // GET /categories/active
getPredefinedCategories()       // GET /categories/predefined
getCustomCategories()           // GET /categories/custom
getPendingCategories()          // GET /categories/pending
getAllCategories()              // GET /categories
getCategoryById(id)             // GET /categories/{id}

// Escritura
createCustomCategory(name, desc)        // POST /categories/custom
createPredefinedCategory(name, desc)    // POST /categories/predefined
updateCategory(id, name, desc)          // PUT /categories/{id}
approveCategory(id)                     // PUT /categories/{id}/approve
rejectCategory(id)                      // DELETE /categories/{id}/reject
deactivateCategory(id)                  // PUT /categories/{id}/deactivate
```

#### Componente: CategoryManagementPanel
**Ubicación**: `src/components/CategoryManagementPanel.jsx`

**Características**:
- Dos tabs: "Todas" y "Pendientes"
- Listar todas las categorías con información de auditoría
- Editar nombre y descripción (previa deactivación implícita)
- Aprobar/rechazar categorías custom pendientes
- Desactivar categorías existentes
- Visual feedback con badges de estado y tipo

#### Integración en App
- Tab en navbar: "📂 Categorías" (solo visible para admins)
- Renderiza `<CategoryManagementPanel />` cuando `view === 'categories'`

## 💾 Flujo de Persistencia

### Crear Producto con Categoría Custom

1. **Frontend**: Admin selecciona "--- Otra (especificar) ---" en modal de producto
2. **Frontend**: Escribe "Electrolitos" en campo de texto
3. **Frontend**: Al hacer submit, `handleSubmit()` detecta `category === 'OTHER'`
4. **Frontend**: Envía POST `/products` con `category: "Electrolitos"`
5. **Backend**: `ProductController` recibe y persiste
6. **Frontend (Opcional)**: Llamar `createCustomCategory("Electrolitos", userId)` para registrar como PENDING_APPROVAL
   - **O**: Backend automáticamente crea si no existe

### Estados de Transición

```
Predefinida:
PREDEFINED → ACTIVE → (editar) → ACTIVE
         ↓
         └→ INACTIVE (desactivar)

Custom:
(creada desde producto form)
         ↓
    CUSTOM + PENDING_APPROVAL
         ↓
    ┌────┴────┐
    ↓         ↓
ACTIVE    (rechazada)
           ↓
        Eliminada
```

## 🔐 Seguridad y Permisos

- **Crear categorías custom**: Solo admins (durante creación de productos)
- **Crear categorías predefinidas**: Solo admins (configuración inicial en backend)
- **Aprobar/Rechazar**: Solo admins
- **Editar**: Solo admins
- **Desactivar**: Solo admins
- **Listar activas**: Cualquier usuario (para dropdowns)
- **Listar todas/pendientes**: Solo admins

## 📊 Casos de Uso

### Caso 1: Admin crea producto con categoría "Electrolitos"
1. Admin → "Nuevo Producto"
2. Rellena datos, selecciona "--- Otra (especificar) ---"
3. Escribe "Electrolitos"
4. Click "Guardar"
5. Categoría "Electrolitos" queda en PENDING_APPROVAL
6. Admin → Tab "📂 Categorías"
7. Revisa "Pendientes", ve "Electrolitos"
8. Click "Aprobar"
9. "Electrolitos" ahora es ACTIVE y disponible en dropdown para futuros productos

### Caso 2: Admin rechaza una categoría
1. Similar al caso 1, pero en paso 8 hace click "Rechazar"
2. Categoría se elimina de base de datos
3. Los productos que usaban esa categoría mantienen el string original
4. (Opcional: migración de categoría para esos productos)

### Caso 3: Admin desactiva categoría
1. Admin va a "Categorías" → tab "Todas"
2. Busca "Vitaminas"
3. Click "Desactivar"
4. "Vitaminas" ahora es INACTIVE
5. No aparece en dropdown para nuevos productos
6. Productos existentes mantienen la referencia histórica

## 🚀 Mejoras Futuras

1. **Búsqueda en panel**: Filtrar categorías por nombre
2. **Caché**: Cachear categorías activas para mejor performance
3. **Bulk operations**: Aprobar múltiples categorías a la vez
4. **Historial**: Auditoría completa de cambios en categorías
5. **Migración de categorías**: Reasignar productos de una categoría a otra
6. **Jerarquía**: Subcategorías (ej: Analgésicos > Ibuprofeno)
7. **Plantillas**: Categorías con campos personalizados (ej: dosis, presentación)

---

**Última actualización**: Abril 2026
