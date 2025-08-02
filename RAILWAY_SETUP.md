# 🚀 Railway Setup Guide - Open Interest Interface

## 📋 Проблема с деплоем

Приложение задеплоено, но не запускается из-за отсутствия переменных окружения.

## 🔧 Необходимые переменные окружения

### 1. DATABASE_URL (ОБЯЗАТЕЛЬНО)
```
DATABASE_URL=postgresql://username:password@host:port/database
```

**Варианты получения PostgreSQL:**
- **Railway PostgreSQL** (рекомендуется)
- **Supabase**
- **Neon**
- **Другой PostgreSQL сервер**

### 2. Настройка Railway PostgreSQL

1. **В Railway Dashboard:**
   - Нажмите "New Service"
   - Выберите "Database" → "PostgreSQL"
   - Дождитесь создания

2. **Подключите к вашему приложению:**
   - В настройках PostgreSQL найдите "Connect"
   - Скопируйте "Postgres Connection URL"
   - Добавьте как переменную `DATABASE_URL`

### 3. Дополнительные переменные (опционально)
```
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

## 🎯 Пошаговая настройка

### Шаг 1: Создайте PostgreSQL
1. Перейдите в Railway Dashboard
2. Нажмите "New Service" → "Database" → "PostgreSQL"
3. Дождитесь создания базы данных

### Шаг 2: Настройте переменные окружения
1. Перейдите в ваш проект Open Interest Interface
2. Нажмите "Variables"
3. Добавьте переменную:
   - **Name:** `DATABASE_URL`
   - **Value:** `postgresql://username:password@host:port/database` (из PostgreSQL сервиса)

### Шаг 3: Перезапустите деплой
1. Перейдите в "Deployments"
2. Нажмите "Redeploy"

### Шаг 4: Инициализируйте базу данных
После успешного деплоя:
```bash
railway run npm run init-db
```

## 🧪 Тестирование

После настройки проверьте:
```bash
curl https://web-production-939d1.up.railway.app/health
```

Ожидаемый ответ:
```json
{
  "status": "OK",
  "timestamp": "2024-08-02T...",
  "service": "Open Interest Collector",
  "exchanges": ["binance", "bybit", "okx"],
  "dataPoints": 0
}
```

## 📊 API Endpoints

После успешного запуска будут доступны:
- **Health:** `https://web-production-939d1.up.railway.app/health`
- **Open Interest:** `https://web-production-939d1.up.railway.app/api/open-interest`
- **Funding Rates:** `https://web-production-939d1.up.railway.app/api/funding-rates`
- **Long/Short Ratio:** `https://web-production-939d1.up.railway.app/api/long-short-ratio`
- **Statistics:** `https://web-production-939d1.up.railway.app/api/stats`

## 🆘 Устранение проблем

### Ошибка 404
- Проверьте переменные окружения
- Убедитесь, что DATABASE_URL установлен
- Проверьте логи деплоя

### Ошибка подключения к БД
- Проверьте правильность DATABASE_URL
- Убедитесь, что PostgreSQL сервис запущен
- Проверьте SSL настройки

### Приложение не запускается
- Проверьте логи в Railway Dashboard
- Убедитесь, что все зависимости установлены
- Проверьте порт (должен быть 3000)

## 📞 Поддержка

Если проблемы остаются:
1. Проверьте логи в Railway Dashboard → Deployments
2. Убедитесь, что все переменные окружения настроены
3. Попробуйте пересоздать PostgreSQL сервис 