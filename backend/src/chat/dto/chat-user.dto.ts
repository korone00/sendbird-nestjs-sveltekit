import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class ChatUserDto {
  @ApiProperty({ description: '' })
  @IsBoolean()
  isOnline: boolean;

  @ApiProperty({ description: '' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: '' })
  @IsString()
  id: string;

  @ApiProperty({ description: '' })
  @IsString()
  nickname: string;

  @ApiProperty({ description: '' })
  @IsString()
  profileUrl: string;
}
