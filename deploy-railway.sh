#!/bin/bash

# 🚀 Railway Deploy Script для Chatwoot Webhook Interface
# Автор: Bagrat

set -e

echo "🚀 Начинаем деплой на Railway..."

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
    echo "   railway variables set CHATWOOT_BASE_URL=https://app.chatwoot.com"
    echo "   railway variables set CHATWOOT_ACCESS_TOKEN=your_token_here"
    echo "   railway variables set CHATWOOT_ACCOUNT_ID=your_account_id_here"
fi

# Получаем URL деплоя
echo "🌐 Получаем URL деплоя..."
railway status

echo "✅ Деплой завершен!"
echo "📱 Ваш webhook URL будет доступен по адресу:"
echo "   https://your-app-name.railway.app/webhook"
echo ""
echo "🔧 Для настройки webhook в Chatwoot используйте:"
echo "   https://your-app-name.railway.app/webhook" 