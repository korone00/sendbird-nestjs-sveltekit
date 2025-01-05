import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ChatUserTokenDto {
  @ApiProperty({ description: '' })
  @IsString()
  token: string;

  @ApiProperty({ description: '' })
  @IsNumber()
  expiresAt: number;
}
