# VitalLogix

Pharmacy management system built with Java, PostgreSQL, React, and Electron.

Choose your language:

- [English](README.md)
- [Español](README.es.md)

## Overview

VitalLogix is a pharmacy management platform for inventory, sales, customers, reporting, and desktop usage.

## Project Structure

- `backend/` Spring Boot API and business logic
- `frontend/` React web interface
- `desktop/` Electron desktop wrapper
- `docs/en/` English documentation
- `docs/es/` Spanish documentation

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

## Role Access Matrix

- Guest: can view products and active categories; cannot create sales or manage data.
- User: can create and consult sales operations; cannot manage products, reports, or admin modules.
- Admin: full access to products, reports, customers, history, and categories (including approvals).

## Screenshots

Add progress screenshots here during development.

### Current State

- [ ] Initial dashboard
- [ ] Inventory module
- [ ] Sales flow
- [ ] Customer management
- [ ] Reports

### Final State

- [ ] Final dashboard
- [ ] Final inventory module
- [ ] Final sales flow
- [ ] Final customer management
- [ ] Final reports

## Setup

Add environment setup and run instructions here when ready.

## Documentation Links

- English documentation: `README.md`
- Spanish documentation: `README.es.md`
