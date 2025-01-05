import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChatCreateUserDto } from './dto/chat-create-user.dto';
import { ChatUserDto } from './dto/chat-user.dto';
import { ChatUserTokenDto } from './dto/chat-user-token.dto';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly chatService: ChatService,
  ) {}

  @Post('create-user')
  @ApiOperation({
    summary: 'Create a user',
    description:
      'Creates a user in the chat application with the provided user ID.',
  })
  @ApiOkResponse({
    description: 'User registered successfully',
    schema: {
      example: { statusCode: 201, message: 'User registered successfully' },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Conflict: User already exists' })
  createUser(@Body() data: ChatCreateUserDto): Promise<any> {
    return this.chatService.createUser(data);
  }

  @Get('create-user-token')
  @ApiOperation({
    summary: 'Create a user token',
    description: 'Creates a user token for the provided user ID.',
  })
  @ApiOkResponse({
    description: 'User token created successfully',
    schema: {
      example: { statusCode: 201, message: 'User token created successfully' },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createUserToken(@Query('userId') userId: string): Promise<ChatUserTokenDto> {
    return this.chatService.createUserToken(userId);
  }

  @Get('delete-user')
  @ApiOperation({
    summary: 'Delete a user',
    description:
      'Deletes a user from the chat application with the provided user ID.',
  })
  async deleteUser(@Query('userId') userId: string): Promise<void> {
    return this.chatService.deleteUser(userId);
  }

  @Get('list-users')
  @ApiOperation({
    summary: 'List all users',
    description:
      'Lists all users registered in the chat application with their details.',
  })
  async listUsers(): Promise<ChatUserDto[]> {
    return this.chatService.listUsers();
  }
}
