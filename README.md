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

1. **Подключите репозиторий к Railway**
2. **Настройте переменные окружения в Railway Dashboard:**
   - `CHATWOOT_BASE_URL`
   - `CHATWOOT_ACCESS_TOKEN`
   - `CHATWOOT_ACCOUNT_ID`
   - `PORT` (автоматически устанавливается Railway)

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