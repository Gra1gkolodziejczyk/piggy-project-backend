import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';
import { SignInDto } from '@app/contracts/authentication/dto/signin.dto';
import { SignUpDto } from '@app/contracts/authentication/dto/signup.dto';
import { GetCurrentUserId } from '@app/contracts/authentication/decorators/get-current-user-id.decorator';

@ApiTags('Authentication')
@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Se connecter',
    description:
      'Authentifie un utilisateur avec son email et mot de passe, retourne un token JWT',
  })
  @ApiBody({ type: SignInDto })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie - Token JWT retourné',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'Jean Dupont' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Identifiants incorrects',
  })
  @ApiResponse({
    status: 400,
    description: 'Données de requête invalides',
  })
  signIn(@Body() dto: SignInDto) {
    return this.authenticationService.signIn(dto);
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer un compte',
    description:
      'Enregistre un nouvel utilisateur et retourne un token JWT. Conforme RGPD.',
  })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({
    status: 201,
    description: 'Compte créé avec succès',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'Jean Dupont' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Email déjà utilisé ou données invalides',
  })
  @ApiResponse({
    status: 500,
    description: 'Erreur serveur',
  })
  signUp(@Body() dto: SignUpDto) {
    return this.authenticationService.signUp(dto);
  }

  @Post('signout/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Se déconnecter',
    description: "Déconnecte l'utilisateur connecté et invalide sa session",
  })
  @ApiResponse({
    status: 204,
    description: 'Déconnexion réussie',
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  signOut(@GetCurrentUserId() id: string) {
    return this.authenticationService.signOut(id);
  }
}
