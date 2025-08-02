# 🚀 Быстрый старт - Open Interest Interface

## 📋 Что уже готово

✅ **Проект загружен в GitHub:** https://github.com/cptbiz/open_interest_interface  
✅ **Настроен для деплоя на Railway**  
✅ **Создан автоматический скрипт деплоя**  

## 🎯 Следующие шаги

### 1. Деплой на Railway (автоматический)

```bash
# Клонируйте репозиторий
git clone https://github.com/cptbiz/open_interest_interface.git
cd open_interest_interface

# Запустите скрипт деплоя
./deploy-railway.sh
```

### 2. Деплой на Railway (через веб-интерфейс)

1. **Перейдите на [Railway.app](https://railway.app)**
2. **Нажмите "New Project"**
3. **Выберите "Deploy from GitHub repo"**
4. **Найдите репозиторий: `cptbiz/open_interest_interface`**
5. **Нажмите "Deploy Now"**

### 3. Настройка переменных окружения

После деплоя настройте переменные в Railway Dashboard:

```bash
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
PORT=3000
```

### 4. Инициализация базы данных

После деплоя запустите инициализацию БД:

```bash
# Локально
npm run init-db

# На Railway (через CLI)
railway run npm run init-db
```

## 🔧 Локальная разработка

```bash
# Установите зависимости
npm install

# Создайте .env файл
cp env.example .env
# Отредактируйте .env с вашими настройками

# Инициализируйте базу данных
npm run init-db

# Запустите в режиме разработки
npm run dev
```

## 📱 Тестирование

После деплоя проверьте:

- **Health Check:** `https://your-app-name.railway.app/health`
- **Open Interest:** `https://your-app-name.railway.app/api/open-interest`
- **Funding Rates:** `https://your-app-name.railway.app/api/funding-rates`
- **Long/Short Ratio:** `https://your-app-name.railway.app/api/long-short-ratio`
- **Statistics:** `https://your-app-name.railway.app/api/stats`

## 🧪 Тестирование подключений

```bash
# Тест всех подключений
npm run test
```

## 📊 Поддерживаемые биржи

- **Binance Futures** - 18 торговых пар
- **Bybit V5** - 17 торговых пар  
- **OKX** - 20 торговых пар

## 📈 Типы данных

- **Open Interest** - общий объем открытых позиций
- **Funding Rates** - ставки финансирования
- **Long/Short Ratio** - соотношение позиций

## 🆘 Устранение проблем

### Ошибка "nodemon: command not found"
```bash
npm install -g nodemon
# или
npm install
```

### Проблемы с Railway CLI
```bash
npm install -g @railway/cli
railway login
```

### Переменные окружения не работают
Проверьте в Railway Dashboard → Variables

### База данных не инициализирована
```bash
railway run npm run init-db
```

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи в Railway Dashboard
2. Убедитесь, что все переменные окружения настроены
3. Запустите тесты: `npm run test`

---

**🎉 Готово! Ваш Open Interest Interface готов к работе!** 