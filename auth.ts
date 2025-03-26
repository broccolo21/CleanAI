// Configurazione autenticazione e autorizzazione per CleanAI
// Questo file gestisce l'autenticazione con JWT e i ruoli utente

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { supabase } from './supabase-config';

// Servizio di autenticazione
@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // Login utente
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedException('Credenziali non valide');
    }

    // Recupera i dettagli dell'utente dal database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) {
      throw new UnauthorizedException('Utente non trovato');
    }

    // Genera il token JWT
    const payload = {
      sub: userData.id,
      email: userData.email,
      role: userData.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: userData,
    };
  }

  // Registrazione utente
  async register(userData: any) {
    // Registra l'utente in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (error) {
      throw new Error(`Errore nella registrazione: ${error.message}`);
    }

    // Crea il record utente nel database
    const newUser = {
      id: data.user.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'operator', // Ruolo predefinito
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { error: insertError } = await supabase.from('users').insert(newUser);

    if (insertError) {
      throw new Error(`Errore nell'inserimento utente: ${insertError.message}`);
    }

    return {
      message: 'Utente registrato con successo',
      user: newUser,
    };
  }

  // Verifica token JWT
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      
      // Verifica che l'utente esista ancora nel database
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', payload.sub)
        .single();

      if (error || !data) {
        throw new UnauthorizedException('Utente non valido');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token non valido');
    }
  }
}

// Strategia JWT per Passport
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'cleanai-secret-key',
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}

// Guard per l'autenticazione JWT
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

// Guard per i ruoli
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}

// Decoratore per i ruoli
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Controller per l'autenticazione
import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login utente' })
  @ApiResponse({ status: 200, description: 'Login effettuato con successo' })
  @ApiResponse({ status: 401, description: 'Credenziali non valide' })
  async login(@Body() loginDto: { email: string; password: string }) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrazione utente' })
  @ApiResponse({ status: 201, description: 'Utente registrato con successo' })
  @ApiResponse({ status: 400, description: 'Dati non validi' })
  async register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Profilo utente' })
  @ApiResponse({ status: 200, description: 'Profilo utente' })
  @ApiResponse({ status: 401, description: 'Non autorizzato' })
  getProfile(@Request() req) {
    return req.user;
  }
}

// Modulo di autenticazione
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'cleanai-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [AuthService, JwtStrategy, RolesGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
