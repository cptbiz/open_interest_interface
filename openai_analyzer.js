const OpenAI = require('openai');

class OpenAIAnalyzer {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        this.isAvailable = !!process.env.OPENAI_API_KEY;
    }

    async analyzeOpenInterest(data) {
        if (!this.isAvailable) {
            return {
                analysis: "OpenAI API key not configured",
                sentiment: "neutral",
                recommendations: []
            };
        }

        try {
            const prompt = this.createAnalysisPrompt(data);
            
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are a cryptocurrency market analyst specializing in Open Interest analysis. Provide concise, actionable insights in Russian."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            });

            const analysis = completion.choices[0].message.content;
            
            return {
                analysis,
                sentiment: this.extractSentiment(analysis),
                recommendations: this.extractRecommendations(analysis),
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ OpenAI API error:', error.message);
            return {
                analysis: "Ошибка анализа OpenAI API",
                sentiment: "neutral",
                recommendations: [],
                error: error.message
            };
        }
    }

    createAnalysisPrompt(data) {
        const { openInterest, fundingRates, longShortRatio } = data;
        
        let prompt = "Анализируй данные открытого интереса криптовалют:\n\n";
        
        if (openInterest && openInterest.length > 0) {
            prompt += "📊 Open Interest данные:\n";
            openInterest.forEach(item => {
                prompt += `- ${item.exchange} ${item.symbol}: ${item.openInterestValue.toLocaleString()} USDT\n`;
            });
        }
        
        if (fundingRates && fundingRates.length > 0) {
            prompt += "\n💰 Funding Rates:\n";
            fundingRates.forEach(item => {
                const rate = (item.fundingRate * 100).toFixed(4);
                prompt += `- ${item.exchange} ${item.symbol}: ${rate}%\n`;
            });
        }
        
        if (longShortRatio && longShortRatio.length > 0) {
            prompt += "\n⚖️ Long/Short Ratio:\n";
            longShortRatio.forEach(item => {
                prompt += `- ${item.exchange} ${item.symbol}: ${item.longShortRatio.toFixed(2)}\n`;
            });
        }
        
        prompt += "\nПредоставь краткий анализ:\n";
        prompt += "1. Общее настроение рынка\n";
        prompt += "2. Ключевые тренды\n";
        prompt += "3. Рекомендации для трейдеров\n";
        prompt += "4. Риски и возможности\n";
        
        return prompt;
    }

    extractSentiment(analysis) {
        const lowerAnalysis = analysis.toLowerCase();
        if (lowerAnalysis.includes('бычий') || lowerAnalysis.includes('bullish') || lowerAnalysis.includes('рост')) {
            return 'bullish';
        } else if (lowerAnalysis.includes('медвежий') || lowerAnalysis.includes('bearish') || lowerAnalysis.includes('падение')) {
            return 'bearish';
        }
        return 'neutral';
    }

    extractRecommendations(analysis) {
        const recommendations = [];
        const lines = analysis.split('\n');
        
        for (const line of lines) {
            if (line.includes('рекоменд') || line.includes('совет') || line.includes('действие')) {
                recommendations.push(line.trim());
            }
        }
        
        return recommendations.slice(0, 3); // Максимум 3 рекомендации
    }

    async generateMarketReport(data) {
        if (!this.isAvailable) {
            return {
                report: "OpenAI API key not configured",
                summary: "No analysis available"
            };
        }

        try {
            const prompt = `Создай краткий отчет о рынке криптовалют на основе данных:
            
            Open Interest: ${data.openInterest?.length || 0} записей
            Funding Rates: ${data.fundingRates?.length || 0} записей
            Long/Short Ratio: ${data.longShortRatio?.length || 0} записей
            
            Предоставь:
            1. Краткое резюме
            2. Основные тренды
            3. Прогноз на ближайшее время
            4. Уровень риска (1-10)`;

            const completion = await this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "Ты эксперт по криптовалютным рынкам. Пиши кратко и по делу на русском языке."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 300,
                temperature: 0.5
            });

            return {
                report: completion.choices[0].message.content,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ OpenAI report error:', error.message);
            return {
                report: "Ошибка генерации отчета",
                error: error.message
            };
        }
    }
}

module.exports = OpenAIAnalyzer; 