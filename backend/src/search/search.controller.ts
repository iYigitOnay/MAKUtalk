// src/search/search.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(
    @Query('q') query: string,
    @Query('currentUserId') currentUserId?: string,
  ) {
    return this.searchService.search(
      query,
      currentUserId ? +currentUserId : undefined,
    );
  }

  @Get('hashtags/popular')
  getPopularHashtags(@Query('limit') limit?: string) {
    return this.searchService.getPopularHashtags(limit ? +limit : 10);
  }

  @Get('hashtag')
  searchByHashtag(
    @Query('tag') tag: string,
    @Query('currentUserId') currentUserId?: string,
  ) {
    return this.searchService.searchByHashtag(
      tag,
      currentUserId ? +currentUserId : undefined,
    );
  }
}
