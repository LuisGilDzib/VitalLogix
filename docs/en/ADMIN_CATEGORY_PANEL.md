# Category Administration Panel

## Status

Implemented and available in the current codebase.

## What It Solves

This panel gives administrators full control over category governance:
- Create and review custom categories
- Approve or reject pending entries
- Edit existing categories
- Deactivate categories without deleting historical references

## Current Architecture

### Backend

Core files:
- `backend/src/main/java/com/vitallogix/backend/model/Category.java`
- `backend/src/main/java/com/vitallogix/backend/repository/CategoryRepository.java`
- `backend/src/main/java/com/vitallogix/backend/service/CategoryService.java`
- `backend/src/main/java/com/vitallogix/backend/controller/CategoryController.java`
- `backend/src/main/java/com/vitallogix/backend/dto/CategoryRequest.java`
- `backend/src/main/java/com/vitallogix/backend/dto/CategoryResponse.java`

### Frontend

Core files:
- `frontend/src/components/CategoryManagementPanel.jsx`
- `frontend/src/services/api.js`
- `frontend/src/App.jsx`

## API Surface (CategoryController)

Base URL: `/api/categories`

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

## Access Rules

- Admin only:
  - Create custom/predefined categories
  - Approve/reject pending categories
  - Edit and deactivate categories
  - List all categories and pending queue
- Public read:
  - Active/predefined/custom category lists used by product screens

## Validation Checklist

1. Log in as admin
2. Open category panel from the navigation
3. Check pending queue and approve/reject entries
4. Edit one category and verify persistence
5. Deactivate one category and verify it is no longer active

## Last Updated

April 2026
