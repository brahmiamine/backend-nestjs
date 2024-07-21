import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let logger: any;

  beforeEach(async () => {
    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: logger,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMe', () => {
    it('should return the current user', async () => {
      const user = plainToClass(User, {
        id: 1,
        pseudonyme: 'testuser',
        password: 'hashedpassword',
        role: 'user',
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          pseudonyme: 'testuser',
          role: 'user',
        }),
      });
      jest.spyOn(service, 'findOne').mockResolvedValue(user);

      const req = { user: { userId: 1 } } as any;

      const result = await controller.getMe(req);

      expect(result).toEqual({
        message: 'Utilisateur récupéré avec succès',
        data: user.toJSON(),
      });
    });
  });

  describe('updateMe', () => {
    it('should update and return the current user', async () => {
      const user = plainToClass(User, {
        id: 1,
        pseudonyme: 'testuser',
        password: 'hashedpassword',
        role: 'user',
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          pseudonyme: 'testuser',
          role: 'user',
          name: 'updatedUser',
        }),
      });
      const updateUserDto = { name: 'updatedUser' };

      jest.spyOn(service, 'update').mockResolvedValue({
        ...user,
        ...updateUserDto,
      } as any);

      const req = { user: { userId: 1 } } as any;

      const result = await controller.updateMe(req, updateUserDto);

      expect(result).toEqual({
        message: 'Utilisateur mis à jour avec succès',
        data: {
          ...user.toJSON(),
          ...updateUserDto,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      const users = [
        plainToClass(User, {
          id: 1,
          pseudonyme: 'testuser1',
          password: 'hashedpassword1',
          role: 'user',
          toJSON: jest.fn().mockReturnValue({
            id: 1,
            pseudonyme: 'testuser1',
            role: 'user',
          }),
        }),
        plainToClass(User, {
          id: 2,
          pseudonyme: 'testuser2',
          password: 'hashedpassword2',
          role: 'admin',
          toJSON: jest.fn().mockReturnValue({
            id: 2,
            pseudonyme: 'testuser2',
            role: 'admin',
          }),
        }),
      ];
      const response = { data: users, total: users.length, page: 1, limit: 10 };

      jest.spyOn(service, 'findAll').mockResolvedValue(response);

      const result = await controller.findAll({});

      expect(result).toEqual({
        message: 'Utilisateurs récupérés avec succès',
        data: users.map((user) => user.toJSON()),
        total: users.length,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('remove', () => {
    it('should remove a user and return a success message', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result).toEqual({ message: 'Utilisateur supprimé avec succès' });
    });

    it('should throw InternalServerErrorException if user not found', async () => {
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException());

      await expect(controller.remove('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
