import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { HashtagService } from './hashtag.service';

@Controller('hashtags')
export class HashtagController {
  constructor(private readonly hashtagService: HashtagService) {}

  @Get('trending')
  getTrending(@Query('limit', ParseIntPipe) limit?: number) {
    return this.hashtagService.getTrendingHashtags(limit || 10);
  }

  @Get(':tag/posts')
  getPostsByHashtag(
    @Param('tag') tag: string,
    @Query('userId', ParseIntPipe) userId?: number,
  ) {
    return this.hashtagService.getPostsByHashtag(tag, userId);
  }
}
