# Execution Guide and Getting Started

## Clone the repository

1. Open a terminal and clone the full project:
   - `git clone https://github.com/diancie/VitalLogix.git`
2. Enter the project root folder:
   - `cd VitalLogix`

## Getting Started

Before running with Docker, create your local environment file:

1. Copy `.env.example` to `.env`
2. Replace all `change_me_*` values with your own secrets

This step allows you to customize your test credentials.
In your `.env` you can set as you wish:

- Initial admin user: `APP_BOOTSTRAP_ADMIN_USERNAME`
- Initial admin password: `APP_BOOTSTRAP_ADMIN_PASSWORD`
- Demo user: `APP_BOOTSTRAP_DEMO_USER_USERNAME`
- Demo user password: `APP_BOOTSTRAP_DEMO_USER_PASSWORD`

Quick example:

```env
APP_BOOTSTRAP_ADMIN_USERNAME=admin_laboratorio
APP_BOOTSTRAP_ADMIN_PASSWORD=MySecureAdminPassword123
APP_BOOTSTRAP_DEMO_USER_USERNAME=test_user
APP_BOOTSTRAP_DEMO_USER_PASSWORD=MySecureUserPassword123
```

1. From the project root (`VitalLogix`), start the database and backend:
    - `docker compose up -d --build vitallogix-app`
2. Open a second terminal and return to the project folder:
    - `cd VitalLogix`
3. Start the frontend:
    - `npm --prefix frontend run dev`
4. Open the application in your browser:

   When the command finishes, you will see a message similar to this image:

   ![terminal to go to the page](../img/irWeb.png)

   Then open the link that appears in the terminal:

   - On macOS: hold Command (⌘) and click the link.
   - On Windows/Linux: hold Ctrl and click the link.
   - Manually: copy the address after `Local:` and paste it in your browser's address bar.

   > **Note:** Vite usually uses port `5173`. If it is busy, it will assign another one automatically, like `5174`.
   > Always use the port indicated by the terminal.

## Run Without Docker

If you prefer not to use Docker, you can also run the project completely locally.

Prerequisites:
- Java 21
- Maven (or use the Maven Wrapper included in this repo)
- PostgreSQL 16
- Node.js 18+ and npm

1. Create the database and credentials in PostgreSQL:
   - Database: `vitallogix`
   - User: `vitallogix`
   - Password: `vitallogix123`
2. Start the backend from the repository root:
   - macOS/Linux: `./backend/mvnw -f backend/pom.xml spring-boot:run`
   - Windows: `backend\\mvnw.cmd -f backend\\pom.xml spring-boot:run`
3. Start the frontend in a second terminal from the repository root:
   - `npm --prefix frontend install`
   - `npm --prefix frontend run dev`

If your local PostgreSQL credentials are different, set environment variables instead of editing versioned files.

## First Admin Access (for cloned repos)

On the first backend startup, the application creates a bootstrap admin using environment variables.

- User: `APP_BOOTSTRAP_ADMIN_USERNAME` (default: `admin1`)
- Password: `APP_BOOTSTRAP_ADMIN_PASSWORD` (set in your `.env`)

Also, if you leave `APP_BOOTSTRAP_DEMO_USER_ENABLED=true`, a demo user is created for functional testing.

After logging in as admin, you can create more users/admins from the admin panel as needed for testing.

This way, anyone who clones the repository can test admin features without sharing real production credentials.
