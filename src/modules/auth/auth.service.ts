import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { LoginUserDto } from './dto/login.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

/**
 * AuthService gère l'authentification et l'inscription des utilisateurs.
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Inscrit un nouvel utilisateur.
   * @param registerUserDto - Les informations de l'utilisateur à enregistrer.
   * @returns Un jeton d'accès JWT.
   * @throws ConflictException si le pseudonyme est déjà utilisé.
   */
  async register(
    registerUserDto: RegisterUserDto,
  ): Promise<{ access_token: string }> {
    const queryRunner =
      this.usersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.info("Début de l'inscription d'un nouvel utilisateur", {
        registerUserDto,
      });

      const existingUser = await queryRunner.manager.findOne(User, {
        where: { pseudonyme: registerUserDto.pseudonyme },
      });

      if (existingUser) {
        this.logger.warn('Un utilisateur avec ce pseudonyme existe déjà', {
          pseudonyme: registerUserDto.pseudonyme,
        });
        throw new ConflictException(
          'Un utilisateur avec ce pseudonyme existe déjà',
        );
      }

      const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
      const user = queryRunner.manager.create(User, {
        ...registerUserDto,
        password: hashedPassword,
      });

      this.logger.info("Création de l'utilisateur", { user });

      await queryRunner.manager.save(user);

      this.logger.info('Utilisateur enregistré, préparation du jeton JWT', {
        user,
      });

      const payload = {
        username: user.pseudonyme,
        sub: user.id,
        role: user.role,
      };

      const access_token = this.jwtService.sign(payload);
      this.logger.info('Jeton JWT généré', { access_token });

      await queryRunner.commitTransaction();

      this.logger.info("Transaction de l'inscription commitée avec succès", {
        user,
      });

      return { access_token };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error("Erreur lors de l'enregistrement de l'utilisateur", {
        message: error.message,
        stack: error.stack,
      });
      if (error instanceof ConflictException) {
        throw error; 
      }
      throw new BadRequestException(
        "Erreur lors de l'inscription",
        error.message,
      );
    } finally {
      await queryRunner.release();
      this.logger.info('QueryRunner libéré');
    }
  }

  /**
   * Authentifie un utilisateur et génère un jeton JWT.
   * @param loginUserDto - Les informations de connexion de l'utilisateur.
   * @returns Un jeton d'accès JWT.
   * @throws UnauthorizedException si les informations de connexion sont incorrectes.
   */
  async login(loginUserDto: LoginUserDto): Promise<{ access_token: string }> {
    const user = await this.usersRepository.findOne({
      where: { pseudonyme: loginUserDto.pseudonyme },
    });

    if (
      !user ||
      !(await bcrypt.compare(loginUserDto.password, user.password))
    ) {
      this.logger.warn('Tentative de connexion échouée', {
        pseudonyme: loginUserDto.pseudonyme,
      });
      throw new UnauthorizedException('Pseudonyme ou mot de passe incorrect');
    }

    const payload = {
      username: user.pseudonyme,
      sub: user.id,
      role: user.role,
    };
    const access_token = this.jwtService.sign(payload);

    this.logger.info('Utilisateur connecté avec succès', { user });

    return { access_token };
  }
}
