#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "--- Installing Python Dependencies ---"
pip install -r requirements.txt

echo "--- Collecting Static Files ---"
python manage.py collectstatic --noinput

echo "--- Running Database Migrations on Neon PostgreSQL ---"
python manage.py migrate
