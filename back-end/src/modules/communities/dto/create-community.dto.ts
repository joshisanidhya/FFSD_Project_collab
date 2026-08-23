import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateCommunityDto {
  @ApiProperty({ minLength: 3, maxLength: 50, example: 'MOBA Masters' })
  @IsString()
  @Length(3, 50)
  name!: string;

  @ApiProperty({ minLength: 10, maxLength: 200, example: 'Community for strategy and ranked discussions' })
  @IsString()
  @Length(10, 200)
  description!: string;

  @ApiProperty({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  ownerId?: number;

  @ApiProperty({ type: [String], example: ['moba', 'ranked'] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @Length(2, 20, { each: true })
  tags!: string[];

  @ApiPropertyOptional({ type: [String], example: ['general', 'fps-chat'], description: 'Channels created in the community wizard' })
  @IsOptional()
  @IsArray()
  channels?: Array<string | { id?: string; name: string; type?: string }>;
}
