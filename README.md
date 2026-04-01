# VitalLogix

Pharmacy management platform built with Java, PostgreSQL, and React.

## Navigation

- [English](README.md)
- [Español](README.es.md)
- [Documentation Index](docs/README.md)

## Quick Links

- [Backend](backend/)
- [Frontend](frontend/)
- Desktop module (planned)
- [Documentation](docs/)

## Overview

VitalLogix covers inventory, sales, customers, reporting, and category management in a web-first workflow.

## Beginner-Friendly Architecture Guide

For Spanish-speaking beginners and non-technical readers, we provide a simplified architecture walkthrough:

- [COMO-FUNCIONA.md](COMO-FUNCIONA.md)

This guide explains the full data flow (React -> Spring Boot -> PostgreSQL) in plain language.

It can also serve as a visual project journal (screenshots and timeline of the app evolution).

## Repository Map

- [backend/](backend/) Spring Boot API, domain model, and services
- [frontend/](frontend/) React UI for inventory, sales, and administration
- [desktop/](desktop/) desktop module placeholder (currently not implemented)
- [docs/](docs/) Project documentation hub
- [backend/src/main/java/com/vitallogix/backend/controller/CategoryController.java](backend/src/main/java/com/vitallogix/backend/controller/CategoryController.java) category administration endpoints
- [frontend/src/components/CategoryManagementPanel.jsx](frontend/src/components/CategoryManagementPanel.jsx) admin category panel
- [frontend/src/App.jsx](frontend/src/App.jsx) main application shell and role-based views

## Functional Requirements

### 1. Inventory Management

- The system must allow adding new products to inventory.
- The system must allow updating product stock levels.
- The system must record product expiration dates.
- The system must allow deleting obsolete or expired products.

### 2. Sales Recording

- The system must allow selling products to customers.
- The system must automatically calculate the total purchase amount.
- The system must record customer information for prescription sales, including name, address, and contact number.
- The system must generate a receipt for each sale.

### 3. Product Search and Query

- The system must allow quick product search by name, code, or category.
- The system must provide detailed product information, including price, stock, and expiration date.

### 4. Customer Management

- The system must allow creating and maintaining customer records.
- The system must provide information about a customer's previous purchases.
- The system must allow discounts or loyalty programs for repeat customers.
- The customer must have a `clienteamigo` number to access the discount program.

### 5. Reporting

- The system must generate daily, weekly, monthly, and yearly sales reports.
- The system must provide updated inventory reports.

### 6. Category Management

- The system includes a category management module with predefined and custom categories.
- Custom categories can be submitted and then approved or rejected.
- Active categories are available to product forms and filtering views.

## Non-Functional Requirements

### 1. Intuitive User Interface

- The interface must be simple, clear, and easy to use.
- Navigation should help users quickly identify inventory, sales, customer, and reporting actions.

## SOLID Evidence (at least 3 principles)

### SRP: Single Responsibility Principle

- `App.jsx` delegates customer management to a dedicated panel instead of handling all customer UI logic directly.
- `CustomerManagementPanel.jsx` owns customer listing and purchase-history behavior in one focused component.
- Evidence: [frontend/src/App.jsx](frontend/src/App.jsx), [frontend/src/components/CustomerManagementPanel.jsx](frontend/src/components/CustomerManagementPanel.jsx)

### DIP: Dependency Inversion Principle

- `ReportController` depends on the `ReportServicePort` abstraction rather than a concrete reporting implementation.
- `ReportService` implements the interface and encapsulates report business logic.
- Evidence: [backend/src/main/java/com/vitallogix/backend/controller/ReportController.java](backend/src/main/java/com/vitallogix/backend/controller/ReportController.java), [backend/src/main/java/com/vitallogix/backend/service/ReportServicePort.java](backend/src/main/java/com/vitallogix/backend/service/ReportServicePort.java), [backend/src/main/java/com/vitallogix/backend/service/ReportService.java](backend/src/main/java/com/vitallogix/backend/service/ReportService.java)

### OCP: Open/Closed Principle

- Recommendation stock bonus behavior is represented through `StockBonusRule` rules to allow extension without changing core scoring flow.
- Evidence: [backend/src/main/java/com/vitallogix/backend/service/ComboSuggestionService.java](backend/src/main/java/com/vitallogix/backend/service/ComboSuggestionService.java)

## Role Access Matrix

- Guest: can view products and active categories; cannot create sales or manage data.
- User: can create and consult sales operations; cannot manage products, reports, or admin modules.
- Admin: full access to products, reports, customers, history, and categories (including approvals).

## Getting Started

1. Start the database and backend:
	- `docker compose up -d --build vitallogix-app`
2. Start the frontend:
	- `npm --prefix frontend run dev`
3. Open the app in the browser and sign in with an admin or user account.

## Important Entry Points

- [SecurityConfig.java](backend/src/main/java/com/vitallogix/backend/config/SecurityConfig.java)
- [CategoryService.java](backend/src/main/java/com/vitallogix/backend/service/CategoryService.java)
- [CategoryManagementPanel.jsx](frontend/src/components/CategoryManagementPanel.jsx)
- [api.js](frontend/src/services/api.js)

## Documentation

- [Documentation Index](docs/README.md)
- [English docs landing page](docs/en/README.md)
- [Spanish docs landing page](docs/es/README.md)
- [Category management notes](docs/CATEGORY_MANAGEMENT_SYSTEM.md)
- [Admin category panel notes](docs/ADMIN_CATEGORY_PANEL.md)
