import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  Matches,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: 'Le nom utilisateur', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Adresse utilisateur', required: false })
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiProperty({ description: 'Un commentaire utilisateur', required: false })
  @IsOptional()
  @IsString()
  commentaire?: string;

  @ApiProperty({
    description: 'Rôle utilisateur',
    enum: ['admin', 'user'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['admin', 'user'])
  role?: 'admin' | 'user';

  @ApiProperty({
    description: 'Le mot de passe sécurisé utilisateur',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit comporter au moins 8 caractères',
  })
  @Matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message: 'Mot de passe trop faible',
  })
  password?: string;
}
