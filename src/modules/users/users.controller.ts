import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
/**
 * UsersController gère les opérations CRUD pour les utilisateurs.
 */
@ApiTags('users') 
@ApiBearerAuth('access-token') 
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Récupère les informations de l'utilisateur connecté.
   * @param req - La requête HTTP.
   * @returns Les informations de l'utilisateur connecté.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    const userId = req.user['userId'];
    const data = await this.usersService.findOne(userId);
    this.logger.info('Utilisateur connecté récupéré via le contrôleur', {
      user: data,
    });
    return {
      message: 'Utilisateur récupéré avec succès',
      data,
    };
  }

  /**
   * Met à jour les informations de l'utilisateur connecté.
   * @param req - La requête HTTP.
   * @param updateUserDto - Les nouvelles informations de l'utilisateur.
   * @returns Les informations mises à jour de l'utilisateur.
   */
  @ApiOperation({ summary: 'Mettre à jour utilisateur par ID' })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur mis à jour avec succès.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user['userId'];
    const data = await this.usersService.update(userId, updateUserDto);
    this.logger.info('Utilisateur connecté mis à jour via le contrôleur', {
      user: data,
    });
    return {
      message: 'Utilisateur mis à jour avec succès',
      data,
    };
  }

  @ApiOperation({ summary: 'Obtenez tous les utilisateurs' })
  @ApiResponse({
    status: 200,
    description: 'Utilisateurs récupérés avec succès.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async findAll(@Query() query: any) {
    const { data, total } = await this.usersService.findAll(query);
    this.logger.info('Liste des utilisateurs récupérée via le contrôleur', {
      total,
    });
    return {
      message: 'Utilisateurs récupérés avec succès',
      data,
      total,
      page: query.page || 1,
      limit: query.limit || 10,
    };
  }

  /**
   * Supprime un utilisateur par ID.
   * @param id - L'ID de l'utilisateur à supprimer.
   * @returns Un message de confirmation.
   */
  @ApiOperation({ summary: 'Supprimer utilisateur par ID' })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur supprimé avec succès.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.usersService.remove(+id);
      this.logger.info('Utilisateur supprimé via le contrôleur', { id });
      return { message: 'Utilisateur supprimé avec succès' };
    } catch (error) {
      this.logger.error(
        "Erreur lors de la suppression de l'utilisateur via le contrôleur",
        {
          message: error.message,
          stack: error.stack,
        },
      );
      throw new InternalServerErrorException(
        "Erreur lors de la suppression de l'utilisateur",
      );
    }
  }
}
