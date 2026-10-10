FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc default-libmysqlclient-dev pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "python manage.py makemigrations tracker --noinput && python manage.py migrate --noinput && python manage.py collectstatic --noinput && if [ \"$SEED_DEMO_DATA\" = \"true\" ]; then python manage.py seed; fi && if [ -n \"$BOOTSTRAP_ADMIN_USERNAME$BOOTSTRAP_ADMIN_EMAIL$BOOTSTRAP_ADMIN_PASSWORD\" ]; then python manage.py bootstrap_admin; fi && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000}"]
