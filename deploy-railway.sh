#!/bin/bash

# 🚀 Railway Deploy Script для Open Interest Interface
# Автор: Bagrat

set -e

echo "🚀 Начинаем деплой Open Interest Interface на Railway..."

# Проверяем наличие Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI не установлен. Устанавливаем..."
    npm install -g @railway/cli
fi

# Проверяем авторизацию в Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Требуется авторизация в Railway..."
    railway login
fi

# Инициализируем проект если нужно
if [ ! -f ".railway/project.json" ]; then
    echo "📁 Инициализируем Railway проект..."
    railway init
fi

# Деплойем проект
echo "🚀 Деплойем проект на Railway..."
railway up

# Настраиваем переменные окружения
echo "⚙️ Настраиваем переменные окружения..."

# Проверяем наличие .env файла
if [ -f ".env" ]; then
    echo "📋 Загружаем переменные из .env файла..."
    while IFS= read -r line; do
        if [[ $line =~ ^[A-Z_]+=.*$ ]]; then
            var_name=$(echo "$line" | cut -d'=' -f1)
            var_value=$(echo "$line" | cut -d'=' -f2-)
            echo "🔧 Устанавливаем $var_name..."
            railway variables set "$var_name"="$var_value"
        fi
    done < .env
else
    echo "⚠️ .env файл не найден. Настройте переменные вручную:"
    echo "   railway variables set DATABASE_URL=your_postgresql_connection_string"
    echo "   railway variables set NODE_ENV=production"
    echo "   railway variables set PORT=3000"
fi

# Получаем URL деплоя
echo "🌐 Получаем URL деплоя..."
railway status

echo "✅ Деплой завершен!"
echo "📊 Ваш Open Interest Interface будет доступен по адресу:"
echo "   https://your-app-name.railway.app"
echo ""
echo "🔗 API Endpoints:"
echo "   Health Check: https://your-app-name.railway.app/health"
echo "   Open Interest: https://your-app-name.railway.app/api/open-interest"
echo "   Funding Rates: https://your-app-name.railway.app/api/funding-rates"
echo "   Long/Short Ratio: https://your-app-name.railway.app/api/long-short-ratio"
echo "   Statistics: https://your-app-name.railway.app/api/stats" 