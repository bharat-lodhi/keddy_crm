#!/bin/bash

echo "Starting deployment..."

# Go to project directory
cd /home/crm/keddy_crm || exit

# Pull latest code
echo "Pulling latest code..."
git pull

# ================= BACKEND =================
echo "Updating backend..."
cd backend || exit
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

echo "Restarting Gunicorn service..."
systemctl restart keddycrm

# ================= FRONTEND =================
echo "Updating frontend..."
cd ../frontend || exit

npm install
npm run build

echo "Restarting Nginx..."
systemctl restart nginx

echo "Deployment completed successfully!"
