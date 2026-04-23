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

## Functional Requirements

### 1. Inventory Management

- Our system must allow adding new products to inventory.
- We must allow updating product stock levels.
- We must record product expiration dates.
- We must allow deleting obsolete or expired products.

### 2. Sales Recording

- Our system must allow selling products to customers.
- We must automatically calculate the total purchase amount.
- We must record customer information for prescription sales, including name, address, and contact number.
- We must generate a receipt for each sale.

### 3. Product Search and Query

- We must allow quick product search by name, code, or category.
- We must provide detailed product information, including price, stock, and expiration date.

### 4. Customer Management

- We must allow creating and maintaining customer records.
- We must provide information about a customer's previous purchases.
- We must allow discounts or loyalty programs for repeat customers.
- Our customers must have a `clienteamigo` number to access our discount program.

### 5. Reporting

- We must generate daily, weekly, monthly, and yearly sales reports.
- We must provide updated inventory reports.

### 6. Category Management

- Our system includes a category management module with predefined and custom categories.
- We allow custom categories to be submitted and then approved or rejected.
- Active categories are available to product forms and filtering views.

## Non-Functional Requirements

### 1. Intuitive User Interface

- Our interface must be simple, clear, and easy to use.
- Our system should help users quickly identify inventory, sales, customer, and reporting actions.

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

## Clone The Repository

1. Clone the full project:
	- `git clone https://github.com/diancie/VitalLogix.git`
2. Enter the project root folder:
	- `cd VitalLogix`

## Getting Started

Before running with Docker, create your local environment file:

1. Copy `.env.example` to `.env`
2. Replace all `change_me_*` values with your own secrets

This step allows each developer to set custom test credentials.
In your `.env`, you can define:

- Initial admin username: `APP_BOOTSTRAP_ADMIN_USERNAME`
- Initial admin password: `APP_BOOTSTRAP_ADMIN_PASSWORD`
- Demo user username: `APP_BOOTSTRAP_DEMO_USER_USERNAME`
- Demo user password: `APP_BOOTSTRAP_DEMO_USER_PASSWORD`

Quick example:

```env
APP_BOOTSTRAP_ADMIN_USERNAME=admin_lab
APP_BOOTSTRAP_ADMIN_PASSWORD=MySecureAdminPassword123
APP_BOOTSTRAP_DEMO_USER_USERNAME=test_user
APP_BOOTSTRAP_DEMO_USER_PASSWORD=MySecureUserPassword123
```

The `.env` file is ignored by git and should never be committed.

1. Open a terminal and go to the project folder:
	- `cd VitalLogix`
2. Start the database and backend:
	- `docker compose up -d --build vitallogix-app`
3. Open a second terminal and go back to the project folder:
	- `cd VitalLogix`
4. Start the frontend:
	- `npm --prefix frontend run dev`
5. Open the app in your browser:

	When the command finishes, you will see a message similar to this:

	![terminal for opening the app](./img/irWeb.png)

	Then open the link shown in the terminal:

	- On macOS: hold Command (⌘) and click the link.
	- On Windows/Linux: hold Ctrl and click the link.
	- Manually: copy the address shown after `Local:` and paste it into your browser.

	> **Tip:** Vite usually uses port `5173`. If it is busy, it will automatically assign another one, such as `5174`.
	> Always use the port shown in your terminal.

## Run Without Docker

If you prefer not to use Docker, you can run the project fully local.

Prerequisites:
- Java 21
- Maven (or use the Maven Wrapper included in this repo)
- PostgreSQL 16
- Node.js 18+ and npm

1. Create the database and credentials in PostgreSQL:
	- Database: `vitallogix`
	- User: `vitallogix`
	- Password: `vitallogix123`
2. Start backend from the repository root:
	- macOS/Linux: `./backend/mvnw -f backend/pom.xml spring-boot:run`
	- Windows: `backend\\mvnw.cmd -f backend\\pom.xml spring-boot:run`
3. Start frontend in a second terminal from the repository root:
	- `npm --prefix frontend install`
	- `npm --prefix frontend run dev`

If your local PostgreSQL settings are different, set environment variables instead of editing committed files.

## First Admin Access (for cloned repos)

On first backend startup, the app seeds a bootstrap admin user from environment variables.

- Username: `APP_BOOTSTRAP_ADMIN_USERNAME` (default: `admin1`)
- Password: `APP_BOOTSTRAP_ADMIN_PASSWORD` (from your `.env`)

Also, if `APP_BOOTSTRAP_DEMO_USER_ENABLED=true`, a demo user is created for functional testing.

After logging in as admin, you can create additional users/admins from the administration panel based on your test needs.

This ensures anyone who clones the repo can test admin features without sharing real production credentials.

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
