import {
  Body,
  Controller,
  Get,
  Patch,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from '@app/contracts/users/dto/updateUser.dto';
import { UpdatePasswordDto } from '@app/contracts/users/dto/updatePassword.dto';
import { JwtAuthGuard } from '@app/contracts/authentication/guards/jwt-auth.guard';
import { GetCurrentUserId } from '@app/contracts/authentication/decorators/get-current-user-id.decorator';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Récupérer mon profil',
    description:
      "Retourne les informations de l'utilisateur connecté (basé sur le token JWT)",
  })
  @ApiResponse({
    status: 200,
    description: 'Profil récupéré avec succès',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié - Token JWT invalide ou manquant',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur introuvable',
  })
  getMyProfile(@GetCurrentUserId() userId: string) {
    return this.usersService.findUserById(userId);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Modifier mon profil',
    description:
      'Met à jour les informations de mon compte utilisateur (basé sur le token JWT)',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Profil modifié avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides - Vérifier le format des champs',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié - Token JWT invalide ou manquant',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur introuvable',
  })
  updateMyProfile(
    @GetCurrentUserId() userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    // ✅ Ordre corrigé: userId d'abord, dto ensuite
    return this.usersService.updateUserById(userId, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer mon compte',
    description:
      "Supprime définitivement mon compte utilisateur (conforme RGPD - droit à l'oubli). Attention : cette action est irréversible !",
  })
  @ApiResponse({
    status: 204,
    description: 'Compte supprimé avec succès',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié - Token JWT invalide ou manquant',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur introuvable',
  })
  deleteMyAccount(@GetCurrentUserId() userId: string): Observable<void> {
    return this.usersService.deleteUserById(userId);
  }

  @Patch('me/password')
  @ApiOperation({
    summary: 'Changer mon mot de passe',
    description: 'Met à jour mon mot de passe (basé sur le token JWT)',
  })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe modifié avec succès',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Password updated successfully' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Mot de passe invalide - Minimum 8 caractères requis',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié - Token JWT invalide ou manquant',
  })
  @ApiResponse({
    status: 404,
    description: 'Compte utilisateur introuvable',
  })
  updateMyPassword(
    @GetCurrentUserId() userId: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    // ✅ Utilisation correcte de map pour transformer l'Observable
    return this.usersService.updateUserPasswordById(userId, dto.password).pipe(
      map((result) => ({
        message: 'Password updated successfully',
        updatedAt: result.updatedAt,
      })),
    );
  }
}
