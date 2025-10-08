import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from '@app/contracts/users/updateUser.dto';
import { JwtAuthGuard } from '@app/contracts/authentication/guards/jwt-auth.guard';
import { GetCurrentUser } from '@app/contracts/authentication/decorators/get-current-user.decorator';
import { GetCurrentUserId } from '@app/contracts/authentication/decorators/get-current-user-id.decorator';
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
    description: "Retourne les informations de l'utilisateur connecté",
  })
  @ApiResponse({
    status: 200,
    description: 'Profil récupéré avec succès',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur introuvable',
  })
  findMe(@GetCurrentUserId() id: string, @GetCurrentUser() requester: any) {
    return this.usersService.findUserById(id).pipe(
      map((dbUser) => {
        if (!dbUser) {
          throw new NotFoundException(`User ${id} not found`);
        }
        return { user: dbUser, requester };
      }),
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Modifier un utilisateur',
    description: "Met à jour les informations d'un utilisateur",
  })
  @ApiParam({
    name: 'id',
    description: "ID de l'utilisateur (UUID)",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur modifié avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur introuvable',
  })
  updateUserById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUserById(dto, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer un utilisateur',
    description:
      "Supprime définitivement un utilisateur (conforme RGPD - droit à l'oubli)",
  })
  @ApiParam({
    name: 'id',
    description: "ID de l'utilisateur (UUID)",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Utilisateur supprimé avec succès',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur introuvable',
  })
  deleteUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.deleteUserById(id);
  }

  @Patch(':id/password')
  @ApiOperation({
    summary: 'Changer le mot de passe',
    description: "Met à jour le mot de passe d'un utilisateur",
  })
  @ApiParam({
    name: 'id',
    description: "ID de l'utilisateur (UUID)",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        password: {
          type: 'string',
          description: 'Nouveau mot de passe (min 8 caractères)',
          example: 'NewPassword123!',
          minLength: 8,
        },
      },
      required: ['password'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Mot de passe modifié avec succès',
  })
  @ApiResponse({
    status: 400,
    description: 'Mot de passe invalide',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  updateUserPasswordById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: { password: string },
  ) {
    const { password } = body;
    return this.usersService.updateUserPasswordById(id, password);
  }
}
