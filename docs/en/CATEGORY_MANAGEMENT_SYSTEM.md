# Category Management System

## Overview

The category module lets administrators manage product categories in a centralized workflow. Categories are split into:
- Predefined: base categories shipped by the system
- Custom: categories created during product workflows, then reviewed

## Category Flow

### Predefined Categories

`PREDEFINED + ACTIVE -> available immediately in product forms`

### Custom Categories

`Create custom name -> PENDING_APPROVAL -> approve to ACTIVE or reject`

## Backend

### Entity: Category

Location: `backend/src/main/java/com/vitallogix/backend/model/Category.java`

Main fields:
- id
- name
- description
- status: ACTIVE | INACTIVE | PENDING_APPROVAL
- type: PREDEFINED | CUSTOM
- createdAt / updatedAt
- createdBy / approvedBy / approvedAt

### Service Layer

Location: `backend/src/main/java/com/vitallogix/backend/service/CategoryService.java`

Core operations:
- getActiveCategories
- getPendingApprovals
- createCustomCategory
- createPredefinedCategory
- approveCategory
- rejectCategory
- updateCategory
- deactivateCategory

### Controller

Location: `backend/src/main/java/com/vitallogix/backend/controller/CategoryController.java`

Base URL: `/api/categories`

Endpoints:
- GET `/active`
- GET `/predefined`
- GET `/custom`
- GET `/pending`
- GET `/{id}`
- GET `/`
- POST `/custom`
- POST `/predefined`
- PUT `/{id}`
- PUT `/{id}/approve`
- PUT `/{id}/deactivate`
- DELETE `/{id}/reject`

## Frontend

### API Client

Location: `frontend/src/services/api.js`

Category functions:
- getActiveCategories
- getPredefinedCategories
- getCustomCategories
- getPendingCategories
- getAllCategories
- getCategoryById
- createCustomCategory
- createPredefinedCategory
- updateCategory
- approveCategory
- rejectCategory
- deactivateCategory

### Admin Panel

Location: `frontend/src/components/CategoryManagementPanel.jsx`

Main behavior:
- Tabs for All and Pending
- Approve/reject pending custom categories
- Edit category name/description
- Deactivate categories
- Audit metadata display

## Permissions

- Admin only: create, approve, reject, edit, deactivate, list all/pending
- Public read: active/predefined/custom lists for product usage

## Last Updated

April 2026
