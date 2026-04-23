# Guía de Ejecución y Primeros Pasos

## Clonar el repositorio

1. Abre una terminal y clona el proyecto completo, escribiendo:
   - `git clone https://github.com/diancie/VitalLogix.git`
2. Entra a la carpeta raíz del proyecto:
   - `cd VitalLogix`

## Primeros Pasos

Antes de ejecutar con Docker, crea tu archivo de entorno local:

1. Copia `.env.example` a `.env`
2. Reemplaza todos los valores `change_me_*` por tus propios secretos

Este paso permite personalizar tus credenciales de prueba.
En tu `.env` puedes definir a tu gusto:

- Usuario admin inicial: `APP_BOOTSTRAP_ADMIN_USERNAME`
- Contraseña admin inicial: `APP_BOOTSTRAP_ADMIN_PASSWORD`
- Usuario demo: `APP_BOOTSTRAP_DEMO_USER_USERNAME`
- Contraseña demo: `APP_BOOTSTRAP_DEMO_USER_PASSWORD`

Ejemplo rápido:

```env
APP_BOOTSTRAP_ADMIN_USERNAME=admin_laboratorio
APP_BOOTSTRAP_ADMIN_PASSWORD=MiPasswordAdminSegura123
APP_BOOTSTRAP_DEMO_USER_USERNAME=usuario_pruebas
APP_BOOTSTRAP_DEMO_USER_PASSWORD=MiPasswordUserSegura123
```

1. Desde la carpeta raíz del proyecto (`VitalLogix`), levanta la base de datos y el backend:
    - `docker compose up -d --build vitallogix-app`
2. Abre una segunda terminal y vuelve a la carpeta del proyecto:
    - `cd VitalLogix`
3. Levanta el frontend:
    - `npm --prefix frontend run dev`
4. Abre la aplicación en tu navegador:

   Cuando el comando termine, verás un mensaje parecido al de esta imagen:

   ![terminal para ir a la página](../img/irWeb.png)

   Luego abre el enlace que aparece en la terminal:

   - En macOS: mantén presionada la tecla Command (⌘) y haz clic sobre el enlace.
   - En Windows/Linux: mantén presionada la tecla Ctrl y haz clic sobre el enlace.
   - Manualmente: copia la dirección que aparece después de `Local:` y pégala en la barra de direcciones de tu navegador.

   > **Nota:** Vite usa normalmente el puerto `5173`. Si está ocupado, te asignará otro automáticamente, como `5174`.
   > Usa siempre el puerto que te indique la terminal.

## Ejecutar Sin Docker

Si prefieres no usar Docker, también puedes ejecutar el proyecto completamente en local.

Requisitos previos:
- Java 21
- Maven (o usar el Maven Wrapper incluido en este repo)
- PostgreSQL 16
- Node.js 18+ y npm

1. Crea la base de datos y credenciales en PostgreSQL:
   - Base de datos: `vitallogix`
   - Usuario: `vitallogix`
   - Contraseña: `vitallogix123`
2. Levanta el backend desde la raíz del repositorio:
   - macOS/Linux: `./backend/mvnw -f backend/pom.xml spring-boot:run`
   - Windows: `backend\\mvnw.cmd -f backend\\pom.xml spring-boot:run`
3. Levanta el frontend en una segunda terminal desde la raíz del repositorio:
   - `npm --prefix frontend install`
   - `npm --prefix frontend run dev`

Si tus credenciales locales de PostgreSQL son diferentes, configura variables de entorno en lugar de editar archivos versionados.

## Primer Acceso Admin (para repos clonado)

En el primer arranque del backend, la aplicación crea un admin bootstrap usando variables de entorno.

- Usuario: `APP_BOOTSTRAP_ADMIN_USERNAME` (por defecto: `admin1`)
- Contraseña: `APP_BOOTSTRAP_ADMIN_PASSWORD` (definida en tu `.env`)

Además, si dejas `APP_BOOTSTRAP_DEMO_USER_ENABLED=true`, también se crea un usuario demo para pruebas funcionales.

Después de iniciar sesión como admin, puedes crear más usuarios/admins desde el panel de administración según tus necesidades de prueba.

Así cualquier persona que clone el repositorio puede probar funciones de admin sin compartir credenciales reales de producción.
