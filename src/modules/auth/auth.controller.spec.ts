import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../common/services/redis.service';
import { ConfigService } from '@nestjs/config';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let redisService: RedisService;
  let logger: any;

  beforeEach(async () => {
    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        RedisService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('someToken'),
          },
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: logger,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('someValue'),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    redisService = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return access token', async () => {
      const registerUserDto: RegisterUserDto = {
        pseudonyme: 'testuser',
        password: 'Password1!',
        name: 'Test User',
        adresse: '123 Test St',
        commentaire: 'This is a test user',
        role: 'user',
      };

      const accessToken = { access_token: 'someToken' };

      jest.spyOn(service, 'register').mockResolvedValue(accessToken);

      const result = await controller.register(registerUserDto);

      expect(result).toEqual({
        message: 'Utilisateur enregistré avec succès',
        data: accessToken,
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerUserDto: RegisterUserDto = {
        pseudonyme: 'testuser',
        password: 'Password1!',
        name: 'Test User',
        adresse: '123 Test St',
        commentaire: 'This is a test user',
        role: 'user',
      };

      jest
        .spyOn(service, 'register')
        .mockRejectedValue(new ConflictException('Conflict'));

      await expect(controller.register(registerUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should login a user and return access token', async () => {
      const loginUserDto: LoginUserDto = {
        pseudonyme: 'testuser',
        password: 'Password1!',
      };

      const accessToken = { access_token: 'someToken' };

      jest.spyOn(service, 'login').mockResolvedValue(accessToken);

      const result = await controller.login(loginUserDto);

      expect(result).toEqual({
        message: 'Utilisateur connecté avec succès',
        data: accessToken,
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginUserDto: LoginUserDto = {
        pseudonyme: 'testuser',
        password: 'wrongpassword',
      };

      jest
        .spyOn(service, 'login')
        .mockRejectedValue(new UnauthorizedException());

      await expect(controller.login(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should log out a user and return success message', async () => {
      const req = {
        headers: {
          authorization: 'Bearer someToken',
        },
      };

      jest.spyOn(redisService, 'addToBlacklist').mockResolvedValue(undefined);

      const result = await controller.logout(req as any);

      expect(result).toEqual({ message: 'Déconnexion réussie' });
    });

    it('should throw UnauthorizedException if authorization header is missing', async () => {
      const req = {
        headers: {},
      };

      await expect(controller.logout(req as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
