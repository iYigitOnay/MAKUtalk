import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  /**
   * Post içeriğine göre kategori önerir
   * İleride GPT API veya lokal model (Ollama) ile entegre edilecek
   */
  async suggestCategory(content: string): Promise<number | null> {
    // Şu an basit keyword matching
    // İleride: OpenAI API veya local LLM
    const lowerContent = content.toLowerCase();

    // Duyuru keywords
    if (
      lowerContent.includes('duyuru') ||
      lowerContent.includes('önemli') ||
      lowerContent.includes('dikkat')
    ) {
      return 1; // Duyuru category ID
    }

    // Etkinlik keywords
    if (
      lowerContent.includes('etkinlik') ||
      lowerContent.includes('konser') ||
      lowerContent.includes('seminer') ||
      lowerContent.includes('toplantı')
    ) {
      return 2; // Etkinlik category ID
    }

    // Soru-Cevap keywords
    if (
      lowerContent.includes('?') ||
      lowerContent.includes('nasıl') ||
      lowerContent.includes('neden') ||
      lowerContent.includes('soru')
    ) {
      return 3; // Soru-Cevap category ID
    }

    // Arıza-Kayıp keywords
    if (
      lowerContent.includes('kayıp') ||
      lowerContent.includes('arıza') ||
      lowerContent.includes('kaybettim') ||
      lowerContent.includes('arıyorum')
    ) {
      return 5; // Arıza-Kayıp category ID
    }

    // Satılık keywords
    if (
      lowerContent.includes('satılık') ||
      lowerContent.includes('satıyorum') ||
      lowerContent.includes('fiyat') ||
      lowerContent.includes('tl')
    ) {
      return 6; // Satılık category ID
    }

    return 4; // Default: Genel
  }

  /**
   * Sentiment analizi yapar
   * İleride: Hugging Face Transformers veya GPT API
   */
  async analyzeSentiment(content: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
  }> {
    const lowerContent = content.toLowerCase();

    // Basit pozitif/negatif kelime listesi
    const positiveWords = [
      'güzel',
      'harika',
      'süper',
      'mükemmel',
      'teşekkür',
      'mutlu',
      'sevindim',
      'başarılı',
    ];
    const negativeWords = [
      'kötü',
      'berbat',
      'üzgün',
      'sinir',
      'kızgın',
      'başarısız',
      'sorun',
      'problem',
    ];

    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach((word) => {
      if (lowerContent.includes(word)) positiveCount++;
    });

    negativeWords.forEach((word) => {
      if (lowerContent.includes(word)) negativeCount++;
    });

    if (positiveCount > negativeCount) {
      return { sentiment: 'positive', score: 0.7 };
    } else if (negativeCount > positiveCount) {
      return { sentiment: 'negative', score: 0.7 };
    } else {
      return { sentiment: 'neutral', score: 0.5 };
    }
  }

  /**
   * İçerik moderasyonu - zararlı içerik tespiti
   * İleride: OpenAI Moderation API veya lokal model
   */
  async moderateContent(content: string): Promise<{
    safe: boolean;
    reasons?: string[];
  }> {
    const lowerContent = content.toLowerCase();

    // Basit kara liste
    const bannedWords = ['küfür1', 'küfür2', 'argo1']; // Gerçek kelimeleri ekle

    const foundBannedWords: string[] = [];
    bannedWords.forEach((word) => {
      if (lowerContent.includes(word)) {
        foundBannedWords.push(word);
      }
    });

    if (foundBannedWords.length > 0) {
      return {
        safe: false,
        reasons: ['Uygunsuz içerik tespit edildi'],
      };
    }

    return { safe: true };
  }

  /**
   * İleride entegre edilecek: OpenAI API
   */
  private async callOpenAI(prompt: string): Promise<string> {
    // TODO: OpenAI API integration
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {...})
    return 'AI response placeholder';
  }

  /**
   * İleride entegre edilecek: Ollama (local LLM)
   */
  private async callOllama(prompt: string): Promise<string> {
    // TODO: Ollama integration
    // const response = await fetch('http://localhost:11434/api/generate', {...})
    return 'Ollama response placeholder';
  }
}
