import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sendbird from 'sendbird-platform-sdk-typescript';
import { ChatCreateUserDto } from './dto/chat-create-user.dto';
import { ChatUserDto } from './dto/chat-user.dto';
import { ChatUserTokenDto } from './dto/chat-user-token.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly userAPI: sendbird.UserApi;
  private readonly sendbirdAppId: string;
  private readonly sendbirdApiToken: string;

  constructor(private readonly configService: ConfigService) {
    this.sendbirdAppId = this.configService.get<string>('SENDBIRD_APP_ID');
    this.sendbirdApiToken =
      this.configService.get<string>('SENDBIRD_API_TOKEN');

    const serverConfig = new sendbird.ServerConfiguration(
      'https://api-{app_id}.sendbird.com',
      { app_id: this.sendbirdAppId },
    );
    const configuration = sendbird.createConfiguration({
      baseServer: serverConfig,
    });
    this.userAPI = new sendbird.UserApi(configuration);
  }

  async createUser(data: ChatCreateUserDto) {
    try {
      const userData: sendbird.CreateUserData = {
        userId: data.id,
        nickname: data.nickname,
        profileUrl: 'https://cataas.com/cat',
      };

      const user = await this.userAPI.createUser(
        this.sendbirdApiToken,
        userData,
      );
      this.logger.log(`User created: ${JSON.stringify(user)}`);
    } catch (error) {
      //   console.log('error', error);
      let message = error.message;
      //   console.log(message);

      if (error.body) {
        try {
          const errorBody = JSON.parse(error.body);
          message = errorBody.message || message;
        } catch (parseError) {
          console.error('Failed to parse error body:', parseError);
        }
      }

      this.logger.error('Failed to create user', message);
      throw new HttpException(
        {
          statusCode: error.code || 500,
          message: message,
        },
        error.code || 500,
      );
    }
  }

  async createUserToken(userId: string): Promise<ChatUserTokenDto> {
    try {
      console.log('userId', userId);

      const data: sendbird.CreateUserTokenData = {
        expiresAt: new Date().getTime() + 1000 * 60 * 60 * 24, // 24 hours
      };

      const result = await this.userAPI.createUserToken(
        userId,
        this.sendbirdApiToken,
        data,
      );
      this.logger.log(`Result: ${JSON.stringify(result)}`);
      return {
        token: result.token,
        expiresAt: result.expiresAt,
      };
    } catch (error) {
      //   console.log('error', error);
      let message = error.message;
      //   console.log(message);

      if (error.body) {
        try {
          const errorBody = JSON.parse(error.body);
          message = errorBody.message || message;
        } catch (parseError) {
          console.error('Failed to parse error body:', parseError);
        }
      }

      this.logger.error('Failed to createUserToken', message);
      throw new HttpException(
        {
          statusCode: error.code || 500,
          message: message,
        },
        error.code || 500,
      );
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const result = await this.userAPI.deleteUserById(
        userId,
        this.sendbirdApiToken,
      );
      this.logger.log(`User deleted: ${JSON.stringify(result)}`);
    } catch (error) {
      //   console.log('error', error);
      let message = error.message;
      //   console.log(message);

      if (error.body) {
        try {
          const errorBody = JSON.parse(error.body);
          message = errorBody.message || message;
        } catch (parseError) {
          console.error('Failed to parse error body:', parseError);
        }
      }

      this.logger.error('Failed to delete user', message);
      throw new HttpException(
        {
          statusCode: error.code || 500,
          message: message,
        },
        error.code || 500,
      );
    }
  }

  async listUsers(): Promise<ChatUserDto[]> {
    try {
      const result = await this.userAPI.listUsers(
        this.sendbirdApiToken,
        '', // token
        10, // limit
      );
      this.logger.log(`List: ${JSON.stringify(result)}`);

      let chatUsers: ChatUserDto[] = [];
      result.users.map((user) => {
        chatUsers.push({
          isOnline: user.isOnline,
          isActive: user.isActive,
          id: user.userId,
          nickname: user.nickname,
          profileUrl: user.profileUrl,
        });
      });
      return chatUsers;
    } catch (error) {
      let message = error.message;

      if (error.body) {
        try {
          const errorBody = JSON.parse(error.body);
          message = errorBody.message || message;
        } catch (parseError) {
          console.error('Failed to parse error body:', parseError);
        }
      }

      this.logger.error('Failed to list of user', message);
      throw new HttpException(
        {
          statusCode: error.code || 500,
          message: message,
        },
        error.code || 500,
      );
    }
  }
}
