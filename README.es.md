# VitalLogix

Sistema de gestión de farmacia construido por nuestro equipo con Java, PostgreSQL y React.

## Navegación

- [English](README.md)
- [Español](README.es.md)
- [Índice de documentación](docs/README.md)

## Enlaces Rápidos

- [Backend](backend/)
- [Frontend](frontend/)
- Módulo desktop: reservado para trabajo futuro, actualmente vacío.
- [Documentación](docs/)

## Descripción General

VitalLogix cubre inventario, ventas, clientes, reportes y gestión de categorías en un flujo web.

## ¿Quieres entender cómo funciona este proyecto?

Si eres estudiante, junior o simplemente tienes curiosidad sobre la arquitectura de **VitalLogix**,
preparamos una guía simplificada y sin tecnicismos innecesarios:

👉**[Lee la guía paso a paso: COMO-FUNCIONA.md](COMO-FUNCIONA.md)**

En este archivo explicamos de forma clara cómo se comunica PostgreSQL con el servidor en Java
y cómo esa información llega al frontend en React.

También lo utilizamos como bitácora visual para documentar la evolución del proyecto con capturas de interfaz,
y compartimos nuestra experiencia como equipo desarrollador en este viaje de aprendizaje y crecimiento.

## Mapa del Repositorio

- [backend/](backend/) API Spring Boot, modelo de dominio y servicios
- [frontend/](frontend/) Interfaz React para inventario, ventas y administración
- [desktop/](desktop/) Módulo desktop: reservado para trabajo futuro, actualmente vacío.
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


## Requisitos del Proyecto

Consulta los requisitos funcionales y no funcionales aquí: [docs/REQUISITOS.md](docs/REQUISITOS.md)


## Evidencias SOLID (mínimo 3 principios)

Para un análisis completo de la arquitectura del backend incluyendo **5 principios SOLID**, **7 patrones de diseño** y evidencia específica de código, consulta:
- [Principios SOLID y Patrones de Diseño (Español)](docs/SOLID_Y_PATRONES_DISEÑO.md)

### SRP: Single Responsibility Principle

- `App.jsx` delega la gestión de clientes en un panel especializado para reducir responsabilidades del componente raíz.
- `CustomerManagementPanel.jsx` concentra carga de clientes e historial de compras en un solo módulo de UI.
- Evidencia: [frontend/src/App.jsx](frontend/src/App.jsx), [frontend/src/components/CustomerManagementPanel.jsx](frontend/src/components/CustomerManagementPanel.jsx)

### DIP: Dependency Inversion Principle

- `ReportController` depende de la abstracción `ReportServicePort` en lugar de depender de una implementación concreta.
- `ReportService` implementa esa interfaz y encapsula la lógica de reportes.
- Evidencia: [backend/src/main/java/com/vitallogix/backend/controller/ReportController.java](backend/src/main/java/com/vitallogix/backend/controller/ReportController.java), [backend/src/main/java/com/vitallogix/backend/service/ReportServicePort.java](backend/src/main/java/com/vitallogix/backend/service/ReportServicePort.java), [backend/src/main/java/com/vitallogix/backend/service/ReportService.java](backend/src/main/java/com/vitallogix/backend/service/ReportService.java)

### OCP: Open/Closed Principle

- El motor de sugerencias usa parámetros de configuración (`app.suggestion.*`) para extender comportamiento sin cambiar el flujo principal del algoritmo bandido.
- Evidencia: [backend/src/main/java/com/vitallogix/backend/service/ComboSuggestionService.java](backend/src/main/java/com/vitallogix/backend/service/ComboSuggestionService.java)

## Matriz de Acceso por Rol

- **Invitado**: puede consultar productos y categorías activas; no puede generar ventas ni administrar datos.
- **Usuario**: puede operar ventas; no puede administrar productos, reportes ni módulos administrativos.
- **Admin**: acceso completo a productos, reportes, clientes, historial y categorías (incluyendo aprobaciones).


## Guía de Ejecución

Consulta la guía de ejecución y primeros pasos aquí: [docs/EJECUCION.md](docs/EJECUCION.md)

## Puntos de Entrada Importantes

- [SecurityConfig.java](backend/src/main/java/com/vitallogix/backend/config/SecurityConfig.java)
- [CategoryService.java](backend/src/main/java/com/vitallogix/backend/service/CategoryService.java)
- [CategoryManagementPanel.jsx](frontend/src/components/CategoryManagementPanel.jsx)
- [api.js](frontend/src/services/api.js)

## Documentación

Guía local para compartir este proyecto con una configuración gratuita y local:

- [Guía local para compartir demo gratis (Español)](docs/LOCAL_DEMO_SHARE_GUIDE_ES.txt)
- [Índice de documentación](docs/README.md)

### Diagramas en Astah

- [Diagrama de casos de uso VitalLogix](docs/diagrams/UseCase%20VitalLogix.asta)
- [Diagrama de clases VitalLogix](docs/diagrams/ClassDiagramN1.asta)
- [Diagrama de Secuencia VitalLogix](docs/diagrams/SequenceDiagram%20Vitalogix.asta)
- [Diagrama de actividad VitalLogix](docs/diagrams/Activity%20VitalLogix.asta.asta)
- [Diagrama completo modelo VitalLogix](docs/diagrams/VitalLogixModelComplete.asta)

### Notas del sistema

- [Notas del sistema de categorías](docs/CATEGORY_MANAGEMENT_SYSTEM.md)
- [Notas del panel de administración de categorías](docs/ADMIN_CATEGORY_PANEL.md)

## Pruebas de Usuario

Los siguientes videos documentan sesiones de prueba con usuarios reales que interactuaron con VitalLogix por primera vez.

| Usuario | Video |
|---------|-------|
| Carlos  | [Ver en YouTube](https://youtu.be/mTcv21Tw1-U) |
| Angel   | [Ver en YouTube](https://youtu.be/wkb87cYDUb8) |
| Miguel  | [Ver en YouTube](https://youtu.be/jwPQBVEvp28) |
| Victor  | [Ver en YouTube](https://youtu.be/8JpEPgOG5L8) |
| Yupid   | [Ver en YouTube](https://youtu.be/keX_k4XNqZc) |
