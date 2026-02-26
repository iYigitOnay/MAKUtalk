import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService implements OnModuleInit {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) return;

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      await this.listAvailableModels(); // Modelleri listele ve en uygununu seç
    } catch (error) {
      this.logger.error('AI başlatma hatası:', error);
    }
  }

  private async listAvailableModels() {
    try {
      const apiKey = this.configService.get('GEMINI_API_KEY');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const data = await response.json();
      const models = data.models || [];
      const modelNames = models.map((m: any) => m.name.replace('models/', ''));
      
      this.logger.log('--- ERİŞİLEBİLİR MODELLER ---');
      this.logger.log(modelNames.join(', '));
      this.logger.log('-----------------------------');

      // Kotası yüksek olan Gemma modelini veya stabil Gemini'yi bulmaya çalış
      let selectedModel = modelNames.find((n: string) => n.includes('gemma-3-27b')) || 
                          modelNames.find((n: string) => n.includes('gemma-2')) ||
                          modelNames.find((n: string) => n.includes('gemini-1.5-flash')) ||
                          modelNames[0];

      if (selectedModel) {
        this.model = this.genAI.getGenerativeModel({ 
          model: selectedModel, 
          generationConfig: { 
            temperature: 0.1,
            // Sadece Gemini modelleri JSON modunu garanti eder, Gemma için kapatıyoruz
            ...(selectedModel.includes('gemini') ? { responseMimeType: "application/json" } : {})
          }
        });
        this.logger.log(`Seçilen Model: ${selectedModel}`);
      }
    } catch (e) {
      this.logger.error('Modeller listelenemedi:', e.message);
    }
  }

  async analyzePost(content: string, includeCategory: boolean = true): Promise<{
    sentiment: string;
    sentimentScore: number;
    suggestedCategorySlug: string | null;
  }> {
    if (!this.model) return { sentiment: 'Sakin', sentimentScore: 0.5, suggestedCategorySlug: 'genel' };

    try {
      const prompt = includeCategory 
        ? `ANALİZ: "${content}"
           GÖREV: Duygu analizi yap ve en uygun kategoriyi seç.
           KATEGORİLER: "genel", "duyuru", "etkinlik", "ariza-kayip", "satilik", "soru-cevap".
           DUYGULAR: "Neşeli", "Hüzünlü", "Kızgın", "Endişeli", "Sakin", "Meraklı", "Ciddi".
           FORMAT (JSON): {"sentiment": "...", "sentimentScore": 0.5, "category": "slug"}`
        : `ANALİZ: "${content}"
           GÖREV: SADECE duygu analizi yap. Kategori belirleme.
           DUYGULAR: "Neşeli", "Hüzünlü", "Kızgın", "Endişeli", "Sakin", "Meraklı", "Ciddi".
           FORMAT (JSON): {"sentiment": "...", "sentimentScore": 0.5, "category": null}`;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      // JSON Çıkarma: İlk { ve son } arasını bul (Gemma'nın fazladan metinlerini temizler)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Gelen yanıtta JSON verisi bulunamadı.');
      }
      
      const analysis = JSON.parse(jsonMatch[0]);

      return {
        sentiment: analysis.sentiment || 'Sakin',
        sentimentScore: analysis.sentimentScore || 0.5,
        suggestedCategorySlug: includeCategory ? (analysis.category || 'genel') : null,
      };
    } catch (error) {
      if (error.message?.includes('429')) {
        this.logger.warn('AI Kota sınırı aşıldı, varsayılan değerler kullanılıyor.');
      } else {
        this.logger.error('AI Analiz Hatası:', error.message);
      }
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
