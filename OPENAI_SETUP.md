# 🤖 OpenAI Integration Setup

## 🔑 Настройка OpenAI API

### 1. Получение API ключа

1. **Перейдите на OpenAI:** https://platform.openai.com/
2. **Войдите в аккаунт** или создайте новый
3. **Перейдите в API Keys:** https://platform.openai.com/api-keys
4. **Создайте новый ключ** или используйте существующий
5. **Скопируйте ключ** (начинается с `sk-`)

### 2. Настройка в Railway

#### Вариант A: Через Railway Dashboard
1. Перейдите в ваш проект на Railway
2. Нажмите **Variables**
3. Добавьте переменную:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** `sk-your-api-key-here`

#### Вариант B: Через Railway CLI
```bash
railway variables set OPENAI_API_KEY=sk-your-api-key-here
```

### 3. Локальная настройка

Создайте файл `.env`:
```bash
cp env.example .env
```

Отредактируйте `.env`:
```env
OPENAI_API_KEY=sk-your-api-key-here
RAILWAY_STATIC_URL=https://web-production-939d1.up.railway.app
```

## 🚀 Новые API Endpoints

### OpenAI Analysis
```bash
# Получить AI анализ рынка
curl https://web-production-939d1.up.railway.app/api/openai-analysis
```

### OpenAI Market Report
```bash
# Получить AI отчет о рынке
curl https://web-production-939d1.up.railway.app/api/openai-report
```

## 🎭 Демо с OpenAI

### Локальный запуск:
```bash
npm run demo-openai
```

### Тестирование:
```bash
# Проверить статус OpenAI
curl http://localhost:3000/health | jq '.openai'

# Получить AI анализ
curl http://localhost:3000/api/openai-analysis

# Получить AI отчет
curl http://localhost:3000/api/openai-report
```

## 📊 Возможности OpenAI

### 🤖 AI Analysis
- **Анализ настроений рынка**
- **Ключевые тренды**
- **Рекомендации для трейдеров**
- **Риски и возможности**

### 📋 AI Market Report
- **Краткое резюме**
- **Основные тренды**
- **Прогноз на ближайшее время**
- **Уровень риска (1-10)**

## 💰 Стоимость OpenAI

### GPT-4o-mini (рекомендуется)
- **$0.00015** за 1K input tokens
- **$0.0006** за 1K output tokens
- **~$0.01-0.05** за анализ

### Примеры использования:
- **Анализ 10 пар:** ~$0.02
- **Отчет о рынке:** ~$0.03
- **100 запросов/день:** ~$2-5/месяц

## 🔧 Troubleshooting

### Ошибка "OpenAI API key not configured"
```bash
# Проверьте переменную окружения
echo $OPENAI_API_KEY

# На Railway
railway variables list
```

### Ошибка "Request failed with status code 401"
- Проверьте правильность API ключа
- Убедитесь, что ключ активен
- Проверьте баланс аккаунта

### Ошибка "Rate limit exceeded"
- Подождите несколько минут
- Проверьте лимиты аккаунта
- Рассмотрите upgrade плана

## 📈 Мониторинг

### Проверка статуса:
```bash
curl https://web-production-939d1.up.railway.app/health | jq '.openai'
```

### Логи Railway:
- Перейдите в Railway Dashboard
- Выберите ваш проект
- Нажмите "Logs"
- Ищите ошибки OpenAI

## 🎯 Примеры ответов

### AI Analysis:
```json
{
  "analysis": {
    "analysis": "Рынок показывает умеренно бычьи настроения...",
    "sentiment": "bullish",
    "recommendations": [
      "Рассмотрите длинные позиции на BTC",
      "Следите за уровнем поддержки ETH"
    ]
  }
}
```

### AI Report:
```json
{
  "report": {
    "report": "Краткий отчет о рынке криптовалют...",
    "timestamp": "2025-08-02T20:48:00.000Z"
  }
}
```

## 🔒 Безопасность

### ✅ Рекомендации:
- **Не публикуйте API ключи** в коде
- **Используйте переменные окружения**
- **Регулярно ротируйте ключи**
- **Мониторьте использование**

### ❌ Не делайте:
- Не коммитьте `.env` файлы
- Не публикуйте ключи в GitHub
- Не используйте один ключ для всех проектов

---

**🎉 OpenAI интеграция готова к использованию!** 