import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RedisService } from '../../common/services/redis.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

/**
 * AuthController gère l'authentification et l'inscription des utilisateurs.
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private redisService: RedisService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Enregistre un nouvel utilisateur.
   * @param registerUserDto - Les informations de l'utilisateur à enregistrer.
   * @returns Un jeton d'accès JWT.
   * @throws BadRequestException si l'inscription échoue.
   */
  @ApiOperation({ summary: 'Enregistrez un nouvel utilisateur' })
  @ApiResponse({
    status: 201,
    description: 'Utilisateur enregistré avec succès',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    try {
      const data = await this.authService.register(registerUserDto);
      this.logger.info('Nouvel utilisateur enregistré via le contrôleur', {
        user: data,
      });
      return {
        message: 'Utilisateur enregistré avec succès',
        data,
      };
    } catch (error) {
      this.logger.error(
        "Erreur lors de l'enregistrement de l'utilisateur via le contrôleur",
        {
          message: error.message,
          stack: error.stack,
        },
      );
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(
        "Erreur lors de l'inscription",
        error.message,
      );
    }
  }

  /**
   * Connecte un utilisateur.
   * @param loginUserDto - Les informations de connexion de l'utilisateur.
   * @returns Un jeton d'accès JWT.
   * @throws BadRequestException si la connexion échoue.
   */
  @ApiOperation({ summary: 'Connectez un utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur connecté avec succès',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    try {
      const data = await this.authService.login(loginUserDto);
      this.logger.info('Utilisateur connecté via le contrôleur', {
        user: data,
      });
      return {
        message: 'Utilisateur connecté avec succès',
        data,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.logger.warn('Tentative de connexion échouée via le contrôleur', {
          pseudonyme: loginUserDto.pseudonyme,
        });
        throw error;
      }
      this.logger.error(
        "Erreur lors de la connexion de l'utilisateur via le contrôleur",
        { error },
      );
      throw new BadRequestException('Erreur lors de la connexion');
    }
  }

  /**
   * Déconnecte un utilisateur en invalidant son jeton JWT.
   * @param req - La requête HTTP contenant le jeton JWT.
   * @returns Un message de confirmation.
   * @throws UnauthorizedException si l'en-tête d'autorisation est manquant.
   */
  @ApiOperation({ summary: 'Déconnecter un utilisateur' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      this.logger.warn("Tentative de déconnexion sans en-tête d'autorisation");
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authHeader.split(' ')[1];
    await this.redisService.addToBlacklist(token);
    this.logger.info('Utilisateur déconnecté', { token });
    return { message: 'Déconnexion réussie' };
  }
}
