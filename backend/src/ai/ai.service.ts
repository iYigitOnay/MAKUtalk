import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService implements OnModuleInit {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) return;

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Listendeki kesin çalışan model ismine geri dönüyoruz
      this.model = this.genAI.getGenerativeModel({ 
        model: 'gemini-flash-latest', 
        generationConfig: { 
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      });
      this.logger.log('Akıllı AI Modülü aktif (Model: gemini-flash-latest).');
    } catch (error) {
      this.logger.error('Gemini başlatma hatası:', error);
    }
  }

  async analyzePost(content: string, includeCategory: boolean = true): Promise<{
    sentiment: string;
    sentimentScore: number;
    suggestedCategorySlug: string | null;
  }> {
    if (!this.model) return { sentiment: 'Sakin', sentimentScore: 0.5, suggestedCategorySlug: 'genel' };

    try {
      const categoryPrompt = includeCategory ? `
        KATEGORİ (Slug seç): "genel", "duyuru", "etkinlik", "ariza-kayip", "satilik", "soru-cevap".
      ` : "Kategori analizi yapma, 'category' alanını null dön.";

      const prompt = `
        ANALİZ: "${content}"
        ${categoryPrompt}
        DUYGU: "Neşeli", "Hüzünlü", "Kızgın", "Endişeli", "Sakin", "Meraklı", "Ciddi".
        JSON FORMATI: {"sentiment": "Duygu", "sentimentScore": 0.5, "category": "slug_veya_null"}
      `;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      const analysis = JSON.parse(responseText);

      return {
        sentiment: analysis.sentiment || 'Sakin',
        sentimentScore: analysis.sentimentScore || 0.5,
        suggestedCategorySlug: includeCategory ? (analysis.category || 'genel') : null,
      };
    } catch (error) {
      this.logger.error('AI Analiz Hatası:', error.message);
      return { sentiment: 'Sakin', sentimentScore: 0.5, suggestedCategorySlug: 'genel' };
    }
  }

  async suggestCategory(content: string) {
    const res = await this.analyzePost(content, true);
    return res.suggestedCategorySlug;
  }

  async analyzeSentiment(content: string) {
    const res = await this.analyzePost(content, false);
    return { sentiment: res.sentiment, score: res.sentimentScore };
  }

  async moderateContent(content: string) { return { safe: true }; }
}
