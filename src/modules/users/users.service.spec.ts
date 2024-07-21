import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
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
        save: jest.fn(),
        remove: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            manager: {
              connection: {
                createQueryRunner: jest.fn().mockReturnValue(queryRunner),
              },
            },
            findOne: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: logger,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const user = { id: 1, pseudonyme: 'testuser' } as User;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.findOne(1);

      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      const users = [
        { id: 1, pseudonyme: 'testuser1' },
        { id: 2, pseudonyme: 'testuser2' },
      ] as User[];
      const response = { data: users, total: users.length };

      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue({
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([users, users.length]),
      } as any);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual(response);
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const user = {
        id: 1,
        pseudonyme: 'testuser',
        password: 'oldpassword',
      } as User;

      const updatedUser = {
        id: 1,
        pseudonyme: 'testuser',
        password: 'newpassword',
      } as User;

      jest
        .spyOn(userRepository.manager.connection, 'createQueryRunner')
        .mockReturnValue(queryRunner);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(queryRunner.manager, 'save').mockResolvedValue(updatedUser);

      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => 'newpassword' as never);

      const result = await service.update(1, { password: 'newpassword' });

      expect(result).toEqual(updatedUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(queryRunner.manager.save).toHaveBeenCalledWith({
        ...user,
        password: 'newpassword',
      });
    });
  });

  describe('remove', () => {
    it('should remove the user', async () => {
      const user = { id: 1, pseudonyme: 'testuser' } as User;
      jest
        .spyOn(userRepository.manager.connection, 'createQueryRunner')
        .mockReturnValue(queryRunner);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(queryRunner.manager, 'remove').mockResolvedValue(user);

      await service.remove(1);

      expect(queryRunner.manager.remove).toHaveBeenCalledWith(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest
        .spyOn(userRepository.manager.connection, 'createQueryRunner')
        .mockReturnValue(queryRunner);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
