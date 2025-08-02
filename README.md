# Open Interest Interface

🚀 **Real-time Open Interest analyzer without database storage**

## 📊 Описание

Этот проект анализирует данные об открытом интересе (Open Interest) с крупнейших криптовалютных бирж в реальном времени без сохранения в базу данных. Открытый интерес - это важный индикатор для анализа настроений рынка и прогнозирования движения цен.

## ✨ Возможности

- 📈 **Real-time данные** с Binance, Bybit, OKX
- 💰 **Open Interest** - общий объем открытых позиций
- 📊 **Funding Rates** - ставки финансирования
- ⚖️ **Long/Short Ratio** - соотношение длинных/коротких позиций
- 🧠 **Real-time анализ** - анализ в памяти без БД
- 📊 **Market Sentiment** - анализ настроений рынка
- 🌐 **REST API** - удобный доступ к данным
- 📱 **WebSocket** - потоковая передача данных

## 🛠 Технологии

- **Node.js** - серверная платформа
- **WebSocket** - реальное время
- **In-Memory Storage** - хранение в памяти
- **Express.js** - REST API
- **Railway** - облачный деплой

## 📈 Поддерживаемые биржи

- **Binance Futures** - 18 торговых пар
- **Bybit V5** - 17 торговых пар  
- **OKX** - 20 торговых пар

## 🚀 Быстрый старт

### Локальная установка

1. **Клонируйте репозиторий:**
```bash
git clone https://github.com/cptbiz/open_interest_interface.git
cd open_interest_interface
```

2. **Установите зависимости:**
```bash
npm install
```

3. **Настройте переменные окружения:**
```bash
cp env.example .env
# Отредактируйте .env файл с вашими настройками
```

4. **Инициализируйте базу данных:**
```bash
npm run init-db
```

5. **Запустите коллектор:**
```bash
npm start
# или для разработки:
npm run dev
```

### Деплой на Railway

1. **Перейдите на [Railway.app](https://railway.app)**
2. **Нажмите "New Project" → "Deploy from GitHub repo"**
3. **Выберите репозиторий: `cptbiz/open_interest_interface`**
4. **Настройте переменные окружения в Railway Dashboard:**
   - `DATABASE_URL` - строка подключения к PostgreSQL

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Open Interest Data
```
GET /api/open-interest
GET /api/open-interest/:exchange
```

### Funding Rates
```
GET /api/funding-rates
```

### Long/Short Ratio
```
GET /api/long-short-ratio
```

### Real-time Analysis
```
GET /api/analysis
```

### Market Sentiment
```
GET /api/sentiment
```

### Statistics
```
GET /api/stats
```

## 🔧 Конфигурация

### Переменные окружения

| Переменная | Описание | Обязательная |
|------------|----------|--------------|
| `PORT` | Порт сервера | Нет (по умолчанию 3000) |
| `NODE_ENV` | Окружение | Нет (production) |
| `LOG_LEVEL` | Уровень логирования | Нет (info) |

## 📊 Типы данных

### Open Interest (Открытый интерес)
- Общий объем открытых позиций
- Значение в USDT
- Временная метка

### Funding Rates (Ставки финансирования)
- Текущая ставка финансирования
- Время следующего финансирования
- Процентная ставка

### Long/Short Ratio (Соотношение позиций)
- Доля длинных позиций
- Доля коротких позиций
- Общее соотношение

## 📈 Торговые пары

Поддерживаемые пары:
- BTC, ETH, SOL, ADA, XRP, DOGE, DOT, AVAX, LTC, LINK
- BCH, ETC, UNI, OP, ARB, APT, SUI, FIL, MATIC, SHIB

## 🧠 In-Memory Analysis

### Типы анализа
- **Real-time Open Interest** - анализ в реальном времени
- **Market Sentiment** - настроения рынка
- **Trend Analysis** - анализ трендов
- **Funding Rate Analysis** - анализ ставок финансирования

## 📊 Мониторинг

### Логи
- Статус подключений в реальном времени
- Статистика сбора данных
- Обработка ошибок и восстановление

### API Мониторинг
```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/stats
curl http://localhost:3000/api/open-interest
```

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License

## 👨‍💻 Автор

Bagrat

---

⭐ Поставьте звезду репозиторию, если он вам полезен! 