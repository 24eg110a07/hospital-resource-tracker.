# Hospital Resource Tracker (React + Django + MySQL/PostgreSQL + REST API)

## Run with Docker
From the project root, run:

    docker compose up --build

Open http://localhost:8082. The first start creates the database schema and demo data. Sign in with `admin/admin123`, `doctor1/doctor123`, or `staff1/staff123`.

To stop the containers, press Ctrl+C and run `docker compose down`. Database data is kept in a Docker volume; remove it with `docker compose down -v` only if you want to erase it. The default database passwords and Django secret are for local development only. Set `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD`, and `SECRET_KEY` in the environment before deploying.

## Deploy a demo to Render

Check [Render pricing](https://render.com/pricing) and [free-service limitations](https://render.com/docs/free) before deploying. Free services can sleep when idle, and free databases/services are for demos rather than production. Do not enter real patient or other sensitive data.

Create a Render PostgreSQL database, then deploy two Docker web services from this GitHub repository:

1. **Database:** In the Render Dashboard choose **New + > PostgreSQL**. Select a free plan if currently offered and choose a region.
2. **Backend:** Choose **New + > Web Service**, connect this repository, set the root directory to `backend`, and use the Docker runtime. Add `SECRET_KEY` (a new private random value), `DEBUG=false`, `SEED_DEMO_DATA=false`, and `DATABASE_URL` linked to the database's internal URL. Select the database and web service in the same region. Deploy, then generate a public domain for the backend.
3. **Frontend:** Create another **Web Service** from the same repository with root directory `frontend` and Docker runtime. Since Render Free web services cannot receive private-network requests, set `BACKEND_HOST` to the backend's generated public hostname (hostname only, without `https://`) and `BACKEND_SCHEME=https`. Deploy, then generate its public domain.
4. Add the frontend's public hostname to the backend's `ALLOWED_HOSTS` and its full `https://` origin to `CSRF_TRUSTED_ORIGINS`. The backend's own `RENDER_EXTERNAL_HOSTNAME` is added automatically. Redeploy the backend after changing variables.
5. Open the backend service's **Shell** and run `python manage.py createsuperuser` to create your own admin account. Demo accounts are disabled for public deployments.

The frontend's public domain is the live app URL; the backend's public domain is the direct API URL. Keep `SECRET_KEY` and database credentials private.

## 1. Backend (Django REST Framework)
    cd backend
    python -m venv venv && venv\Scripts\activate      (Linux/Mac: source venv/bin/activate)
    pip install -r requirements.txt
Create the MySQL database, then set credentials (or edit config/settings.py):
    CREATE DATABASE hospital_tracker CHARACTER SET utf8mb4;
    set DB_USER=root & set DB_PASSWORD=yourpassword      (Linux/Mac: export ...)
No MySQL handy? Use SQLite for a quick run:  set USE_SQLITE=1
    python manage.py makemigrations tracker
    python manage.py migrate
    python manage.py seed
    python manage.py runserver            -> http://127.0.0.1:8000

## 2. Frontend (React + Vite)
    cd frontend
    npm install
    npm run dev                           -> http://localhost:5173

Demo logins: admin/admin123 · doctor1/doctor123 · staff1/staff123

## Roles
- Admin: add/edit/delete beds, doctors, staff, equipment; approve/reject requests
- Doctor & Staff: view availability, search/filter, submit requests

## REST API (Token auth: `Authorization: Token <key>`)
POST /api/login/ · GET /api/dashboard/ · /api/beds/ · /api/doctors/ · /api/staff/ · /api/equipment/ · /api/requests/
Supports `?search=` and `?status=` on resource lists. Django admin: /admin/
