# Chatwoot Webhook Interface

🚀 **Webhook сервер для интеграции с Chatwoot.com**

## 📋 Описание

Этот проект представляет собой веб-сервер, который обрабатывает webhook события от Chatwoot и предоставляет API для управления беседами.

## ✨ Возможности

- 📱 Обработка webhook событий от Chatwoot
- 💬 Автоматические ответы на сообщения
- 🔄 Управление активными беседами
- 🏥 Health check endpoint
- 📊 API для получения информации о беседах

## 🛠 Технологии

- **Node.js** - серверная платформа
- **Express.js** - веб-фреймворк
- **Axios** - HTTP клиент
- **CORS** - поддержка кросс-доменных запросов

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

4. **Запустите сервер:**
```bash
npm start
# или для разработки:
npm run dev
```

### Деплой на Railway

#### Автоматический деплой через GitHub

1. **Перейдите на [Railway.app](https://railway.app)**
2. **Нажмите "New Project" → "Deploy from GitHub repo"**
3. **Выберите репозиторий: `cptbiz/open_interest_interface`**
4. **Настройте переменные окружения в Railway Dashboard:**
   - `CHATWOOT_BASE_URL` - URL вашего Chatwoot инстанса
   - `CHATWOOT_ACCESS_TOKEN` - токен доступа к Chatwoot API
   - `CHATWOOT_ACCOUNT_ID` - ID аккаунта в Chatwoot
   - `PORT` - автоматически устанавливается Railway

#### Деплой через Railway CLI

1. **Установите Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Войдите в Railway:**
```bash
railway login
```

3. **Инициализируйте проект:**
```bash
railway init
```

4. **Деплойте проект:**
```bash
railway up
```

5. **Настройте переменные окружения:**
```bash
railway variables set CHATWOOT_BASE_URL=https://app.chatwoot.com
railway variables set CHATWOOT_ACCESS_TOKEN=your_token_here
railway variables set CHATWOOT_ACCOUNT_ID=your_account_id_here
```

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Webhook (Chatwoot)
```
POST /webhook
```

### Получить все беседы
```
GET /conversations
```

### Получить конкретную беседу
```
GET /conversations/:id
```

## 🔧 Конфигурация

### Переменные окружения

| Переменная | Описание | Обязательная |
|------------|----------|--------------|
| `CHATWOOT_BASE_URL` | URL вашего Chatwoot инстанса | Да |
| `CHATWOOT_ACCESS_TOKEN` | Токен доступа к Chatwoot API | Да |
| `CHATWOOT_ACCOUNT_ID` | ID аккаунта в Chatwoot | Да |
| `PORT` | Порт сервера | Нет (по умолчанию 3000) |

## 📝 События

Сервер обрабатывает следующие события от Chatwoot:

- `message_created` - новое сообщение
- `conversation_created` - новая беседа
- `conversation_updated` - обновление беседы

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

ISC License

## ��‍💻 Автор

Bagrat 