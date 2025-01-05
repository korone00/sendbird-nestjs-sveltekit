import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChatCreateUserDto {
  @ApiProperty({ description: 'The name of the user' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'The name of the user' })
  @IsString()
  nickname: string;
}
