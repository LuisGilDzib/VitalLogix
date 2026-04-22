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

**SaleService** - Refactorizado para delegar cálculos de precios y efectos secundarios.
```java
// backend/src/main/java/com/vitallogix/backend/service/SaleService.java
@Service
public class SaleService {
    // Orquestación de la creación de ventas
    // Delega precios a PromotionStrategy (Patrón Strategy)
    // Delega acciones post-venta a SaleObserver (Patrón Observer)
    // SRP logrado: El servicio solo gestiona el flujo de la transacción.
}
```

**Impacto**: Los cambios en la lógica de promociones no afectan a `SaleService`.

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

#### Implementación: Estrategias de Promoción
El sistema utiliza el **Patrón Strategy** para manejar diferentes tipos de promociones (PERCENTAGE, BUY_X_PAY_Y).

**Cerrado para Modificación**: La lógica de `SaleService` para procesar una venta nunca cambia cuando se añade un nuevo tipo de promoción.
**Abierto para Extensión**: Se pueden añadir nuevos tipos de promoción implementando la interfaz `PromotionStrategy` y registrándolos en la `PromotionStrategyFactory`.

```java
// backend/src/main/java/com/vitallogix/backend/strategy/PromotionStrategy.java
public interface PromotionStrategy {
    BigDecimal calculateNet(...);
}

// backend/src/main/java/com/vitallogix/backend/strategy/BuyXPayYPromotionStrategy.java
public class BuyXPayYPromotionStrategy implements PromotionStrategy { ... }
```

**Beneficios**:
- La lógica específica del algoritmo está encapsulada.
- No hay declaraciones masivas de `if/else` o `switch` en el servicio principal.
- Fácil de testear unitariamente cada estrategia por separado.

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

**Propósito**: Garantizar que una clase tenga una única instancia en toda la aplicación y proporcionar un punto de acceso global a ella.

**Uso en el proyecto**:

**1. Implementación Clásica**:
En la clase `PromotionStrategyFactory` utilizamos el patrón Singleton puro (Eager Initialization), tal como se documenta en el libro Head First:
```java
public class PromotionStrategyFactory {
    // Instancia única inicializada tempranamente
    private static final PromotionStrategyFactory INSTANCE = new PromotionStrategyFactory();
    
    private final Map<String, PromotionStrategy> strategies = new HashMap<>();

    // Constructor privado
    private PromotionStrategyFactory() {
        strategies.put("PERCENTAGE", new PercentagePromotionStrategy());
        // ...
    }

    // Punto de acceso global
    public static PromotionStrategyFactory getInstance() {
        return INSTANCE;
    }
    // ...
}
```

**2. Singleton en Spring**:
Por defecto, Spring Boot ya gestiona los servicios (`@Service`) y repositorios (`@Repository`) como Singletons:
```java
@Service
public class ComboSuggestionService {
    // Spring crea UNA sola instancia para toda la aplicación
}
```

**Beneficios**:
- Control estricto sobre cómo y cuándo se accede a la instancia.
- Eficiente en memoria (una instancia).
- Buen rendimiento (en Eager initialization o mediante Spring).

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

### 6. Patrón Strategy (Favorito de Head First)

**Propósito**: Define una familia de algoritmos, encapsula cada uno y los hace intercambiables.

**Implementación**:
- `PromotionStrategy` (Interfaz)
- `PercentagePromotionStrategy`
- `BuyXPayYPromotionStrategy`
- `NoPromotionStrategy`

Utilizado en `SaleService` a través de `PromotionStrategyFactory.getInstance().getStrategy(tipo)`.

---

### 7. Patrón Observer (Favorito de Head First)

**Propósito**: Define una dependencia de uno a muchos entre objetos para que cuando un objeto cambie de estado, todos sus dependientes sean notificados y actualizados automáticamente.

**Implementación**:
- `SaleObserver` (Interfaz)
- `LoyaltyObserver` (Implementación)
- `SaleEventNotifier` (Sujeto)

**Flujo**:
1. `SaleService` completa una venta.
2. `SaleService` llama a `saleEventNotifier.notifyObservers(sale)`.
3. `LoyaltyObserver` recibe la notificación y actualiza los puntos de fidelidad y cupones del usuario.

---

### 8. Patrón Factory

**Propósito**: Define una interfaz para crear un objeto, pero deja que las subclases decidan qué clase instanciar.

**Implementación**:
- `PromotionStrategyFactory`: Devuelve la `PromotionStrategy` adecuada basada en el tipo de promoción.

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
| Singleton | Sí | Spring @Service beans, PromotionStrategyFactory |
| Observer | Sí | SaleObserver, LoyaltyObserver, SaleEventNotifier |
| Strategy | Sí | PromotionStrategy, PercentagePromotionStrategy, BuyXPayYPromotionStrategy |
| Factory | Sí | PromotionStrategyFactory |

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

