import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import {
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let logger: any;
  let queryRunner: any;

  beforeEach(async () => {
    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        create: jest.fn().mockImplementation((entity: any) => entity),
        save: jest.fn(),
        remove: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            manager: {
              connection: {
                createQueryRunner: jest.fn().mockReturnValue(queryRunner),
              },
            },
            findOne: jest.fn(),
            create: jest.fn().mockImplementation((entity: any) => entity),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: logger,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should create a new user and return access token', async () => {
      const registerUserDto: RegisterUserDto = {
        pseudonyme: 'testuser',
        password: 'Password1!',
        name: 'Test User',
        adresse: '123 Test St',
        commentaire: 'This is a test user',
        role: 'user',
      };

      const user = new User();
      user.pseudonyme = registerUserDto.pseudonyme;
      user.password = await bcrypt.hash(registerUserDto.password, 10);
      user.name = registerUserDto.name;
      user.adresse = registerUserDto.adresse;
      user.commentaire = registerUserDto.commentaire;
      user.role = registerUserDto.role;

      jest
        .spyOn(userRepository.manager.connection, 'createQueryRunner')
        .mockReturnValue(queryRunner);
      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue(null);
      jest.spyOn(queryRunner.manager, 'save').mockResolvedValue(user);
      jest.spyOn(jwtService, 'sign').mockReturnValue('access_token');

      const result = await service.register(registerUserDto);

      expect(result).toEqual({ access_token: 'access_token' });
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

      const existingUser = new User();
      existingUser.pseudonyme = registerUserDto.pseudonyme;

      jest
        .spyOn(userRepository.manager.connection, 'createQueryRunner')
        .mockReturnValue(queryRunner);
      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockResolvedValue(existingUser);

      await expect(service.register(registerUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException on error', async () => {
      const registerUserDto: RegisterUserDto = {
        pseudonyme: 'testuser',
        password: 'Password1!',
        name: 'Test User',
        adresse: '123 Test St',
        commentaire: 'This is a test user',
        role: 'user',
      };

      jest
        .spyOn(userRepository.manager.connection, 'createQueryRunner')
        .mockReturnValue(queryRunner);
      jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockRejectedValue(new Error('Error'));

      await expect(service.register(registerUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should return JWT token for valid credentials', async () => {
      const loginUserDto: LoginUserDto = {
        pseudonyme: 'testuser',
        password: 'Password1!',
      };

      const user = new User();
      user.pseudonyme = loginUserDto.pseudonyme;
      user.password = await bcrypt.hash(loginUserDto.password, 10);
      user.role = 'user';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(jwtService, 'sign').mockReturnValue('access_token');

      const result = await service.login(loginUserDto);

      expect(result).toEqual({ access_token: 'access_token' });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginUserDto: LoginUserDto = {
        pseudonyme: 'testuser',
        password: 'Password1!',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.login(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for incorrect password', async () => {
      const loginUserDto: LoginUserDto = {
        pseudonyme: 'testuser',
        password: 'Password1!',
      };

      const user = new User();
      user.pseudonyme = loginUserDto.pseudonyme;
      user.password = await bcrypt.hash('wrongpassword', 10);
      user.role = 'user';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
