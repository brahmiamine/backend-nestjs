import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  Matches,
  IsOptional,
  IsEnum,
} from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ description: 'Le pseudonyme unique utilisateur' })
  @IsString()
  pseudonyme: string;

  @ApiProperty({ description: 'Le mot de passe sécurisé utilisateur' })
  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit comporter au moins 8 caractères',
  })
  @Matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message: 'Mot de passe trop faible',
  })
  password: string;

  @ApiProperty({ description: 'Le nom utilisateur', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Adresse utilisateur', required: false })
  @IsOptional()
  @IsString()
  adresse?: string;

  @ApiProperty({
    description: "Un commentaire sur l'utilisateur",
    required: false,
  })
  @IsOptional()
  @IsString()
  commentaire?: string;

  @ApiProperty({ description: 'Rôle utilisateur', enum: ['admin', 'user'] })
  @IsEnum(['admin', 'user'])
  role: 'admin' | 'user';
}
