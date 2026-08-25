import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class ReactMessageDto {
  @ApiPropertyOptional({ example: '👍' })
  @IsOptional()
  @IsString()
  @Length(1, 8)
  emoji?: string;
}
