# Hospital Resource Tracker (React + Django + MySQL + REST API)

## Run with Docker
From the project root, run:

    docker compose up --build

Open http://localhost:8082. The first start creates the database schema and demo data. Sign in with `admin/admin123`, `doctor1/doctor123`, or `staff1/staff123`.

To stop the containers, press Ctrl+C and run `docker compose down`. Database data is kept in a Docker volume; remove it with `docker compose down -v` only if you want to erase it. The default database passwords and Django secret are for local development only. Set `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD`, and `SECRET_KEY` in the environment before deploying.

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
