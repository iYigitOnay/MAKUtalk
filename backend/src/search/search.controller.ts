// src/search/search.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query('q') query: string, @Query('userId') userId?: string) {
    return this.searchService.search(query, userId ? +userId : undefined);
  }

  @Get('hashtags/popular')
  getPopularHashtags(@Query('limit') limit?: string) {
    return this.searchService.getPopularHashtags(limit ? +limit : 10);
  }

  @Get('hashtag')
  searchByHashtag(@Query('tag') tag: string, @Query('userId') userId?: string) {
    return this.searchService.searchByHashtag(
      tag,
      userId ? +userId : undefined,
    );
  }
}
