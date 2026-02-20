import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('suggest-category')
  async suggestCategory(@Body('content') content: string) {
    const categoryId = await this.aiService.suggestCategory(content);
    return { categoryId };
  }

  @Post('analyze-sentiment')
  async analyzeSentiment(@Body('content') content: string) {
    return this.aiService.analyzeSentiment(content);
  }

  @Post('moderate')
  async moderateContent(@Body('content') content: string) {
    return this.aiService.moderateContent(content);
  }
}
