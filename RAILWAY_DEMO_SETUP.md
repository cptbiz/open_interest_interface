# 🚀 Railway Demo Setup

## 📊 **Проблема с данными**

Текущий Railway деплой возвращает пустые данные из-за ограничений API бирж (ошибки 451, 403). 

## 🔧 **Решение: Railway Demo**

Создана версия `railway_demo.js` с демо-данными для Railway.

### 📋 **Файлы:**

- `railway_demo.js` - Railway версия с демо-данными
- `demo_data.js` - тестовые данные
- `openai_analyzer.js` - OpenAI интеграция

### 🚀 **Запуск:**

#### **Локально:**
```bash
npm run railway-demo
```

#### **На Railway:**
Railway автоматически использует `railway_demo.js` через Procfile.

### 📊 **Демо-данные включают:**

- **BTCUSDT** на Binance, Bybit, OKX
- **ETHUSDT** на Binance  
- **Funding Rates** для всех пар
- **Long/Short Ratios** для анализа
- **Real-time Analysis** с трендами
- **Market Sentiment** анализ

### 🔗 **API Endpoints:**

- **Health Check:** `/health`
- **Open Interest:** `/api/open-interest`
- **Funding Rates:** `/api/funding-rates`
- **Long/Short Ratio:** `/api/long-short-ratio`
- **Analysis:** `/api/analysis`
- **Sentiment:** `/api/sentiment`
- **OpenAI Analysis:** `/api/openai-analysis`
- **OpenAI Report:** `/api/openai-report`
- **Demo Info:** `/api/demo`

### 🎯 **Тестирование:**

```bash
# Проверить данные
curl https://web-production-939d1.up.railway.app/api/open-interest

# Проверить анализ
curl https://web-production-939d1.up.railway.app/api/analysis

# Проверить OpenAI
curl https://web-production-939d1.up.railway.app/api/openai-analysis
```

### 🔄 **Обновление Railway:**

Railway автоматически обновит деплой после push в GitHub:

```bash
git add .
git commit -m "Update Railway demo"
git push
```

### 📈 **Ожидаемые результаты:**

- **Open Interest:** 4 записи
- **Funding Rates:** 3 записи  
- **Long/Short Ratio:** 3 записи
- **Market Trend:** bullish/neutral
- **OpenAI:** Работает (если настроен API ключ)

---

**🎉 Railway Demo готов к использованию!** 