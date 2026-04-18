# Principios SOLID y Patrones de Diseño en VitalLogix Backend

## Inicio

El backend de nuestro proyecto implementa **5 principios SOLID** y **6 patrones de diseño** siguiendo lo aprendido en clases de diseño de software y el libro **Head First Design Patterns**.

---

## EVIDENCIA DE PRINCIPIOS SOLID

### 1. SRP - Principio de Responsabilidad Única

**Definición**: Cada clase debe tener una única razón para cambiar.

#### Ejemplos de Implementación

**CategoryService** - Responsabilidad única: lógica de negocio de categorías
```java
// backend/src/main/java/com/vitallogix/backend/service/CategoryService.java
@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public List<Category> getActiveCategories() { ... }
    public Category createPredefinedCategory(String name, String description) { ... }
    public Category approveCategory(Long id, String approvedBy) { ... }
    // Solo maneja operaciones de categorías
}
```

**CategoryController** - Responsabilidad única: enrutamiento HTTP para categorías
```java
// backend/src/main/java/com/vitallogix/backend/controller/CategoryController.java
@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService categoryService; // Delega al servicio
    
    @GetMapping("/active")
    public ResponseEntity<List<CategoryResponse>> getActiveCategories() { ... }
    // Solo maneja peticiones/respuestas HTTP
}
```

**CategoryRepository** - Responsabilidad única: queries a base de datos
```java
// backend/src/main/java/com/vitallogix/backend/repository/CategoryRepository.java
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByNameIgnoreCase(String name);
    List<Category> findByStatusOrderByNameAsc(Category.StatusEnum status);
    // Solo maneja acceso a datos
}
```

**Otros ejemplos SRP**:
- `ReportService`: Solo genera reportes
- `SaleService`: Solo gestiona transacciones de ventas
- `ComboSuggestionService`: Solo calcula recomendaciones
- `JwtService`: Solo maneja tokens JWT

**Impacto**: Los cambios en la lógica de categorías no afectan controladores ni repositorios.

---

### 2. DIP - Principio de Inversión de Dependencias

**Definición**: Depender de abstracciones, no de implementaciones concretas.

#### Implementación: Módulo de Reportes

**Capa de Abstracción** (Interfaz)
```java
// backend/src/main/java/com/vitallogix/backend/service/ReportServicePort.java
public interface ReportServicePort {
    List<ReportResponse.SaleReport> getSalesReport(LocalDate from, LocalDate to);
    List<ReportResponse.InventoryReport> getInventoryReport();
}
```

**Controlador depende de abstracción** (NO de clase concreta)
```java
// backend/src/main/java/com/vitallogix/backend/controller/ReportController.java
@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportServicePort reportService; // ← Depende de la interfaz
    
    public ReportController(ReportServicePort reportService) {
        this.reportService = reportService;
    }
    
    @GetMapping("/sales")
    public List<ReportResponse.SaleReport> salesReport(...) {
        return reportService.getSalesReport(from, to); // Llama al método de interfaz
    }
}
```

**Implementación Concreta** (Puede ser reemplazada)
```java
// backend/src/main/java/com/vitallogix/backend/service/ReportService.java
@Service
public class ReportService implements ReportServicePort {
    private final SaleRepository saleRepository;
    
    @Override
    public List<ReportResponse.SaleReport> getSalesReport(LocalDate from, LocalDate to) {
        // Detalles de implementación
    }
}
```

**Beneficio**: Se puede reemplazar `ReportService` con `AdvancedReportService` sin cambiar `ReportController`.

#### Inyección de Dependencias de Spring
```java
// Todos los servicios usan inyección por constructor
@Service
public class SaleService {
    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    
    // Spring inyecta dependencias automáticamente
    public SaleService(SaleRepository sr, ProductRepository pr, CustomerRepository cr) {
        this.saleRepository = sr;
        this.productRepository = pr;
        this.customerRepository = cr;
    }
}
```

---

### 3. OCP - Principio de Abierto/Cerrado

**Definición**: Abierto para extensión, cerrado para modificación.

#### Implementación: Parámetros configurables del motor de sugerencias

**Diseño actual** - Configuración externa (extensible sin modificar código de flujo)
```java
// backend/src/main/java/com/vitallogix/backend/service/ComboSuggestionService.java
@Service
public class ComboSuggestionService {
    @Value("${app.suggestion.exploration-weight:0.65}")
    private double explorationWeight;

    @Value("${app.suggestion.max-recommendations:6}")
    private int defaultMaxRecommendations;

    private double banditScore(BanditCandidate candidate, int totalPulls) {
        double exploration = Math.sqrt(Math.log(totalPulls + 1.0) / (candidate.pulls() + 1.0));
        return candidate.expectedReward() + (explorationWeight * exploration);
    }
}
```

**Beneficios**:
- Cambiar exploración/recomendaciones máximas sin modificar clases Java
- Mismo flujo de ejecución con comportamiento configurable por entorno
- Menor riesgo de regresiones al ajustar parámetros
- El algoritmo permanece cerrado para modificación de flujo

**Ejemplo de Extensión Futura**:
```java
// Nuevo ajuste por entorno sin cambiar código
app.suggestion.exploration-weight=0.75
app.suggestion.max-recommendations=8
```

---

### 4. LSP - Principio de Sustitución de Liskov

**Definición**: Las subclases deben ser sustituibles por sus clases base.

Todos los repositorios implementan correctamente el contrato de `JpaRepository`:
```java
public interface ProductRepository extends JpaRepository<Product, Long> { }
public interface CategoryRepository extends JpaRepository<Category, Long> { }
public interface SaleRepository extends JpaRepository<Sale, Long> { }
```

---

### 5. ISP - Principio de Segregación de Interfaces

**Definición**: Los clientes no deben depender de interfaces que no usan.

```java
// ReportServicePort define solo los métodos necesarios
public interface ReportServicePort {
    List<ReportResponse.SaleReport> getSalesReport(LocalDate from, LocalDate to);
    List<ReportResponse.InventoryReport> getInventoryReport();
    // No incluye métodos innecesarios
}
```

---

## EVIDENCIA DE PATRONES DE DISEÑO

### 1. Patrón Repository

**Propósito**: Abstraer la capa de acceso a datos de la lógica de negocio.

**Implementación**:
```java
// Interfaces de repositorio especializadas
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContainingIgnoreCase(String name);
    Optional<Product> findByCodeIgnoreCase(String code);
    List<Product> findByStockGreaterThan(Integer stock);
}

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByNameIgnoreCase(String name);
    List<Category> findByStatusOrderByNameAsc(Category.StatusEnum status);
}
```

**Beneficios**:
- Lógica de queries centralizada
- Fácil de testear (se pueden mockear repositorios)
- Cambiar base de datos sin afectar lógica de negocio
- Spring Data JPA genera la implementación automáticamente

---

### 2. Patrón DTO (Objeto de Transferencia de Datos)

**Propósito**: Separar modelos internos de contratos de API.

```java
// DTO de entrada: lo que envía el cliente
public class ProductRequest {
    @NotBlank private String name;
    @NotNull private BigDecimal price;
    @Min(0) private Integer stock;
}

// Entidad JPA: lo que almacena la BD
@Entity
public class Product {
    @Id @GeneratedValue
    private Long id;
    private String name;
    private BigDecimal price;
    private Integer stock;
    private LocalDateTime createdAt;
}

// DTO de salida: lo que devuelve la API
public class ProductResponse {
    private Long id;
    private String name;
    private BigDecimal price;
    private Integer stock;
    private LocalDateTime createdAt;
    private String category;
    private boolean visibleInSuggestions;
}
```

**Beneficios**:
- Contrato API independiente del esquema BD
- Validación en límite de API
- Seguridad mejorada (exponer solo campos necesarios)

---

### 3. Patrón Service + Inyección de Dependencias

**Propósito**: Centralizar lógica de negocio; manejar dependencias automáticamente.

```java
@Service
public class SaleService {
    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    
    // Inyección por constructor (Spring inyecta automáticamente)
    public SaleService(
        SaleRepository saleRepository,
        ProductRepository productRepository,
        CustomerRepository customerRepository
    ) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
    }
    
    @Transactional
    public Sale createSale(SaleRequest request) {
        // Lógica de negocio usando dependencias inyectadas
    }
}
```

---

### 4. Patrón Singleton

**Propósito**: Una sola instancia del servicio en tiempo de vida de la aplicación.

```java
@Service
public class ComboSuggestionService {
    // Spring crea UNA sola instancia para toda la aplicación
    // TODOS los endpoints comparten la misma instancia
}

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Spring crea UNA sola instancia para toda la aplicación
}
```

**Beneficios**:
- Eficiente en memoria (una instancia)
- Thread-safe (Spring maneja sincronización)
- Bueno para servicios sin estado

---

### 5. Patrón Observer/Lifecycle (JPA)

**Propósito**: Reaccionar a eventos de ciclo de vida de entidades automáticamente.

```java
@Entity
@Table(name = "categories")
public class Category {
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime updatedAt;
    
    // Callback: Antes de la primera persistencia
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Callback: Antes de actualización
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
```

**Comportamiento Automático**:
```
new Category("Vitaminas")
    ↓ Repository.save()
    ↓ @PrePersist se dispara automáticamente
    ↓ createdAt = ahora(), updatedAt = ahora()
    ↓ Se guarda en BD con timestamps
```

**Beneficios**:
- Sin gestión manual de timestamps
- Auditoría consistente
- Declarativo (no imperativo)
- Automático en todas las operaciones de guardado

---

### 6. Patrón Builder (Implícito en DTOs)

Los DTOs con múltiples campos son construidos mediante setters en los controladores, lo que permite construcción flexible de objetos.

---

## Tabla con resumen.

| Principio SOLID | Implementado | Archivo de Evidencia |
|---|---|---|
| SRP |  Sí | CategoryService, CategoryController, CategoryRepository |
| DIP |  Sí | ReportServicePort, ReportController, ReportService |
| OCP |  Sí | ComboSuggestionService (`app.suggestion.*`) |
| LSP |  Sí | Todos los repositorios implementan contrato JpaRepository |
| ISP |  Sí | ReportServicePort define interfaz minimalista |

| Patrón de Diseño | Implementado | Archivos de Evidencia |
|---|---|---|
| Repository | Sí | ProductRepository, CategoryRepository, SaleRepository, CustomerRepository |
| DTO | Sí | ProductRequest, ProductResponse, CategoryRequest, SaleRequest |
| Service | Sí | CategoryService, SaleService, ReportService |
| Inyección de Dependencias | Sí | Todos los servicios usan inyección por constructor |
| Singleton | Sí | Spring @Service beans |
| Observer/Lifecycle | Sí | Category (@PrePersist, @PreUpdate) |

---

## Métricas de Calidad

- **Testabilidad**: Alta (gracias a DI y abstracción de servicios)
- **Mantenibilidad**: Alta (SRP aplicado en todas las capas)
- **Extensibilidad**: Alta (OCP visible en parámetros configurables)
- **Acoplamiento**: Bajo (DIP reduce dependencias)
- **Cohesión**: Alta (cada clase tiene propósito claro)

---

## Conclusión

Nuestro backend del proyecto VitalLogix demuestra el uso de los principios SOLID y patrones de diseño.

