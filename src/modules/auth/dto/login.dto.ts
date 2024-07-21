import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Matches } from 'class-validator';

export class LoginUserDto {
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
}
