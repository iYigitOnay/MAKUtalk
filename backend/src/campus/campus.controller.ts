import { Controller, Get } from '@nestjs/common';
import { CampusService } from './campus.service';

@Controller('campus')
export class CampusController {
  constructor(private readonly campusService: CampusService) {}

  @Get('cafeteria')
  async getCafeteria() {
    return this.campusService.getCafeteriaMenu();
  }
}
