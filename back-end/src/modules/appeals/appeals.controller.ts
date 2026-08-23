import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { AppRole } from '../rbac/role.enum';
import { AppealsService } from './appeals.service';

@ApiTags('appeals')
@Controller('appeals')
export class AppealsController {
  constructor(private readonly service: AppealsService) {}

  @Get()
  @Roles(AppRole.ADMIN, AppRole.MODERATOR)
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @Roles(AppRole.ADMIN, AppRole.COMMUNITY_MANAGER, AppRole.MODERATOR, AppRole.USER)
  create(@Body() payload: any) {
    return this.service.create(payload);
  }

  @Post(':id/evidence')
  @Roles(AppRole.ADMIN, AppRole.COMMUNITY_MANAGER, AppRole.MODERATOR, AppRole.USER)
  addEvidence(@Param('id', ParseIntPipe) id: number, @Body() payload: any) {
    return this.service.addEvidence(id, payload);
  }
}
