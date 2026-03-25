import { Controller, Get, Query } from '@nestjs/common';
import { CampusService } from './campus.service';

@Controller('campus')
export class CampusController {
  constructor(private readonly campusService: CampusService) {}

  @Get('cafeteria')
  async getCafeteria() {
    return this.campusService.getCafeteriaMenu();
  }

  @Get('analytics')
  async getAnalytics(
    @Query('interval')
    interval: 'hour' | 'day' | 'week' | '7months' | '4years' = 'day',
  ) {
    return this.campusService.getAnalytics(interval);
  }

  @Get('analytics/top-sentiment')
  async getTopSentimentPosts(
    @Query('sentiment') sentiment: string,
    @Query('interval') interval: string,
  ) {
    return this.campusService.getTopPostsBySentiment(sentiment, interval);
  }

  @Get('analytics/category-posts')
  async getCategoryPosts(
    @Query('categoryId') categoryId: string,
    @Query('interval') interval: string,
  ) {
    return this.campusService.getRecentPostsByCategory(
      BigInt(categoryId),
      interval,
    );
  }
}
