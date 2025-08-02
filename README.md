# Open Interest Interface

🚀 **Real-time Open Interest analyzer with OpenAI integration**

## 📊 Описание

Этот проект анализирует данные об открытом интересе (Open Interest) с крупнейших криптовалютных бирж в реальном времени без сохранения в базу данных. Открытый интерес - это важный индикатор для анализа настроений рынка и прогнозирования движения цен.

## ✨ Возможности

- 📈 **Real-time данные** с Binance, Bybit, OKX
- 📊 **Open Interest** - общий объем открытых позиций
- 💰 **Funding Rates** - ставки финансирования
- ⚖️ **Long/Short Ratio** - соотношение длинных/коротких позиций
- 🧠 **Real-time анализ** - анализ в памяти без БД
- 📊 **Market Sentiment** - анализ настроений рынка
- 🤖 **OpenAI Analysis** - AI-powered анализ рынка
- 📋 **AI Reports** - AI-генерируемые отчеты
- 🌐 **REST API** - удобный доступ к данным
- 📱 **WebSocket** - потоковая передача данных

## 🛠 Технологии

- **Node.js** - серверная платформа
- **Express.js** - REST API
- **WebSocket** - реальное время
- **In-Memory Storage** - хранение в памяти
- **🤖 OpenAI** - AI анализ рынка
- **Railway** - облачный деплой
- **Docker** - контейнеризация

## 🚀 Быстрый старт

### Локальная разработка

```bash
# Клонирование репозитория
git clone https://github.com/cptbiz/open_interest_interface.git
cd open_interest_interface

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Запуск демо-версии
npm run demo-openai

# Запуск Railway демо
npm run railway-demo
```

### Railway деплой

```bash
# Автоматический деплой через GitHub
git push origin main
```

## 🔗 API Endpoints

### Основные endpoints

```
GET /health
GET /api/open-interest
GET /api/funding-rates
GET /api/long-short-ratio
GET /api/analysis
GET /api/sentiment
```

### AI endpoints

```
GET /api/openai-analysis
GET /api/openai-report
POST /api/force-update
```

## 🔧 WebSocket Исправления

### Bybit WebSocket
- ✅ Исправлен URL: `wss://stream.bybit.com/v5/public/linear`
- ✅ Добавлен ping/pong каждые 20 секунд
- ✅ Правильная обработка подписки
- ✅ Обработка ошибок 403/451

### Binance WebSocket
- ✅ Исправлен URL: `wss://fstream.binance.com/ws`
- ✅ Правильный формат подписки
- ✅ Обработка open_interest событий

### REST API Исправления
- ✅ Добавлен обязательный параметр `intervalTime` для Bybit
- ✅ Улучшена обработка ответов API
- ✅ Добавлена обработка ошибок

## 📊 Поддерживаемые биржи

- **Binance** - 18 торговых пар
- **Bybit** - 18 торговых пар  
- **OKX** - 18 торговых пар
- **Coinbase** - 5 торговых пар

## 🔑 Настройка OpenAI

1. **Получите API ключ:** https://platform.openai.com/api-keys
2. **Настройте в Railway:** `railway variables set OPENAI_API_KEY=sk-your-key`
3. **Локально:** Добавьте в `.env` файл

## 📈 Мониторинг

```bash
# Проверка здоровья
curl https://web-production-939d1.up.railway.app/health

# Проверка данных
curl https://web-production-939d1.up.railway.app/api/open-interest

# Проверка AI анализа
curl https://web-production-939d1.up.railway.app/api/openai-analysis
```

## 🎯 Примеры использования

### Получение Open Interest данных
```bash
curl https://web-production-939d1.up.railway.app/api/open-interest
```

### AI анализ рынка
```bash
curl https://web-production-939d1.up.railway.app/api/openai-analysis
```

### Принудительное обновление
```bash
curl -X POST https://web-production-939d1.up.railway.app/api/force-update
```

## 🔒 Переменные окружения

| Переменная | Описание | Обязательная |
|------------|----------|--------------|
| `PORT` | Порт сервера | Нет (по умолчанию 3000) |
| `NODE_ENV` | Окружение | Нет (production) |
| `LOG_LEVEL` | Уровень логирования | Нет (info) |
| `OPENAI_API_KEY` | OpenAI API ключ | Нет (для AI функций) |
| `RAILWAY_STATIC_URL` | Railway URL | Нет (автоматически) |

## 📋 Файлы проекта

- `open_interest_collector.js` - основной коллектор данных
- `railway_demo.js` - Railway версия с демо-данными
- `openai_analyzer.js` - OpenAI интеграция
- `demo_data.js` - тестовые данные
- `package.json` - зависимости проекта
- `railway.json` - конфигурация Railway
- `Dockerfile` - контейнеризация

## 🎉 Демо

**Railway:** https://web-production-939d1.up.railway.app  
**GitHub:** https://github.com/cptbiz/open_interest_interface

## 📞 Поддержка

- **Документация:** `README.md`
- **OpenAI Setup:** `OPENAI_SETUP.md`
- **Railway Demo:** `RAILWAY_DEMO_SETUP.md`
- **Final Summary:** `FINAL_SUMMARY_WITH_OPENAI.md`

---

**🎯 Проект Open Interest Interface с AI готов к использованию!** 