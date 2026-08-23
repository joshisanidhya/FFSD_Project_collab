import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { AppRole } from '../rbac/role.enum';
import { MessagesService } from './messages.service';

@ApiTags('messages')
@Controller()
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Get('channels/:id/messages')
  @Roles(AppRole.ADMIN, AppRole.COMMUNITY_MANAGER, AppRole.MODERATOR, AppRole.USER)
  findByChannel(@Param('id') channelId: string) {
    return this.service.findByChannel(channelId);
  }

  @Post('messages')
  @Roles(AppRole.ADMIN, AppRole.COMMUNITY_MANAGER, AppRole.MODERATOR, AppRole.USER)
  create(@Body() payload: any) {
    return this.service.create(payload);
  }

  @Post('messages/:id/reactions')
  @Roles(AppRole.ADMIN, AppRole.COMMUNITY_MANAGER, AppRole.MODERATOR, AppRole.USER)
  react(@Param('id', ParseIntPipe) id: number, @Body() payload: any) {
    return this.service.react(id, payload.emoji || '👍');
  }

  @Patch('messages/:id/pin')
  @Roles(AppRole.ADMIN, AppRole.COMMUNITY_MANAGER, AppRole.MODERATOR, AppRole.USER)
  pin(@Param('id', ParseIntPipe) id: number) {
    return this.service.pin(id);
  }

  @Post('messages/:id/attachments')
  @Roles(AppRole.ADMIN, AppRole.COMMUNITY_MANAGER, AppRole.MODERATOR, AppRole.USER)
  addAttachment(@Param('id', ParseIntPipe) id: number, @Body() payload: any) {
    return this.service.addAttachment(id, payload.fileName || payload.url || 'attachment');
  }
}
