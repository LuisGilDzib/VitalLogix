# VitalLogix

Pharmacy management platform built by our team with Java, PostgreSQL, and React.

## Navigation

- [English](README.md)
- [Español](README.es.md)
- [Documentation Index](docs/README.md)

## Quick Links

- [Backend](backend/)
- [Frontend](frontend/)
- Desktop module: reserved for future work, currently empty.
- [Documentation](docs/)

## Overview

VitalLogix covers inventory, sales, customers, reporting, and category management in a web-first workflow.

## Beginner-Friendly Architecture Guide

For Spanish-speaking beginners and non-technical readers, we provide a simplified architecture walkthrough:

- 👉 **[COMO-FUNCIONA.md](COMO-FUNCIONA.md)**

This guide explains the full data flow (React -> Spring Boot -> PostgreSQL) in plain language.

We also use it as a visual project journal (screenshots and timeline of the app evolution),
and we share our experience as a development team in this learning and growth journey.

## Repository Map

- [backend/](backend/) Spring Boot API, domain model, and services
- [frontend/](frontend/) React UI for inventory, sales, and administration
- [desktop/](desktop/) Desktop module: reserved for future work, currently empty.
- [docs/](docs/) Project documentation hub
- [backend/src/main/java/com/vitallogix/backend/controller/CategoryController.java](backend/src/main/java/com/vitallogix/backend/controller/CategoryController.java) category administration endpoints
- [frontend/src/components/CategoryManagementPanel.jsx](frontend/src/components/CategoryManagementPanel.jsx) admin category panel
- [frontend/src/App.jsx](frontend/src/App.jsx) main application shell and role-based views


## Project Requirements

See the functional and non-functional requirements here: [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)




## SOLID Evidence (at least 3 principles)

For a comprehensive backend architecture analysis including **5 SOLID principles**, **7 design patterns**, and specific code evidence, see:
- [SOLID & Design Patterns Documentation (English)](docs/SOLID_AND_DESIGN_PATTERNS.md)

### SRP: Single Responsibility Principle

- `App.jsx` delegates customer management to a dedicated panel instead of handling all customer UI logic directly.
- `CustomerManagementPanel.jsx` owns customer listing and purchase-history behavior in one focused component.
- Evidence: [frontend/src/App.jsx](frontend/src/App.jsx), [frontend/src/components/CustomerManagementPanel.jsx](frontend/src/components/CustomerManagementPanel.jsx)

### DIP: Dependency Inversion Principle

- `ReportController` depends on the `ReportServicePort` abstraction rather than a concrete reporting implementation.
- `ReportService` implements the interface and encapsulates report business logic.
- Evidence: [backend/src/main/java/com/vitallogix/backend/controller/ReportController.java](backend/src/main/java/com/vitallogix/backend/controller/ReportController.java), [backend/src/main/java/com/vitallogix/backend/service/ReportServicePort.java](backend/src/main/java/com/vitallogix/backend/service/ReportServicePort.java), [backend/src/main/java/com/vitallogix/backend/service/ReportService.java](backend/src/main/java/com/vitallogix/backend/service/ReportService.java)

### OCP: Open/Closed Principle

- The suggestion engine uses configuration parameters (`app.suggestion.*`) to extend behavior without changing the core bandit algorithm flow.
- Evidence: [backend/src/main/java/com/vitallogix/backend/service/ComboSuggestionService.java](backend/src/main/java/com/vitallogix/backend/service/ComboSuggestionService.java)

## Role Access Matrix

- **Guest**: can view products and active categories; cannot create sales or manage data.
- **User**: can create and consult sales operations; cannot manage products, reports, or admin modules.
- **Admin**: full access to products, reports, customers, history, and categories (including approvals).


## Execution Guide

See the execution guide and getting started here: [docs/EXECUTION.md](docs/EXECUTION.md)

## Important Entry Points

- [SecurityConfig.java](backend/src/main/java/com/vitallogix/backend/config/SecurityConfig.java)
- [CategoryService.java](backend/src/main/java/com/vitallogix/backend/service/CategoryService.java)
- [CategoryManagementPanel.jsx](frontend/src/components/CategoryManagementPanel.jsx)
- [api.js](frontend/src/services/api.js)

## Documentation

Local guide to run and share this project with a free local setup:

- [Documentation Index](docs/README.md)
- [Local free demo sharing guide (English)](docs/LOCAL_DEMO_SHARE_GUIDE_EN.txt)

### Astah Diagrams

- [VitalLogix Use Case Diagram](docs/diagrams/UseCase%20VitalLogix.asta)
- [VitalLogix Class Diagram](docs/diagrams/ClassDiagramN1.asta)
- [VitalLogix Sequence Diagram](docs/diagrams/SequenceDiagram%20Vitalogix.asta)
- [VitalLogix Activity Diagram](docs/diagrams/Activity%20VitalLogix.asta.asta)
- [VitalLogix Full Model Diagram](docs/diagrams/VitalLogixModelComplete.asta)

### System Notes

- [Category management notes](docs/CATEGORY_MANAGEMENT_SYSTEM.md)
- [Admin category panel notes](docs/ADMIN_CATEGORY_PANEL.md)

## User Testing

The following videos document real user testing sessions conducted with external testers who interacted with VitalLogix for the first time.

| Tester | Video |
|--------|-------|
| Carlos | [Watch on YouTube](https://youtu.be/mTcv21Tw1-U) |
| Angel  | [Watch on YouTube](https://youtu.be/wkb87cYDUb8) |
| Miguel | [Watch on YouTube](https://youtu.be/jwPQBVEvp28) |
| Victor | [Watch on YouTube](https://youtu.be/8JpEPgOG5L8) |
| Yupid  | [Watch on YouTube](https://youtu.be/keX_k4XNqZc) |
