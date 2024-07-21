import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { plainToClass } from 'class-transformer';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

/**
 * UsersService gère les opérations CRUD pour les utilisateurs.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Trouve un utilisateur par son ID.
   * @param id - L'ID de l'utilisateur.
   * @returns L'utilisateur correspondant à l'ID.
   * @throws NotFoundException si l'utilisateur n'est pas trouvé.
   */
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: id } });
    if (!user) {
      this.logger.warn('Utilisateur non trouvé', { id });
      throw new NotFoundException('Utilisateur non trouvé');
    }
    this.logger.info('Utilisateur trouvé', { user });
    return plainToClass(User, user);
  }

  /**
   * Met à jour les informations d'un utilisateur.
   * @param id - L'ID de l'utilisateur à mettre à jour.
   * @param updateUserDto - Les nouvelles informations de l'utilisateur.
   * @returns L'utilisateur mis à jour.
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const queryRunner =
      this.usersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.findOne(id);

      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      Object.assign(user, updateUserDto);
      await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();

      this.logger.info('Utilisateur mis à jour', { user });
      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error("Erreur lors de la mise à jour de l'utilisateur", {
        error,
      });
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Supprime un utilisateur par son ID.
   * @param id - L'ID de l'utilisateur à supprimer.
   * @throws NotFoundException si l'utilisateur n'est pas trouvé.
   */
  async remove(id: number): Promise<void> {
    const queryRunner =
      this.usersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.findOne(id);

      await queryRunner.manager.remove(user);
      await queryRunner.commitTransaction();

      this.logger.info('Utilisateur supprimé', { user });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error("Erreur lors de la suppression de l'utilisateur", {
        message: error.message,
        stack: error.stack,
      });
      throw new NotFoundException(
        "Erreur lors de la suppression de l'utilisateur",
      );
    } finally {
      await queryRunner.release();
      this.logger.info('QueryRunner libéré');
    }
  }

  /**
   * Trouve tous les utilisateurs avec pagination et filtrage.
   * @param query - Les paramètres de pagination et de filtrage.
   * @returns Un objet contenant les utilisateurs trouvés et le nombre total d'utilisateurs.
   */
  async findAll(query: any): Promise<{ data: User[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'id',
      order = 'ASC',
      role,
      ...filters
    } = query;
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    for (const key in filters) {
      if (filters.hasOwnProperty(key)) {
        queryBuilder.andWhere(`user.${key} LIKE :${key}`, {
          [key]: `%${filters[key]}%`,
        });
      }
    }

    queryBuilder
      .orderBy(
        `user.${sortBy}`,
        order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
      )
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    this.logger.info('Liste des utilisateurs récupérée', { query, total });
    return {
      data: data.map((user) => plainToClass(User, user)),
      total,
    };
  }
}
